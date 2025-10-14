/**
 * TranslationManager - Handles loading and applying translations
 */
class TranslationManager {
  constructor() {
    this.currentLanguage = null;
    this.translations = {};
    this.loadingIndicator = null;
    this.isLoading = false;
    this.cachedTranslations = {};
    this.defaultLanguage = 'pt-BR';
    this.supportedLanguages = ["en-US", "pt-BR", "jp-JP", "ru-RU", "hi-IN", "zh-CN"];

    // Create loading indicator
    this.createLoadingIndicator();
  }

  /**
   * Create a loading indicator element
   */
  createLoadingIndicator() {
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'translation-loading';
    this.loadingIndicator.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-globe fa-spin"></i>
      </div>
    `;
    document.body.appendChild(this.loadingIndicator);
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.isLoading = true;
    this.loadingIndicator.classList.add('visible');
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.isLoading = false;
    this.loadingIndicator.classList.remove('visible');
  }

  /**
   * Load translations for a specific language
   * @param {string} language - Language code to load
   * @returns {Promise<Object>} - Translation data
   */
  async loadTranslations(language) {
    // Validate language code
    if (!this.supportedLanguages.includes(language)) {
      console.warn(`Unsupported language: ${language}, falling back to ${this.defaultLanguage}`);
      language = this.defaultLanguage;
    }

    // Return cached translations if available
    if (this.cachedTranslations[language]) {
      return this.cachedTranslations[language];
    }

    try {
      this.showLoading();

      // Fetch translations with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`/static/translations/${language}.json`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error loading translations for ${language}: ${response.status}`);
      }

      const data = await response.json();

      // Cache the translations
      this.cachedTranslations[language] = data;

      return data;
    } catch (error) {
      console.error(`Translation loading error for ${language}:`, error);

      // If timeout or network error, try to get from cache or use default
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        console.warn('Network issue when loading translations, trying fallback...');

        // Try to get from localStorage cache
        try {
          const cachedData = localStorage.getItem(`translations_${language}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            this.cachedTranslations[language] = parsedData;
            return parsedData;
          }
        } catch (e) {
          console.error('Error reading from cache:', e);
        }
      }

      // If all else fails and we're not already trying the default, use default language
      if (language !== this.defaultLanguage) {
        console.warn(`Falling back to ${this.defaultLanguage} translations`);
        return this.loadTranslations(this.defaultLanguage);
      }

      // If even the default fails, return an empty object to prevent further errors
      return {};
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Set the language and translate the page
   * @param {string} language - Language code to set
   */
  async setLanguage(language) {
    if (this.isLoading) return; // Prevent multiple simultaneous translation attempts

    try {
      console.log(`Attempting to set language to: ${language}`);
      const translations = await this.loadTranslations(language);
      if (!translations || Object.keys(translations).length === 0) {
        throw new Error('No translations available');
      }

      this.currentLanguage = language;
      this.translations = translations;

      console.log(`Language set to: ${language}, loaded ${Object.keys(translations).length} translation keys`);

      // Apply translations to elements with data-translate
      document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        if (translations[key]) {
          element.innerHTML = translations[key];
        } else {
          console.warn(`Missing translation key: ${key} for language: ${language}`);
          element.innerHTML = key; // Fallback to key name
        }
      });

      // Apply translations to elements with data-translate-placeholder
      document.querySelectorAll("[data-translate-placeholder]").forEach((element) => {
        const key = element.getAttribute("data-translate-placeholder");
        if (translations[key]) {
          element.placeholder = translations[key];
        }
      });

      // Update page title
      const currentPath = window.location.pathname.split("/")[1] || "index";
      console.log(`Current path for title: ${currentPath}`);

      // Handle special case for idbadmin paths
      let titleKey = currentPath;
      if (currentPath === "idbadmin") {
        titleKey = "idbadmin_dashboard";
      }

      document.title = `IamSHIUBA - ${
        translations.title?.[titleKey] || "IamSHIUBA"
      }`;
      console.log(`Updated page title using key: ${titleKey}`);

      // Update localStorage and HTML lang attribute
      localStorage.setItem("selectedLanguage", language);
      document.documentElement.setAttribute("lang", language);

      // Store translations in localStorage for offline use
      try {
        localStorage.setItem(`translations_${language}`, JSON.stringify(translations));
      } catch (e) {
        console.warn('Could not cache translations in localStorage:', e);
      }

      // Update active state on language selector elements
      document.querySelectorAll("[data-language]").forEach((el) => {
        if (el.getAttribute("data-language") === language) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });

      // Force refresh translations for any dynamically loaded content
      setTimeout(() => {
        this.refreshDynamicTranslations();
      }, 100);

      // Dispatch event for other components to react to language change
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));

    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  /**
   * Refresh translations for dynamically loaded content
   */
  refreshDynamicTranslations() {
    if (!this.translations || Object.keys(this.translations).length === 0) {
      return;
    }

    console.log('Refreshing translations for dynamic content');

    // Re-apply translations to elements with data-translate that might have been added dynamically
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (this.translations[key]) {
        element.innerHTML = this.translations[key];
      }
    });

    // Re-apply translations to elements with data-translate-placeholder
    document.querySelectorAll("[data-translate-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-translate-placeholder");
      if (this.translations[key]) {
        element.placeholder = this.translations[key];
      }
    });
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get translation for a specific key
   * @param {string} key - Translation key
   * @returns {string} Translated text or key if not found
   */
  translate(key) {
    return this.translations[key] || key;
  }
}

// Create a global translation manager instance
let translationManager;

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create the translation manager
  translationManager = new TranslationManager();

  // Add CSS for the loading indicator
  addLoadingIndicatorStyles();

  // Set up the mutation observer for data-language attribute changes
  setupLanguageObserver();

  // Set up click handler for language selection
  setupLanguageClickHandler();

  // Load the saved language or use default
  const savedLanguage = localStorage.getItem("selectedLanguage") || "pt-BR";
  translationManager.setLanguage(savedLanguage);

  // Set up periodic refresh for translations (helps with dynamic content)
  setupPeriodicRefresh();
});

/**
 * Set up periodic refresh for translations
 */
function setupPeriodicRefresh() {
  // Refresh translations after page has fully loaded
  window.addEventListener('load', () => {
    console.log('Window loaded, refreshing translations');
    if (translationManager) {
      setTimeout(() => {
        translationManager.refreshDynamicTranslations();
      }, 500);
    }
  });

  // Also refresh translations when navigating with History API
  window.addEventListener('popstate', () => {
    console.log('Navigation occurred, refreshing translations');
    if (translationManager) {
      setTimeout(() => {
        translationManager.refreshDynamicTranslations();
      }, 200);
    }
  });
}

/**
 * Set up mutation observer to watch for data-language attribute changes
 */
function setupLanguageObserver() {
  const languageObserver = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-language"
      ) {
        const newLanguage = mutation.target.getAttribute("data-language");
        if (newLanguage && translationManager) {
          translationManager.setLanguage(newLanguage);
        }
      }
    });
  });

  // Start observing the document for data-language attribute changes
  languageObserver.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-language"],
  });
}

/**
 * Set up click handler for language selection elements
 */
function setupLanguageClickHandler() {
  document.addEventListener("click", (e) => {
    let el = e.target;
    while (el && el !== document) {
      if (el.hasAttribute("data-language")) {
        const newLanguage = el.getAttribute("data-language");
        if (newLanguage && translationManager) {
          translationManager.setLanguage(newLanguage);
        }
        break;
      }
      el = el.parentElement;
    }
  });
}

/**
 * Add CSS for the translation loading indicator
 */
function addLoadingIndicatorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .translation-loading {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background-color: rgba(220, 38, 38, 0.9);
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .translation-loading.visible {
      opacity: 1;
      transform: scale(1);
    }

    .loading-spinner i {
      font-size: 1.5rem;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Global translation function for use in other scripts
 * @param {string} key - Translation key
 * @returns {string} - Translated text or key if not found
 */
function translate(key) {
  if (!key) return '';

  if (translationManager && translationManager.translations) {
    // Check if the key exists in the current translations
    const translation = translationManager.translate(key);

    // If we got back the same key, it means no translation was found
    if (translation === key) {
      console.warn(`Translation not found for key: ${key}`);
    }

    return translation;
  }

  // If translation manager is not available, log a warning and return the key
  console.warn(`Translation manager not available when translating: ${key}`);
  return key;
}
