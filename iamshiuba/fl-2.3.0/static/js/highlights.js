/**
 * HighlightManager - Manages the featured video highlights section
 * with improved performance, error handling, and lazy loading
 */
class HighlightManager {
  constructor() {
    this.container = null;
    this.data = null;
    this.isLoaded = false;
    this.observer = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds

    // Initialize when DOM is loaded
    this.init();
  }

  /**
   * Initialize the highlight manager
   */
  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Set up the highlight manager
   */
  setup() {
    // Find the container
    this.container = document.getElementById('highlightContainer');

    if (!this.container) {
      console.warn('Highlight container not found. Skipping highlight initialization.');
      return;
    }

    // Show loading state
    this.showLoading();

    // Set up intersection observer for lazy loading
    this.setupLazyLoading();
  }

  /**
   * Set up lazy loading with Intersection Observer
   */
  setupLazyLoading() {
    // Skip if Intersection Observer is not supported
    if (!('IntersectionObserver' in window)) {
      this.loadData();
      return;
    }

    // Create observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.loadData();
          this.observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Load when within 200px of viewport
      threshold: 0.1
    });

    // Start observing
    this.observer.observe(this.container);
  }

  /**
   * Show loading state in container
   */
  showLoading() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="highlight-loading">
        <div class="loading-spinner">
          <i class="fas fa-circle-notch fa-spin"></i>
        </div>
        <p>Carregando destaques...</p>
      </div>
    `;
  }

  /**
   * Show error state in container
   * @param {string} message - Error message to display
   */
  showError(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="highlight-error">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <p>${message}</p>
        <button id="retry-highlights" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Tentar novamente
        </button>
      </div>
    `;

    // Add retry button event listener
    const retryBtn = document.getElementById('retry-highlights');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.retryCount = 0;
        this.showLoading();
        this.loadData();
      });
    }
  }

  /**
   * Load highlight data from JSON file
   */
  async loadData() {
    try {
      // Fetch data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/static/playlists/highlights.json', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to load highlights: ${response.status} ${response.statusText}`);
      }

      this.data = await response.json();

      if (!this.data || !this.data.highlight || !this.data.highlight.playlistId) {
        throw new Error('Invalid highlight data format');
      }

      this.renderHighlight();
      this.isLoaded = true;

    } catch (error) {
      console.error('Error loading highlights:', error);

      // Handle retry logic
      if (this.retryCount < this.maxRetries &&
          (error.name === 'AbortError' || error.name === 'TypeError')) {
        this.retryCount++;
        console.log(`Retrying highlight load (${this.retryCount}/${this.maxRetries})...`);

        setTimeout(() => this.loadData(), this.retryDelay);
      } else {
        this.showError('Não foi possível carregar os destaques. Verifique sua conexão.');
      }
    }
  }

  /**
   * Render the highlight in the container
   */
  renderHighlight() {
    if (!this.container || !this.data) return;

    const { playlistId, title } = this.data.highlight;

    // Directly load the iframe without a placeholder or button
    this.container.innerHTML = `
      <div class="highlight-wrapper">
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
            title="${title || 'Featured Playlist'}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    `;
  }
}

// Initialize the highlight manager
const highlightManager = new HighlightManager();
