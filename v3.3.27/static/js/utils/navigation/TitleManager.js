/**
 * Title Manager for Page Navigation
 * Integrates with translation system for intelligent title management
 *
 * @class TitleManager
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class TitleManager {
  /**
   * Creates an instance of TitleManager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      enableLogging: false,
      baseTitle: "IamSHIUBA",
      titleSeparator: " - ",
      useTranslations: true,
      fallbackToContent: true,
      updateDocumentTitle: true,
      ...config,
    };

    // Reference to translation manager (set externally)
    this.translationManager = null;
    this.navigationCore = null;
  }

  /**
   * Set reference to translation manager
   * @param {Object} translationManager - Translation manager instance
   */
  setTranslationManager(translationManager) {
    this.translationManager = translationManager;
  }

  /**
   * Set reference to navigation core
   * @param {Object} navigationCore - Navigation core instance
   */
  setNavigationCore(navigationCore) {
    this.navigationCore = navigationCore;
  }

  /**
   * Get page title with translation support
   * @param {string} pageId - Page ID
   * @param {Object} options - Title options
   * @returns {string} Page title
   */
  getPageTitle(pageId, options = {}) {
    const opts = {
      includeBase: true,
      useTranslations: this.config.useTranslations,
      fallbackToContent: this.config.fallbackToContent,
      ...options,
    };

    let title = null;

    // 1. Try to get translated title first
    if (opts.useTranslations && this.translationManager) {
      title = this.getTranslatedTitle(pageId);
    }

    // 2. Fallback to content-based title
    if (!title && opts.fallbackToContent) {
      title = this.getContentBasedTitle(pageId);
    }

    // 3. Final fallback to pageId
    if (!title) {
      title = pageId;
    }

    // 4. Add base title if requested
    if (opts.includeBase && title !== this.config.baseTitle) {
      title = `${this.config.baseTitle}${this.config.titleSeparator}${title}`;
    }

    this.log(`Generated title for ${pageId}: ${title}`);
    return title;
  }

  /**
   * Get translated title for a page
   * @param {string} pageId - Page ID
   * @returns {string|null} Translated title or null
   * @private
   */
  getTranslatedTitle(pageId) {
    if (!this.translationManager) {
      return null;
    }

    try {
      // Get current translations
      const translations = this.translationManager.getTranslations?.() || {};

      // Handle special cases (like the current Translations.js logic)
      let titleKey = pageId;
      if (pageId === "idbadmin") {
        titleKey = "idbadmin_dashboard";
      }

      // Try to get translated title
      const translatedTitle = translations.title?.[titleKey];

      if (translatedTitle) {
        this.log(`Found translated title for ${pageId}: ${translatedTitle}`);
        return translatedTitle;
      }

      // Try alternative translation keys
      const alternativeKeys = [
        pageId,
        `${pageId}_title`,
        `title_${pageId}`,
        `page_${pageId}`,
      ];

      for (const key of alternativeKeys) {
        const altTitle = translations[key];
        if (altTitle) {
          this.log(
            `Found alternative translated title for ${pageId}: ${altTitle}`
          );
          return altTitle;
        }
      }

      this.log(`No translated title found for ${pageId}`);
      return null;
    } catch (error) {
      console.error(`Error getting translated title for ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Get content-based title from DOM
   * @param {string} pageId - Page ID
   * @returns {string|null} Content-based title or null
   * @private
   */
  getContentBasedTitle(pageId) {
    if (!this.navigationCore) {
      // Fallback: direct DOM query
      return this.getContentBasedTitleDirect(pageId);
    }

    try {
      const title = this.navigationCore.getPageTitle(pageId);
      return title !== pageId ? title : null;
    } catch (error) {
      console.error(`Error getting content-based title for ${pageId}:`, error);
      return this.getContentBasedTitleDirect(pageId);
    }
  }

  /**
   * Get content-based title directly from DOM
   * @param {string} pageId - Page ID
   * @returns {string|null} Content-based title or null
   * @private
   */
  getContentBasedTitleDirect(pageId) {
    try {
      const section = document.querySelector(`[data-page-content="${pageId}"]`);
      if (section) {
        const titleElement = section.querySelector("h1, h2, [data-page-title]");
        if (titleElement) {
          const title =
            titleElement.textContent ||
            titleElement.getAttribute("data-page-title");

          if (title && title.trim()) {
            this.log(`Found content-based title for ${pageId}: ${title}`);
            return title.trim();
          }
        }
      }
      return null;
    } catch (error) {
      console.error(`Error getting direct content title for ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Update document title for a page
   * @param {string} pageId - Page ID
   * @param {Object} options - Update options
   */
  updateDocumentTitle(pageId, options = {}) {
    if (!this.config.updateDocumentTitle) {
      this.log(`Document title updates disabled`);
      return;
    }

    try {
      const title = this.getPageTitle(pageId, options);

      if (title) {
        document.title = title;
        this.log(`Document title updated to: ${title}`);

        // Dispatch event
        this.dispatchEvent("titlemanager:updated", {
          pageId,
          title,
          previousTitle: document.title,
        });
      }
    } catch (error) {
      console.error(`Error updating document title for ${pageId}:`, error);
    }
  }

  /**
   * Get title for history entry (compatible with HistoryManager)
   * @param {string} pageId - Page ID
   * @returns {string} Title for history
   */
  getHistoryTitle(pageId) {
    return this.getPageTitle(pageId, {
      includeBase: false, // History entries usually don't need base title
      useTranslations: true,
      fallbackToContent: true,
    });
  }

  /**
   * Update title when language changes
   * @param {string} newLanguage - New language code
   */
  onLanguageChange(newLanguage) {
    this.log(`Language changed to: ${newLanguage}`);

    // Get current page ID
    let currentPageId = "home"; // default

    if (this.navigationCore) {
      currentPageId = this.navigationCore.getCurrentVisiblePageId() || "home";
    } else {
      // Fallback: try to get from URL hash
      const hash = window.location.hash.substring(1);
      if (hash) {
        currentPageId = hash;
      }
    }

    // Update title for current page
    this.updateDocumentTitle(currentPageId);
  }

  /**
   * Set up integration with translation system
   */
  setupTranslationIntegration() {
    // Listen for language change events
    document.addEventListener("language:changed", (event) => {
      this.onLanguageChange(event.detail.language);
    });

    // Listen for translation updates
    document.addEventListener("translations:updated", () => {
      // Re-evaluate current page title
      this.onLanguageChange(
        this.translationManager?.getCurrentLanguage?.() || "pt"
      );
    });

    this.log("Translation integration set up");
  }

  /**
   * Dispatch custom events
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event detail data
   * @private
   */
  dispatchEvent(eventName, detail = {}) {
    try {
      const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      this.log(`Event dispatched: ${eventName}`, detail);
    } catch (error) {
      console.error(`Error dispatching event ${eventName}:`, error);
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("TitleManager configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[TitleManager] ${message}`, ...args);
    }
  }
}
