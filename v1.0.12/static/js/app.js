/**
 * Main Application Module
 * Handles application initialization and coordination between modules
 */

/**
 * Application configuration
 */
const AppConfig = {
  // Add any global app configuration here
  debug: false,
  version: '1.0.0'
};

/**
 * Logs debug messages if debug mode is enabled
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
function debugLog(message, data = null) {
  if (AppConfig.debug) {
    console.log(`[App Debug] ${message}`, data || '');
  }
}

/**
 * Initializes all application modules
 */
function initializeApp() {
  debugLog('Initializing application...');

  try {
    // Initialize language system
    if (typeof initializeLanguage === 'function') {
      initializeLanguage();
      debugLog('Language system initialized');
    } else {
      console.warn('Language manager not loaded');
    }

    // Initialize theme system
    if (typeof initializeTheme === 'function') {
      initializeTheme();
      debugLog('Theme system initialized');
    } else {
      console.warn('Theme manager not loaded');
    }

    // Load videos if on a page that has video container
    if (typeof loadVideos === 'function') {
      loadVideos();
      debugLog('Videos loaded');
    } else {
      debugLog('Video loader not available or not needed');
    }

    // Setup language event listeners
    if (typeof setupLanguageEventListeners === 'function') {
      setupLanguageEventListeners();
      debugLog('Language event listeners setup');
    }

    // Setup system theme detection (optional)
    if (typeof setupSystemThemeDetection === 'function') {
      setupSystemThemeDetection();
      debugLog('System theme detection setup');
    }

    debugLog('Application initialization complete');

  } catch (error) {
    console.error('Error during application initialization:', error);
  }
}

/**
 * Handles application errors
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
function handleAppError(error, context = 'Unknown') {
  console.error(`[App Error - ${context}]:`, error);
  
  // You can add error reporting here if needed
  // For example, send to analytics or error tracking service
}

/**
 * Checks if all required dependencies are loaded
 * @returns {boolean} - True if all dependencies are available
 */
function checkDependencies() {
  const requiredFunctions = [
    'initializeLanguage',
    'initializeTheme'
  ];

  const optionalFunctions = [
    'loadVideos',
    'setupLanguageEventListeners',
    'setupSystemThemeDetection'
  ];

  let allRequired = true;
  
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
      console.error(`Required function ${funcName} is not available`);
      allRequired = false;
    }
  });

  optionalFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
      debugLog(`Optional function ${funcName} is not available`);
    }
  });

  return allRequired;
}

/**
 * Application ready handler
 */
function onAppReady() {
  debugLog('DOM Content Loaded');
  
  if (checkDependencies()) {
    initializeApp();
  } else {
    console.error('Cannot initialize app: missing required dependencies');
  }
}

/**
 * Sets up global error handling
 */
function setupGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    handleAppError(event.error, 'Global Error Handler');
  });

  window.addEventListener('unhandledrejection', (event) => {
    handleAppError(event.reason, 'Unhandled Promise Rejection');
  });
}

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", onAppReady);

// Setup global error handling
setupGlobalErrorHandling();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppConfig,
    initializeApp,
    handleAppError,
    checkDependencies
  };
}
