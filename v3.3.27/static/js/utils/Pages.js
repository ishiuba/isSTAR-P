/**
 * Modern Page Navigation Manager - Main Entry Point
 * Handles single-page application navigation with hash routing
 *
 * @version 3.0.0
 * @author IamSHIUBA
 */

// Import modular components
import { ActiveLinkManager } from "./navigation/ActiveLinkManager.js";
import { EventHandlers } from "./navigation/EventHandlers.js";
import { HistoryManager } from "./navigation/HistoryManager.js";
import { ModalManager } from "./navigation/ModalManager.js";
import { PageNavigationCore } from "./navigation/PageNavigationCore.js";
import { TitleManager } from "./navigation/TitleManager.js";

/**
 * Main Page Navigation Manager Class
 * Coordinates all navigation-related functionality
 */
class PageNavigationManager {
  /**
   * Creates an instance of PageNavigationManager
   * @param {Object} options - Configuration options
   * @param {string} options.defaultPage - Default page to show
   * @param {string} options.contentSelector - Selector for page content elements
   * @param {string} options.linkSelector - Selector for navigation links
   * @param {string} options.activeClass - CSS class for active links
   * @param {string} options.hiddenClass - CSS class to hide content
   * @param {boolean} options.closeModalsOnNavigation - Whether to close modals on navigation
   * @param {boolean} options.enableHistory - Whether to update browser history
   * @param {boolean} options.enableLogging - Whether to enable debug logging
   * @param {number} options.debounceDelay - Debounce delay for hash changes
   */
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      defaultPage: "home",
      contentSelector: "[data-page-content]",
      linkSelector: "[data-page-target]",
      activeClass: "active",
      hiddenClass: "hidden",
      closeModalsOnNavigation: true,
      enableHistory: true,
      enableLogging: false,
      debounceDelay: 100,
      ...options,
    };

    // Internal state
    this.currentPage = null;
    this.validPages = new Set();
    this.isInitialized = false;
    this.debounceTimer = null;

    // Initialize modular components
    this.activeLinkManager = new ActiveLinkManager(this.config);
    this.navigationCore = new PageNavigationCore(this.config);
    this.eventHandlers = new EventHandlers(this.config);
    this.historyManager = new HistoryManager(this.config);
    this.modalManager = new ModalManager(this.config);
    this.titleManager = new TitleManager(this.config);

    // Bind methods to preserve context
    this.handleClick = this.eventHandlers.handleClick.bind(this.eventHandlers);
    this.handlePopState = this.eventHandlers.handlePopState.bind(
      this.eventHandlers
    );
    this.handleHashChange = this.eventHandlers.handleHashChange.bind(
      this.eventHandlers
    );

    // Set up component references
    this.setupComponentReferences();

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Set up component references between modules
   * @private
   */
  setupComponentReferences() {
    // Set navigation manager reference in event handlers
    this.eventHandlers.setComponentReferences({
      navigationManager: this,
      navigationCore: this.navigationCore,
      historyManager: this.historyManager,
    });

    // Set navigation core reference in history manager
    this.historyManager.setNavigationCore(this.navigationCore);

    // Set navigation core reference in title manager
    this.titleManager.setNavigationCore(this.navigationCore);

    // Try to connect with translation manager if available
    if (typeof window !== "undefined" && window.translationManager) {
      this.titleManager.setTranslationManager(window.translationManager);
      this.titleManager.setupTranslationIntegration();
    }
  }

  /**
   * Initialize the page navigation manager
   * @private
   */
  init() {
    try {
      this.log("Initializing PageNavigationManager...");

      this.discoverValidPages();
      this.setupEventListeners();
      this.handleInitialNavigation();

      this.isInitialized = true;
      this.log("PageNavigationManager initialized successfully");

      // Dispatch initialization event
      this.dispatchEvent("pagemanager:initialized", { manager: this });
    } catch (error) {
      console.error("Failed to initialize PageNavigationManager:", error);
      throw error;
    }
  }

  /**
   * Discover all valid pages from DOM elements
   * @private
   */
  discoverValidPages() {
    this.validPages = this.navigationCore.discoverValidPages();
  }

  /**
   * Set up event listeners
   * @private
   */
  setupEventListeners() {
    this.eventHandlers.setupEventListeners();
    this.eventHandlers.setupAccessibilityListeners();
  }

  /**
   * Handle initial navigation on page load
   * @private
   */
  handleInitialNavigation() {
    const hash = this.navigationCore.getCurrentHash();
    const targetPage = hash || this.config.defaultPage;

    this.log(`Initial navigation to: ${targetPage}`);
    this.navigateToPage(targetPage, false); // Don't update history on initial load
  }

  /**
   * Navigate to a specific page
   * @param {string} pageId - ID of the page to navigate to
   * @param {boolean} updateHistory - Whether to update browser history
   * @public
   */
  navigateToPage(pageId, updateHistory = true) {
    try {
      // Validate page ID
      pageId = this.navigationCore.validatePageId(pageId);

      // Skip if already on this page
      if (this.currentPage === pageId) {
        this.log(`Already on page: ${pageId}`);
        return;
      }

      this.log(`Navigating to page: ${pageId}`);

      // Close modals if configured
      if (this.config.closeModalsOnNavigation) {
        this.modalManager.closeOpenModals();
      }

      // Update page content
      this.navigationCore.showSection(pageId);
      this.activeLinkManager.initializeFromHash(pageId);

      // Update page title
      this.titleManager.updateDocumentTitle(pageId);

      // Update browser history
      if (updateHistory && this.config.enableHistory) {
        const historyTitle = this.titleManager.getHistoryTitle(pageId);
        this.historyManager.updateHistory(pageId, { title: historyTitle });
      }

      // Update current page
      const previousPage = this.currentPage;
      this.currentPage = pageId;

      // Dispatch navigation event
      this.dispatchEvent("pagemanager:navigate", {
        from: previousPage,
        to: pageId,
        manager: this,
      });

      this.log(`Successfully navigated to: ${pageId}`);
    } catch (error) {
      console.error(`Error navigating to page ${pageId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a page ID is valid
   * @param {string} pageId - Page ID to validate
   * @returns {boolean} True if page is valid
   * @public
   */
  isValidPage(pageId) {
    return this.navigationCore.isValidPage(pageId);
  }

  /**
   * Connect with translation manager for better title management
   * @param {Object} translationManager - Translation manager instance
   * @public
   */
  connectTranslationManager(translationManager) {
    this.titleManager.setTranslationManager(translationManager);
    this.titleManager.setupTranslationIntegration();
    this.log("Translation manager connected");
  }

  /**
   * Dispatch custom events
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event detail data
   * @private
   */
  dispatchEvent(eventName, detail = {}) {
    this.eventHandlers.dispatchEvent(eventName, detail);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[PageNavigationManager] ${message}`, ...args);
    }
  }

  // Public API Methods

  /**
   * Get current active page
   * @returns {string|null} Current page ID
   * @public
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * Get all valid pages
   * @returns {Set<string>} Set of valid page IDs
   * @public
   */
  getValidPages() {
    return this.navigationCore.getValidPages();
  }

  /**
   * Check if manager is initialized
   * @returns {boolean} True if initialized
   * @public
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Refresh valid pages (useful for dynamic content)
   * @public
   */
  refresh() {
    this.log("Refreshing page manager...");
    this.navigationCore.refresh();
    this.dispatchEvent("pagemanager:refreshed", { manager: this });
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   * @public
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Update configuration in all modules
    this.activeLinkManager.updateConfig(newConfig);
    this.navigationCore.updateConfig(newConfig);
    this.eventHandlers.updateConfig(newConfig);
    this.historyManager.updateConfig(newConfig);
    this.modalManager.updateConfig(newConfig);
    this.titleManager.updateConfig(newConfig);

    this.log("Configuration updated:", newConfig);
    this.dispatchEvent("pagemanager:config-updated", {
      config: this.config,
      manager: this,
    });
  }

  /**
   * Destroy the page manager and clean up
   * @public
   */
  destroy() {
    try {
      this.log("Destroying PageNavigationManager...");

      // Clean up all modules
      this.eventHandlers.removeEventListeners();

      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Reset state
      this.validPages.clear();
      this.currentPage = null;
      this.isInitialized = false;

      this.dispatchEvent("pagemanager:destroyed", { manager: this });
      this.log("PageNavigationManager destroyed");
    } catch (error) {
      console.error("Error destroying PageNavigationManager:", error);
    }
  }
}

// Create and export global instance
let pageNavigationManager;

/**
 * Initialize the page navigation manager
 * @param {Object} options - Configuration options
 * @returns {PageNavigationManager} The manager instance
 */
function initializePageNavigation(options = {}) {
  if (pageNavigationManager) {
    console.warn("PageNavigationManager already initialized");
    return pageNavigationManager;
  }

  pageNavigationManager = new PageNavigationManager(options);

  // Make available globally for debugging
  if (typeof window !== "undefined") {
    window.pageNavigationManager = pageNavigationManager;
  }

  return pageNavigationManager;
}

// Auto-initialize with default settings
document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if not already done
  if (!pageNavigationManager) {
    initializePageNavigation({
      enableLogging: false, // Set to true for debugging
      debounceDelay: 100,
    });
  }
});

// Export for module systems (if available)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PageNavigationManager, initializePageNavigation };
}

// Export for ES6 modules (if available)
if (typeof window !== "undefined") {
  window.PageNavigationManager = PageNavigationManager;
  window.initializePageNavigation = initializePageNavigation;
}
