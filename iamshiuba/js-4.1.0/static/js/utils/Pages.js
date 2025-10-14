/**
 * Modern Page Navigation Manager
 * Handles single-page application navigation with hash routing
 *
 * @class PageNavigationManager
 * @version 2.0.0
 * @author IamSHIUBA
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
      defaultPage: 'home',
      contentSelector: '[data-page-content]',
      linkSelector: '[data-page-target]',
      activeClass: 'active',
      hiddenClass: 'hidden',
      closeModalsOnNavigation: true,
      enableHistory: true,
      enableLogging: false,
      debounceDelay: 100,
      ...options
    };

    // Internal state
    this.currentPage = null;
    this.validPages = new Set();
    this.isInitialized = false;
    this.eventListeners = new Map();
    this.debounceTimer = null;

    // Bind methods to preserve context
    this.handleClick = this.handleClick.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the page navigation manager
   * @private
   */
  init() {
    try {
      this.log('Initializing PageNavigationManager...');

      this.discoverValidPages();
      this.setupEventListeners();
      this.handleInitialNavigation();

      this.isInitialized = true;
      this.log('PageNavigationManager initialized successfully');

      // Dispatch initialization event
      this.dispatchEvent('pagemanager:initialized', { manager: this });

    } catch (error) {
      console.error('Failed to initialize PageNavigationManager:', error);
      throw error;
    }
  }

  /**
   * Discover all valid pages from DOM elements
   * @private
   */
  discoverValidPages() {
    const contentElements = document.querySelectorAll(this.config.contentSelector);
    this.validPages.clear();

    contentElements.forEach(element => {
      const pageId = element.getAttribute('data-page-content');
      if (pageId) {
        this.validPages.add(pageId);
      }
    });

    this.log(`Discovered ${this.validPages.size} valid pages:`, Array.from(this.validPages));
  }

  /**
   * Set up event listeners
   * @private
   */
  setupEventListeners() {
    // Click handler for navigation links
    document.addEventListener('click', this.handleClick);
    this.eventListeners.set('click', this.handleClick);

    // History navigation
    window.addEventListener('popstate', this.handlePopState);
    this.eventListeners.set('popstate', this.handlePopState);

    // Hash change (fallback)
    window.addEventListener('hashchange', this.handleHashChange);
    this.eventListeners.set('hashchange', this.handleHashChange);
  }

  /**
   * Handle initial navigation on page load
   * @private
   */
  handleInitialNavigation() {
    const hash = this.getCurrentHash();
    const targetPage = hash || this.config.defaultPage;

    this.log(`Initial navigation to: ${targetPage}`);
    this.navigateToPage(targetPage, false); // Don't update history on initial load
  }

  /**
   * Get current hash from URL
   * @returns {string} Current hash without the # symbol
   * @private
   */
  getCurrentHash() {
    return window.location.hash.substring(1);
  }

  /**
   * Handle click events for navigation links
   * @param {Event} event - Click event
   * @private
   */
  handleClick(event) {
    const trigger = event.target.closest(this.config.linkSelector);
    if (!trigger) return;

    try {
      event.preventDefault();
      const pageId = trigger.getAttribute('data-page-target');

      if (!pageId) {
        this.log('Warning: Navigation link missing data-page-target attribute');
        return;
      }

      this.log(`Navigation triggered to: ${pageId}`);
      this.navigateToPage(pageId);

    } catch (error) {
      console.error('Error handling navigation click:', error);
    }
  }

  /**
   * Handle browser back/forward navigation
   * @param {PopStateEvent} event - PopState event
   * @private
   */
  handlePopState(event) {
    this.log('PopState event triggered');
    this.debounceNavigation(() => {
      const targetPage = this.getCurrentHash() || this.config.defaultPage;
      this.navigateToPage(targetPage, false); // Don't update history for popstate
    });
  }

  /**
   * Handle hash change events (fallback)
   * @param {HashChangeEvent} event - HashChange event
   * @private
   */
  handleHashChange(event) {
    this.log('HashChange event triggered');
    this.debounceNavigation(() => {
      const targetPage = this.getCurrentHash() || this.config.defaultPage;
      this.navigateToPage(targetPage, false);
    });
  }

  /**
   * Debounce navigation to prevent rapid successive calls
   * @param {Function} callback - Function to execute
   * @private
   */
  debounceNavigation(callback) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(callback, this.config.debounceDelay);
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
      if (!this.isValidPage(pageId)) {
        this.log(`Invalid page ID: ${pageId}, falling back to default`);
        pageId = this.config.defaultPage;
      }

      // Skip if already on this page
      if (this.currentPage === pageId) {
        this.log(`Already on page: ${pageId}`);
        return;
      }

      this.log(`Navigating to page: ${pageId}`);

      // Close modals if configured
      if (this.config.closeModalsOnNavigation) {
        this.closeOpenModals();
      }

      // Update page content
      this.showSection(pageId);
      this.setActiveLink(pageId);

      // Update browser history
      if (updateHistory && this.config.enableHistory) {
        this.updateHistory(pageId);
      }

      // Update current page
      const previousPage = this.currentPage;
      this.currentPage = pageId;

      // Dispatch navigation event
      this.dispatchEvent('pagemanager:navigate', {
        from: previousPage,
        to: pageId,
        manager: this
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
   * @private
   */
  isValidPage(pageId) {
    return this.validPages.has(pageId);
  }

  /**
   * Show a specific page section
   * @param {string} pageId - ID of the page to show
   * @private
   */
  showSection(pageId) {
    try {
      // Hide all sections
      const allSections = document.querySelectorAll(this.config.contentSelector);
      allSections.forEach(section => {
        section.classList.add(this.config.hiddenClass);
        section.setAttribute('aria-hidden', 'true');
      });

      // Show target section
      const targetSection = document.querySelector(`[data-page-content="${pageId}"]`);
      if (targetSection) {
        targetSection.classList.remove(this.config.hiddenClass);
        targetSection.setAttribute('aria-hidden', 'false');

        // Focus management for accessibility
        this.manageFocus(targetSection);
      } else {
        this.log(`Warning: Section not found for page: ${pageId}`);
      }
    } catch (error) {
      console.error(`Error showing section ${pageId}:`, error);
    }
  }

  /**
   * Set active state for navigation links
   * @param {string} pageId - ID of the active page
   * @private
   */
  setActiveLink(pageId) {
    try {
      // Remove active class from all links
      const allLinks = document.querySelectorAll(this.config.linkSelector);
      allLinks.forEach(link => {
        link.classList.remove(this.config.activeClass);
        link.setAttribute('aria-current', 'false');
      });

      // Add active class to current link
      const activeLink = document.querySelector(`[data-page-target="${pageId}"]`);
      if (activeLink) {
        activeLink.classList.add(this.config.activeClass);
        activeLink.setAttribute('aria-current', 'page');
      }
    } catch (error) {
      console.error(`Error setting active link for ${pageId}:`, error);
    }
  }

  /**
   * Update browser history
   * @param {string} pageId - Page ID for history entry
   * @private
   */
  updateHistory(pageId) {
    try {
      if (!this.config.enableHistory) return;

      const url = `#${pageId}`;
      const title = this.getPageTitle(pageId);

      history.pushState({ page: pageId }, title, url);
      this.log(`History updated: ${url}`);
    } catch (error) {
      console.error(`Error updating history for ${pageId}:`, error);
    }
  }

  /**
   * Get page title for history entry
   * @param {string} pageId - Page ID
   * @returns {string} Page title
   * @private
   */
  getPageTitle(pageId) {
    const section = document.querySelector(`[data-page-content="${pageId}"]`);
    if (section) {
      const titleElement = section.querySelector('h1, h2, [data-page-title]');
      if (titleElement) {
        return titleElement.textContent || titleElement.getAttribute('data-page-title') || pageId;
      }
    }
    return pageId;
  }

  /**
   * Close any open modal dialogs
   * @private
   */
  closeOpenModals() {
    try {
      const openModals = document.querySelectorAll('dialog[open], .modal.show, [data-modal-show="true"]');
      openModals.forEach(modal => {
        if (modal.tagName === 'DIALOG') {
          modal.close();
        } else if (modal.classList.contains('modal')) {
          modal.classList.remove('show');
        } else {
          modal.setAttribute('data-modal-show', 'false');
        }
      });

      if (openModals.length > 0) {
        this.log(`Closed ${openModals.length} modal(s)`);
      }
    } catch (error) {
      console.error('Error closing modals:', error);
    }
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
      } else if (targetSection.hasAttribute('tabindex') || targetSection.tabIndex >= 0) {
        targetSection.focus();
      }
    } catch (error) {
      console.error('Error managing focus:', error);
    }
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
        cancelable: true
      });
      document.dispatchEvent(event);
      this.log(`Event dispatched: ${eventName}`, detail);
    } catch (error) {
      console.error(`Error dispatching event ${eventName}:`, error);
    }
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
    return new Set(this.validPages);
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
    this.log('Refreshing page manager...');
    this.discoverValidPages();
    this.dispatchEvent('pagemanager:refreshed', { manager: this });
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   * @public
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated:', newConfig);
    this.dispatchEvent('pagemanager:config-updated', { config: this.config, manager: this });
  }

  /**
   * Destroy the page manager and clean up
   * @public
   */
  destroy() {
    try {
      this.log('Destroying PageNavigationManager...');

      // Remove event listeners
      this.eventListeners.forEach((handler, event) => {
        if (event === 'click') {
          document.removeEventListener(event, handler);
        } else {
          window.removeEventListener(event, handler);
        }
      });

      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Reset state
      this.eventListeners.clear();
      this.validPages.clear();
      this.currentPage = null;
      this.isInitialized = false;

      this.dispatchEvent('pagemanager:destroyed', { manager: this });
      this.log('PageNavigationManager destroyed');

    } catch (error) {
      console.error('Error destroying PageNavigationManager:', error);
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
    console.warn('PageNavigationManager already initialized');
    return pageNavigationManager;
  }

  pageNavigationManager = new PageNavigationManager(options);

  // Make available globally for debugging
  if (typeof window !== 'undefined') {
    window.pageNavigationManager = pageNavigationManager;
  }

  return pageNavigationManager;
}

// Auto-initialize with default settings
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if not already done
  if (!pageNavigationManager) {
    initializePageNavigation({
      enableLogging: false, // Set to true for debugging
      debounceDelay: 100
    });
  }
});

// Export for module systems (if available)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PageNavigationManager, initializePageNavigation };
}

// Export for ES6 modules (if available)
if (typeof window !== 'undefined') {
  window.PageNavigationManager = PageNavigationManager;
  window.initializePageNavigation = initializePageNavigation;
}