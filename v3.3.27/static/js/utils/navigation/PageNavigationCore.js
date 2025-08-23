/**
 * Page Navigation Core
 * Core navigation functionality for page management
 *
 * @class PageNavigationCore
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class PageNavigationCore {
  /**
   * Creates an instance of PageNavigationCore
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      defaultPage: "home",
      contentSelector: "[data-page-content]",
      hiddenClass: "hidden",
      enableLogging: false,
      ...config,
    };

    this.validPages = new Set();
  }

  /**
   * Discover all valid pages from DOM elements
   * @returns {Set<string>} Set of valid page IDs
   */
  discoverValidPages() {
    const contentElements = document.querySelectorAll(
      this.config.contentSelector
    );
    this.validPages.clear();

    contentElements.forEach((element) => {
      const pageId = element.getAttribute("data-page-content");
      if (pageId) {
        this.validPages.add(pageId);
      }
    });

    this.log(
      `Discovered ${this.validPages.size} valid pages:`,
      Array.from(this.validPages)
    );

    return this.validPages;
  }

  /**
   * Check if a page ID is valid
   * @param {string} pageId - Page ID to validate
   * @returns {boolean} True if page is valid
   */
  isValidPage(pageId) {
    return this.validPages.has(pageId);
  }

  /**
   * Show a specific page section
   * @param {string} pageId - ID of the page to show
   * @returns {Element|null} The shown section element
   */
  showSection(pageId) {
    try {
      // Hide all sections
      const allSections = document.querySelectorAll(
        this.config.contentSelector
      );
      allSections.forEach((section) => {
        section.classList.add(this.config.hiddenClass);
        section.setAttribute("aria-hidden", "true");
      });

      // Show target section
      const targetSection = document.querySelector(
        `[data-page-content="${pageId}"]`
      );
      if (targetSection) {
        targetSection.classList.remove(this.config.hiddenClass);
        targetSection.setAttribute("aria-hidden", "false");

        // Focus management for accessibility
        this.manageFocus(targetSection);
        
        this.log(`Section shown: ${pageId}`);
        return targetSection;
      } else {
        this.log(`Warning: Section not found for page: ${pageId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error showing section ${pageId}:`, error);
      return null;
    }
  }

  /**
   * Get page title for a given page ID
   * @param {string} pageId - Page ID
   * @returns {string} Page title
   */
  getPageTitle(pageId) {
    const section = document.querySelector(`[data-page-content="${pageId}"]`);
    if (section) {
      const titleElement = section.querySelector("h1, h2, [data-page-title]");
      if (titleElement) {
        return (
          titleElement.textContent ||
          titleElement.getAttribute("data-page-title") ||
          pageId
        );
      }
    }
    return pageId;
  }

  /**
   * Manage focus for accessibility
   * @param {Element} targetSection - Section to focus
   * @private
   */
  manageFocus(targetSection) {
    try {
      // Find the first focusable element or the section itself
      const focusableElements = targetSection.querySelectorAll(
        'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else if (
        targetSection.hasAttribute("tabindex") ||
        targetSection.tabIndex >= 0
      ) {
        targetSection.focus();
      }
    } catch (error) {
      console.error("Error managing focus:", error);
    }
  }

  /**
   * Get current hash from URL
   * @returns {string} Current hash without the # symbol
   */
  getCurrentHash() {
    return window.location.hash.substring(1);
  }

  /**
   * Validate and normalize page ID
   * @param {string} pageId - Page ID to validate
   * @returns {string} Valid page ID (falls back to default if invalid)
   */
  validatePageId(pageId) {
    if (!pageId || !this.isValidPage(pageId)) {
      this.log(`Invalid page ID: ${pageId}, falling back to default`);
      return this.config.defaultPage;
    }
    return pageId;
  }

  /**
   * Get all valid pages
   * @returns {Set<string>} Set of valid page IDs
   */
  getValidPages() {
    return new Set(this.validPages);
  }

  /**
   * Refresh valid pages (useful for dynamic content)
   */
  refresh() {
    this.log("Refreshing page discovery...");
    this.discoverValidPages();
  }

  /**
   * Check if a section exists in the DOM
   * @param {string} pageId - Page ID to check
   * @returns {boolean} True if section exists
   */
  sectionExists(pageId) {
    const section = document.querySelector(`[data-page-content="${pageId}"]`);
    return section !== null;
  }

  /**
   * Get the currently visible section
   * @returns {Element|null} Currently visible section element
   */
  getCurrentVisibleSection() {
    const allSections = document.querySelectorAll(this.config.contentSelector);
    
    for (const section of allSections) {
      if (!section.classList.contains(this.config.hiddenClass)) {
        return section;
      }
    }
    
    return null;
  }

  /**
   * Get the page ID of the currently visible section
   * @returns {string|null} Page ID of visible section
   */
  getCurrentVisiblePageId() {
    const visibleSection = this.getCurrentVisibleSection();
    return visibleSection ? visibleSection.getAttribute("data-page-content") : null;
  }

  /**
   * Hide all sections
   */
  hideAllSections() {
    const allSections = document.querySelectorAll(this.config.contentSelector);
    allSections.forEach((section) => {
      section.classList.add(this.config.hiddenClass);
      section.setAttribute("aria-hidden", "true");
    });
    
    this.log("All sections hidden");
  }

  /**
   * Show section by element reference
   * @param {Element} sectionElement - Section element to show
   */
  showSectionElement(sectionElement) {
    if (sectionElement) {
      sectionElement.classList.remove(this.config.hiddenClass);
      sectionElement.setAttribute("aria-hidden", "false");
      this.manageFocus(sectionElement);
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("PageNavigationCore configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[PageNavigationCore] ${message}`, ...args);
    }
  }
}
