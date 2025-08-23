/**
 * Universal Active Link Manager
 * Manages active states for navigation links across different contexts
 *
 * @class ActiveLinkManager
 * @version 1.0.0
 * @author IamSHIUBA
 */
export class ActiveLinkManager {
  /**
   * Creates an instance of ActiveLinkManager
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = {
      activeClass: "active",
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Universal method to set active links based on current page/path
   * Works with different link types and selectors
   * @param {string} currentPath - Current page path or identifier
   * @param {string|Array<string>} linkSelectors - CSS selectors for links
   * @param {Object} options - Additional options
   */
  setActiveLinks(currentPath, linkSelectors = [], options = {}) {
    const opts = {
      activeClass: this.config.activeClass,
      matchAttribute: "href", // Default attribute to match against
      exactMatch: true, // Whether to use exact matching
      enableAria: true, // Whether to set aria-current
      ...options,
    };

    // Ensure linkSelectors is an array
    const selectors = Array.isArray(linkSelectors) ? linkSelectors : [linkSelectors];
    
    // If no selectors provided, use common navigation link classes
    if (selectors.length === 0) {
      selectors.push('.n-link', '.f-link', '.drawer-link', '[data-page-target]');
    }

    // Get all unique links that match any of the selectors
    const allLinks = this.getUniqueLinks(selectors);

    this.log(`Processing ${allLinks.length} links for path: ${currentPath}`);

    // Process each link
    allLinks.forEach((link) => {
      const isActive = this.shouldLinkBeActive(link, currentPath, opts);
      this.setLinkActiveState(link, isActive, opts);
    });
  }

  /**
   * Get unique links from multiple selectors
   * @param {Array<string>} selectors - Array of CSS selectors
   * @returns {Array<Element>} Array of unique link elements
   * @private
   */
  getUniqueLinks(selectors) {
    const linkSet = new Set();
    
    selectors.forEach(selector => {
      try {
        const links = document.querySelectorAll(selector);
        links.forEach(link => linkSet.add(link));
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
      }
    });

    return Array.from(linkSet);
  }

  /**
   * Determine if a link should be active
   * @param {Element} link - Link element
   * @param {string} currentPath - Current path
   * @param {Object} options - Matching options
   * @returns {boolean} Whether link should be active
   * @private
   */
  shouldLinkBeActive(link, currentPath, options) {
    const linkValue = link.getAttribute(options.matchAttribute);
    
    if (!linkValue) {
      return false;
    }

    if (options.exactMatch) {
      return linkValue === currentPath;
    } else {
      // For partial matching, check if current path starts with link value
      return currentPath.startsWith(linkValue) && linkValue !== '/';
    }
  }

  /**
   * Set the active state of a link
   * @param {Element} link - Link element
   * @param {boolean} isActive - Whether link should be active
   * @param {Object} options - State options
   * @private
   */
  setLinkActiveState(link, isActive, options) {
    if (isActive) {
      link.classList.add(options.activeClass);
      if (options.enableAria) {
        link.setAttribute("aria-current", "page");
      }
    } else {
      link.classList.remove(options.activeClass);
      if (options.enableAria) {
        link.setAttribute("aria-current", "false");
      }
    }
  }

  /**
   * Initialize active links based on current URL pathname
   * This is the universal method you mentioned in your request
   */
  initializeFromCurrentPath() {
    // Get the current page path from URL
    const currentPage = window.location.pathname;
    
    // Common navigation link selectors
    const linkSelectors = ['.n-link', '.f-link', '.drawer-link'];
    
    // Set active links based on current path
    this.setActiveLinks(currentPage, linkSelectors, {
      matchAttribute: 'href',
      exactMatch: true,
      enableAria: true
    });

    this.log(`Initialized active links for path: ${currentPage}`);
  }

  /**
   * Initialize active links for hash-based navigation
   * @param {string} currentHash - Current hash without #
   */
  initializeFromHash(currentHash) {
    const linkSelectors = ['[data-page-target]'];
    
    this.setActiveLinks(currentHash, linkSelectors, {
      matchAttribute: 'data-page-target',
      exactMatch: true,
      enableAria: true
    });

    this.log(`Initialized active links for hash: ${currentHash}`);
  }

  /**
   * Clear all active states
   * @param {string|Array<string>} linkSelectors - Selectors for links to clear
   */
  clearAllActiveStates(linkSelectors = []) {
    const selectors = Array.isArray(linkSelectors) ? linkSelectors : [linkSelectors];
    
    if (selectors.length === 0) {
      selectors.push('.n-link', '.f-link', '.drawer-link', '[data-page-target]');
    }

    const allLinks = this.getUniqueLinks(selectors);
    
    allLinks.forEach(link => {
      link.classList.remove(this.config.activeClass);
      link.setAttribute("aria-current", "false");
    });

    this.log(`Cleared active states for ${allLinks.length} links`);
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log("ActiveLinkManager configuration updated:", newConfig);
  }

  /**
   * Log messages if logging is enabled
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   * @private
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[ActiveLinkManager] ${message}`, ...args);
    }
  }
}

// Create a global instance for standalone use
let globalActiveLinkManager;

/**
 * Get or create the global ActiveLinkManager instance
 * @param {Object} config - Configuration options
 * @returns {ActiveLinkManager} The global instance
 */
export function getActiveLinkManager(config = {}) {
  if (!globalActiveLinkManager) {
    globalActiveLinkManager = new ActiveLinkManager(config);
  }
  return globalActiveLinkManager;
}

/**
 * Universal function to initialize active links based on current URL
 * This is the standalone script you requested
 */
export function initializeActiveLinks() {
  const manager = getActiveLinkManager();
  manager.initializeFromCurrentPath();
}

// Auto-initialize when DOM is ready (for standalone use)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-initialize if this script is loaded standalone
    if (!window.pageNavigationManager) {
      initializeActiveLinks();
    }
  });

  // Make available globally
  window.ActiveLinkManager = ActiveLinkManager;
  window.getActiveLinkManager = getActiveLinkManager;
  window.initializeActiveLinks = initializeActiveLinks;
}
