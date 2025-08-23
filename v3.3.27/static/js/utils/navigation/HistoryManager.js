/**
 * History Manager for Page Navigation
 * Manages browser history and URL updates
 *
 * @class HistoryManager
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class HistoryManager {
  /**
   * Creates an instance of HistoryManager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      enableHistory: true,
      enableLogging: false,
      ...config,
    };

    // Reference to navigation core (set by parent)
    this.navigationCore = null;
  }

  /**
   * Set reference to navigation core
   * @param {Object} navigationCore - Navigation core instance
   */
  setNavigationCore(navigationCore) {
    this.navigationCore = navigationCore;
  }

  /**
   * Update browser history
   * @param {string} pageId - Page ID for history entry
   * @param {Object} options - History options
   */
  updateHistory(pageId, options = {}) {
    try {
      if (!this.config.enableHistory) {
        this.log("History updates disabled");
        return;
      }

      const opts = {
        replace: false, // Whether to replace current entry instead of pushing
        title: null, // Custom title (will be auto-generated if null)
        state: {}, // Additional state data
        ...options,
      };

      const url = `#${pageId}`;
      const title = opts.title || this.getPageTitle(pageId);
      const state = { page: pageId, ...opts.state };

      if (opts.replace) {
        history.replaceState(state, title, url);
        this.log(`History replaced: ${url}`);
      } else {
        history.pushState(state, title, url);
        this.log(`History updated: ${url}`);
      }

      // Note: Document title is now managed by TitleManager
      // The HistoryManager only handles browser history entries
    } catch (error) {
      console.error(`Error updating history for ${pageId}:`, error);
    }
  }

  /**
   * Get page title for history entry
   * @param {string} pageId - Page ID
   * @returns {string} Page title
   */
  getPageTitle(pageId) {
    if (this.navigationCore && this.navigationCore.getPageTitle) {
      return this.navigationCore.getPageTitle(pageId);
    }

    // Fallback: try to find title directly
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
   * Navigate back in history
   */
  goBack() {
    try {
      window.history.back();
      this.log("Navigated back in history");
    } catch (error) {
      console.error("Error navigating back:", error);
    }
  }

  /**
   * Navigate forward in history
   */
  goForward() {
    try {
      window.history.forward();
      this.log("Navigated forward in history");
    } catch (error) {
      console.error("Error navigating forward:", error);
    }
  }

  /**
   * Go to a specific history entry
   * @param {number} delta - Number of entries to go back (negative) or forward (positive)
   */
  go(delta) {
    try {
      window.history.go(delta);
      this.log(`Navigated ${delta} entries in history`);
    } catch (error) {
      console.error(`Error navigating ${delta} entries:`, error);
    }
  }

  /**
   * Get current history state
   * @returns {Object|null} Current history state
   */
  getCurrentState() {
    return window.history.state;
  }

  /**
   * Check if browser supports history API
   * @returns {boolean} True if history API is supported
   */
  isHistorySupported() {
    return !!(window.history && window.history.pushState);
  }

  /**
   * Get current URL hash
   * @returns {string} Current hash without #
   */
  getCurrentHash() {
    return window.location.hash.substring(1);
  }

  /**
   * Set URL hash without triggering navigation
   * @param {string} hash - Hash to set (without #)
   * @param {boolean} replace - Whether to replace current entry
   */
  setHash(hash, replace = false) {
    try {
      const url = `#${hash}`;

      if (replace) {
        window.location.replace(url);
      } else {
        window.location.hash = hash;
      }

      this.log(`Hash ${replace ? "replaced" : "set"}: ${url}`);
    } catch (error) {
      console.error(`Error setting hash ${hash}:`, error);
    }
  }

  /**
   * Clear URL hash
   * @param {boolean} replace - Whether to replace current entry
   */
  clearHash(replace = false) {
    try {
      const url = window.location.pathname + window.location.search;

      if (replace) {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }

      this.log(`Hash ${replace ? "replaced" : "cleared"}`);
    } catch (error) {
      console.error("Error clearing hash:", error);
    }
  }

  /**
   * Get history length
   * @returns {number} Number of entries in history
   */
  getHistoryLength() {
    return window.history.length;
  }

  /**
   * Check if we can go back in history
   * @returns {boolean} True if can go back
   */
  canGoBack() {
    // This is an approximation since there's no direct way to check
    return window.history.length > 1;
  }

  /**
   * Initialize history state for current page
   * @param {string} pageId - Current page ID
   */
  initializeHistoryState(pageId) {
    try {
      if (!this.config.enableHistory || !this.isHistorySupported()) {
        this.log("History not supported or disabled");
        return;
      }

      const currentState = this.getCurrentState();

      // If no state exists, create initial state
      if (!currentState || !currentState.page) {
        const title = this.getPageTitle(pageId);
        const url = `#${pageId}`;

        window.history.replaceState({ page: pageId }, title, url);
        this.log(`Initial history state set: ${url}`);
      }
    } catch (error) {
      console.error("Error initializing history state:", error);
    }
  }

  /**
   * Listen for popstate events
   * @param {Function} callback - Callback function for popstate events
   * @returns {Function} Cleanup function to remove listener
   */
  onPopState(callback) {
    const handler = (event) => {
      this.log("PopState event detected", event.state);
      callback(event);
    };

    window.addEventListener("popstate", handler);

    // Return cleanup function
    return () => {
      window.removeEventListener("popstate", handler);
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("HistoryManager configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[HistoryManager] ${message}`, ...args);
    }
  }
}
