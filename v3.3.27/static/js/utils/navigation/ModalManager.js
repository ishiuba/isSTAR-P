/**
 * Modal Manager for Page Navigation
 * Manages modal dialogs and their interaction with navigation
 *
 * @class ModalManager
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class ModalManager {
  /**
   * Creates an instance of ModalManager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      closeModalsOnNavigation: true,
      enableLogging: false,
      modalSelectors: [
        'dialog[open]',
        '.modal.show',
        '[data-modal-show="true"]',
        '.modal.active',
        '.overlay.show'
      ],
      ...config,
    };
  }

  /**
   * Close any open modal dialogs
   * @param {Object} options - Closing options
   */
  closeOpenModals(options = {}) {
    try {
      if (!this.config.closeModalsOnNavigation && !options.force) {
        this.log("Modal closing on navigation disabled");
        return;
      }

      const opts = {
        animate: true, // Whether to animate closing
        focus: true, // Whether to restore focus
        ...options,
      };

      const openModals = this.getOpenModals();
      let closedCount = 0;

      openModals.forEach((modal) => {
        if (this.closeModal(modal, opts)) {
          closedCount++;
        }
      });

      if (closedCount > 0) {
        this.log(`Closed ${closedCount} modal(s)`);
        
        // Dispatch event
        this.dispatchEvent('modals:closed', {
          count: closedCount,
          modals: openModals
        });
      }

      return closedCount;
    } catch (error) {
      console.error("Error closing modals:", error);
      return 0;
    }
  }

  /**
   * Get all currently open modals
   * @returns {Array<Element>} Array of open modal elements
   */
  getOpenModals() {
    const openModals = [];
    
    this.config.modalSelectors.forEach(selector => {
      try {
        const modals = document.querySelectorAll(selector);
        modals.forEach(modal => {
          if (this.isModalOpen(modal)) {
            openModals.push(modal);
          }
        });
      } catch (error) {
        console.warn(`Invalid modal selector: ${selector}`, error);
      }
    });

    // Remove duplicates
    return [...new Set(openModals)];
  }

  /**
   * Check if a modal is currently open
   * @param {Element} modal - Modal element to check
   * @returns {boolean} True if modal is open
   */
  isModalOpen(modal) {
    if (!modal) return false;

    // Check different modal patterns
    if (modal.tagName === "DIALOG") {
      return modal.hasAttribute('open');
    }
    
    if (modal.classList.contains("modal")) {
      return modal.classList.contains("show") || modal.classList.contains("active");
    }
    
    if (modal.hasAttribute("data-modal-show")) {
      return modal.getAttribute("data-modal-show") === "true";
    }
    
    if (modal.classList.contains("overlay")) {
      return modal.classList.contains("show");
    }

    // Check computed styles as fallback
    const computedStyle = window.getComputedStyle(modal);
    return computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden';
  }

  /**
   * Close a specific modal
   * @param {Element} modal - Modal element to close
   * @param {Object} options - Closing options
   * @returns {boolean} True if modal was closed successfully
   */
  closeModal(modal, options = {}) {
    try {
      if (!modal || !this.isModalOpen(modal)) {
        return false;
      }

      const opts = {
        animate: true,
        focus: true,
        ...options,
      };

      // Store focus element before closing
      let focusElement = null;
      if (opts.focus) {
        focusElement = this.findFocusRestoreTarget(modal);
      }

      // Close based on modal type
      let closed = false;

      if (modal.tagName === "DIALOG") {
        modal.close();
        closed = true;
      } else if (modal.classList.contains("modal")) {
        modal.classList.remove("show", "active");
        closed = true;
      } else if (modal.hasAttribute("data-modal-show")) {
        modal.setAttribute("data-modal-show", "false");
        closed = true;
      } else if (modal.classList.contains("overlay")) {
        modal.classList.remove("show");
        closed = true;
      }

      // Handle animation
      if (closed && opts.animate) {
        this.handleCloseAnimation(modal);
      }

      // Restore focus
      if (closed && opts.focus && focusElement) {
        setTimeout(() => {
          focusElement.focus();
        }, opts.animate ? 150 : 0);
      }

      if (closed) {
        this.log(`Modal closed: ${modal.className || modal.tagName}`);
        
        // Dispatch close event
        this.dispatchEvent('modal:closed', { modal });
      }

      return closed;
    } catch (error) {
      console.error("Error closing modal:", error);
      return false;
    }
  }

  /**
   * Find the element to restore focus to after closing modal
   * @param {Element} modal - Modal element
   * @returns {Element|null} Element to focus
   */
  findFocusRestoreTarget(modal) {
    // Look for data attribute specifying focus target
    const focusTarget = modal.getAttribute('data-focus-restore');
    if (focusTarget) {
      const target = document.querySelector(focusTarget);
      if (target) return target;
    }

    // Look for the trigger element
    const trigger = document.querySelector(`[data-modal-target="${modal.id}"]`);
    if (trigger) return trigger;

    // Fallback to document body or first focusable element
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    
    return focusableElements.length > 0 ? focusableElements[0] : document.body;
  }

  /**
   * Handle close animation for modal
   * @param {Element} modal - Modal element
   */
  handleCloseAnimation(modal) {
    // Add closing class for CSS animations
    modal.classList.add('modal-closing');
    
    // Remove the class after animation completes
    setTimeout(() => {
      modal.classList.remove('modal-closing');
    }, 300); // Adjust timing based on your CSS animations
  }

  /**
   * Close modals when Escape key is pressed
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape') {
      const openModals = this.getOpenModals();
      if (openModals.length > 0) {
        // Close the topmost modal (last in array)
        const topModal = openModals[openModals.length - 1];
        this.closeModal(topModal);
        event.preventDefault();
      }
    }
  }

  /**
   * Set up modal-related event listeners
   */
  setupEventListeners() {
    // Escape key handler
    const escapeHandler = this.handleEscapeKey.bind(this);
    document.addEventListener('keydown', escapeHandler);
    
    this.log("Modal event listeners set up");
    
    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', escapeHandler);
    };
  }

  /**
   * Check if any modals are currently open
   * @returns {boolean} True if any modals are open
   */
  hasOpenModals() {
    return this.getOpenModals().length > 0;
  }

  /**
   * Get count of open modals
   * @returns {number} Number of open modals
   */
  getOpenModalCount() {
    return this.getOpenModals().length;
  }

  /**
   * Close all modals of a specific type
   * @param {string} selector - CSS selector for modal type
   * @param {Object} options - Closing options
   * @returns {number} Number of modals closed
   */
  closeModalsBySelector(selector, options = {}) {
    try {
      const modals = document.querySelectorAll(selector);
      let closedCount = 0;

      modals.forEach(modal => {
        if (this.closeModal(modal, options)) {
          closedCount++;
        }
      });

      this.log(`Closed ${closedCount} modals matching selector: ${selector}`);
      return closedCount;
    } catch (error) {
      console.error(`Error closing modals by selector ${selector}:`, error);
      return 0;
    }
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
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("ModalManager configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[ModalManager] ${message}`, ...args);
    }
  }
}
