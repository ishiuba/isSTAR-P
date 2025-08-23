/**
 * Event Handlers for Page Navigation
 * Manages all event handling for navigation system
 *
 * @class EventHandlers
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class EventHandlers {
  /**
   * Creates an instance of EventHandlers
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      linkSelector: "[data-page-target]",
      defaultPage: "home",
      debounceDelay: 100,
      enableLogging: false,
      ...config,
    };

    this.eventListeners = new Map();
    this.debounceTimer = null;
    
    // References to other components (set by parent)
    this.navigationManager = null;
    this.navigationCore = null;
    this.historyManager = null;
  }

  /**
   * Set references to other navigation components
   * @param {Object} components - Component references
   */
  setComponentReferences(components) {
    this.navigationManager = components.navigationManager;
    this.navigationCore = components.navigationCore;
    this.historyManager = components.historyManager;
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Click handler for navigation links
    const clickHandler = this.handleClick.bind(this);
    document.addEventListener("click", clickHandler);
    this.eventListeners.set("click", clickHandler);

    // History navigation
    const popStateHandler = this.handlePopState.bind(this);
    window.addEventListener("popstate", popStateHandler);
    this.eventListeners.set("popstate", popStateHandler);

    // Hash change (fallback)
    const hashChangeHandler = this.handleHashChange.bind(this);
    window.addEventListener("hashchange", hashChangeHandler);
    this.eventListeners.set("hashchange", hashChangeHandler);

    this.log("Event listeners set up successfully");
  }

  /**
   * Handle click events for navigation links
   * @param {Event} event - Click event
   */
  handleClick(event) {
    const trigger = event.target.closest(this.config.linkSelector);
    if (!trigger) return;

    try {
      event.preventDefault();
      const pageId = trigger.getAttribute("data-page-target");

      if (!pageId) {
        this.log("Warning: Navigation link missing data-page-target attribute");
        return;
      }

      this.log(`Navigation triggered to: ${pageId}`);
      
      // Delegate to navigation manager
      if (this.navigationManager && this.navigationManager.navigateToPage) {
        this.navigationManager.navigateToPage(pageId);
      }
    } catch (error) {
      console.error("Error handling navigation click:", error);
    }
  }

  /**
   * Handle browser back/forward navigation
   * @param {PopStateEvent} _event - PopState event (unused but kept for signature)
   */
  handlePopState(_event) {
    this.log("PopState event triggered");
    this.debounceNavigation(() => {
      const targetPage = this.getCurrentHash() || this.config.defaultPage;
      
      // Delegate to navigation manager
      if (this.navigationManager && this.navigationManager.navigateToPage) {
        this.navigationManager.navigateToPage(targetPage, false); // Don't update history for popstate
      }
    });
  }

  /**
   * Handle hash change events (fallback)
   * @param {HashChangeEvent} _event - HashChange event (unused but kept for signature)
   */
  handleHashChange(_event) {
    this.log("HashChange event triggered");
    this.debounceNavigation(() => {
      const targetPage = this.getCurrentHash() || this.config.defaultPage;
      
      // Delegate to navigation manager
      if (this.navigationManager && this.navigationManager.navigateToPage) {
        this.navigationManager.navigateToPage(targetPage, false);
      }
    });
  }

  /**
   * Debounce navigation to prevent rapid successive calls
   * @param {Function} callback - Function to execute
   */
  debounceNavigation(callback) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(callback, this.config.debounceDelay);
  }

  /**
   * Get current hash from URL
   * @returns {string} Current hash without the # symbol
   */
  getCurrentHash() {
    return window.location.hash.substring(1);
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    // Handle common keyboard shortcuts for navigation
    if (event.altKey) {
      switch (event.key) {
        case 'ArrowLeft':
          // Navigate back in history
          event.preventDefault();
          window.history.back();
          break;
        case 'ArrowRight':
          // Navigate forward in history
          event.preventDefault();
          window.history.forward();
          break;
      }
    }
  }

  /**
   * Handle focus events for accessibility
   * @param {FocusEvent} event - Focus event
   */
  handleFocus(event) {
    const target = event.target;
    
    // If focusing on a navigation link, ensure it's properly highlighted
    if (target.matches(this.config.linkSelector)) {
      this.log(`Focus on navigation link: ${target.getAttribute('data-page-target')}`);
    }
  }

  /**
   * Set up additional accessibility event listeners
   */
  setupAccessibilityListeners() {
    // Keyboard navigation
    const keyboardHandler = this.handleKeyboardNavigation.bind(this);
    document.addEventListener("keydown", keyboardHandler);
    this.eventListeners.set("keydown", keyboardHandler);

    // Focus management
    const focusHandler = this.handleFocus.bind(this);
    document.addEventListener("focus", focusHandler, true);
    this.eventListeners.set("focus", focusHandler);

    this.log("Accessibility event listeners set up");
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    this.eventListeners.forEach((handler, event) => {
      if (event === "click" || event === "keydown") {
        document.removeEventListener(event, handler);
      } else if (event === "focus") {
        document.removeEventListener(event, handler, true);
      } else {
        window.removeEventListener(event, handler);
      }
    });

    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.eventListeners.clear();
    this.log("All event listeners removed");
  }

  /**
   * Dispatch custom events
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event detail data
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
   * Add custom event listener for navigation events
   * @param {string} eventName - Event name to listen for
   * @param {Function} handler - Event handler function
   */
  addEventListener(eventName, handler) {
    document.addEventListener(eventName, handler);
    this.log(`Custom event listener added: ${eventName}`);
  }

  /**
   * Remove custom event listener
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler function
   */
  removeEventListener(eventName, handler) {
    document.removeEventListener(eventName, handler);
    this.log(`Custom event listener removed: ${eventName}`);
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("EventHandlers configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[EventHandlers] ${message}`, ...args);
    }
  }
}
