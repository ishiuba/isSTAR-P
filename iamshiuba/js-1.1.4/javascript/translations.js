/**
 * TranslationManager - Handles loading and applying translations
 */
class TranslationManager {
  constructor() {
    this.currentLanguage = null;
    this.translations = {};
    this.cachedTranslations = {};
    this.defaultLanguage = "pt-BR";
    this.supportedLanguages = ["en-US", "pt-BR", "ja-JP"];
  }

  /**
   * Load translations for a specific language
   * @param {string} language - Language code to load
   * @returns {Promise<Object>} - Translation data
   */
  async loadTranslations(language) {
    // Validate language code
    if (!this.supportedLanguages.includes(language)) {
      console.warn(
        `Unsupported language: ${language}, falling back to ${this.defaultLanguage}`
      );
      language = this.defaultLanguage;
    }

    // Return cached translations if available
    if (this.cachedTranslations[language]) {
      return this.cachedTranslations[language];
    }

    try {
      // Fetch translations with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`../translations/${language}.json`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Error loading translations for ${language}: ${response.status}`
        );
      }

      const data = await response.json();

      // Cache the translations
      this.cachedTranslations[language] = data;

      return data;
    } catch (error) {
      console.error(`Translation loading error for ${language}:`, error);

      // If timeout or network error, try to get from cache or use default
      if (error.name === "AbortError" || error.name === "TypeError") {
        console.warn(
          "Network issue when loading translations, trying fallback..."
        );

        // Try to get from localStorage cache
        try {
          const cachedData = localStorage.getItem(`translations_${language}`);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            this.cachedTranslations[language] = parsedData;
            return parsedData;
          }
        } catch (e) {
          console.error("Error reading from cache:", e);
        }
      }

      // If all else fails and we're not already trying the default, use default language
      if (language !== this.defaultLanguage) {
        console.warn(`Falling back to ${this.defaultLanguage} translations`);
        return this.loadTranslations(this.defaultLanguage);
      }

      // If even the default fails, return an empty object to prevent further errors
      return {};
    }
  }

  /**
   * Set the language and translate the page
   * @param {string} language - Language code to set
   */
  async setLanguage(language) {
    try {
      const translations = await this.loadTranslations(language);
      if (!translations || Object.keys(translations).length === 0) {
        throw new Error("No translations available");
      }

      this.currentLanguage = language;
      this.translations = translations;

      // Apply translations to elements with data-translate
      document.querySelectorAll("[data-translate]").forEach((element) => {
        const key = element.getAttribute("data-translate");
        if (translations[key]) {
          element.innerHTML = translations[key];
        } else {
          console.warn(
            `Missing translation key: ${key} for language: ${language}`
          );
          element.innerHTML = key; // Fallback to key name
        }
      });

      // Apply translations to elements with data-translate-placeholder
      document
        .querySelectorAll("[data-translate-placeholder]")
        .forEach((element) => {
          const key = element.getAttribute("data-translate-placeholder");
          if (translations[key]) {
            element.placeholder = translations[key];
          }
        });

      // Update page title
      const currentPath = window.location.pathname.split("/")[1] || "index";
      document.title = `iSHIUBA - ${
        translations.title?.[currentPath] || "Explore the music and videos of IamSHIUBA, a talented artist."
      }`;

      // Update localStorage and HTML lang attribute
      localStorage.setItem("selectedLanguage", language);
      document.documentElement.setAttribute("lang", language);

      // Store translations in localStorage for offline use
      try {
        localStorage.setItem(
          `translations_${language}`,
          JSON.stringify(translations)
        );
      } catch (e) {
        console.warn("Could not cache translations in localStorage:", e);
      }

      // Update active state on language selector elements
      document.querySelectorAll("[data-language]").forEach((el) => {
        if (el.getAttribute("data-language") === language) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });

      // Dispatch event for other components to react to language change
      window.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { language } })
      );
    } catch (error) {
      console.error("Error setting language:", error);
    }
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

  /**
   * Translate all elements on the page with translation attributes
   * This method is called after a template is loaded
   */
  translatePage() {
    if (!this.currentLanguage || !this.translations) {
      console.warn('Cannot translate page: no language or translations loaded');
      return;
    }

    // Apply translations to elements with data-translate
    document.querySelectorAll("[data-translate]").forEach((element) => {
      const key = element.getAttribute("data-translate");
      if (this.translations[key]) {
        element.innerHTML = this.translations[key];
      } else {
        console.warn(
          `Missing translation key: ${key} for language: ${this.currentLanguage}`
        );
        element.innerHTML = key; // Fallback to key name
      }
    });

    // Apply translations to elements with data-translate-placeholder
    document
      .querySelectorAll("[data-translate-placeholder]")
      .forEach((element) => {
        const key = element.getAttribute("data-translate-placeholder");
        if (this.translations[key]) {
          element.placeholder = this.translations[key];
        }
      });

    // Update page title based on current hash
    const currentHash = window.location.hash.substring(1) || 'home';
    document.title = `iSHIUBA - ${
      this.translations.title?.[currentHash] || "Explore the music and videos of IamSHIUBA, a talented artist."
    }`;
  }
}

// Create a global translation manager instance
let translationManager;

// Initialize everything when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create the translation manager
  translationManager = new TranslationManager();

  // Set up the mutation observer for data-language attribute changes
  setupLanguageObserver();

  // Set up click handler for language selection
  setupLanguageClickHandler();

  // Load the saved language or use default
  const savedLanguage = localStorage.getItem("selectedLanguage") || "pt-BR";
  translationManager.setLanguage(savedLanguage);
});

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
 * Global translation function for use in other scripts
 * @param {string} key - Translation key
 * @returns {string} - Translated text or key if not found
 */
function translate(key) {
  if (translationManager) {
    return translationManager.translate(key);
  }
  return key;
}
