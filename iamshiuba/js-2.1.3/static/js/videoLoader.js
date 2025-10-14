/**
 * Enhanced Streaming Module
 * Modern YouTube playlist loader with Bootstrap 5 integration
 * Handles loading and displaying YouTube playlists from data.json
 */

/**
 * Enhanced Streaming Class with modern JavaScript features
 */
class EnhancedStreaming {
  // Private fields using modern JavaScript syntax
  #youtubeData = [];
  #originalData = [];
  #favorites = new Set();
  #currentView = "grid";
  #itemsPerPage = 6;
  #currentPage = 1;
  #initialized = false;
  #elements = new Map();
  #abortController = null;
  #intersectionObserver = null;

  // Configuration constants
  static CONFIG = {
    DATA_URL: "./static/data.json",
    STORAGE_KEYS: {
      FAVORITES: "streaming-favorites",
      VIEW: "streaming-view",
      THEME: "streaming-theme",
    },
    GRID_LAYOUTS: {
      responsive: "col-12 col-md-6 col-lg-4 col-xl-3",
      large: "col-12 col-md-6 col-lg-4",
      medium: "col-12 col-sm-6 col-lg-3",
      small: "col-12 col-sm-4 col-md-3 col-lg-2",
      single: "col-12",
    },
    LAZY_LOAD_OPTIONS: {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    },
  };

  constructor(options = {}) {
    // Merge default options with provided options
    this.options = {
      container: "videoContainer",
      searchInput: "youtubeSearch",
      loadingElement: "loadingAnimation",
      viewToggle: "viewToggle",
      pagination: "paginationYoutube",
      autoInit: true,
      enableLazyLoading: true,
      enableIntersectionObserver: false,
      ...options,
    };

    console.log("Enhanced Streaming constructor executed");

    // Initialize favorites from localStorage
    this.#loadFavorites();

    // Initialize elements and setup
    this.#initializeElements();

    if (this.options.autoInit) {
      this.init();
    }
  }

  /**
   * Initialize DOM elements with error handling
   * @private
   */
  #initializeElements() {
    console.log("Initializing DOM elements...");

    const elementIds = [
      this.options.container,
      this.options.searchInput,
      this.options.loadingElement,
      this.options.viewToggle,
      this.options.pagination,
    ];

    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        this.#elements.set(id, element);
      } else {
        console.warn(`Element with ID '${id}' not found`);
      }
    });

    // Setup retry mechanism for missing elements
    if (!this.#elements.has(this.options.container)) {
      setTimeout(() => this.#retryElementInitialization(), 100);
    }
  }

  /**
   * Retry element initialization for dynamic content
   * @private
   */
  #retryElementInitialization() {
    const container = document.getElementById(this.options.container);
    if (container) {
      this.#elements.set(this.options.container, container);
      console.log("Container found after retry!");
      if (this.options.autoInit && !this.#initialized) {
        this.init();
      }
    }
  }

  /**
   * Load favorites from localStorage with error handling
   * @private
   */
  #loadFavorites() {
    try {
      const stored = localStorage.getItem(
        EnhancedStreaming.CONFIG.STORAGE_KEYS.FAVORITES
      );
      if (stored) {
        const favArray = JSON.parse(stored);
        this.#favorites = new Set(Array.isArray(favArray) ? favArray : []);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      this.#favorites = new Set();
    }
  }

  /**
   * Save favorites to localStorage
   * @private
   */
  #saveFavorites() {
    try {
      const favArray = Array.from(this.#favorites);
      localStorage.setItem(
        EnhancedStreaming.CONFIG.STORAGE_KEYS.FAVORITES,
        JSON.stringify(favArray)
      );
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }

  /**
   * Initialize the streaming system
   * @public
   */
  async init() {
    if (this.#initialized) {
      console.log("Streaming already initialized");
      return;
    }

    console.log("Initializing Enhanced Streaming...");

    try {
      // Setup intersection observer for lazy loading
      if (this.options.enableIntersectionObserver) {
        this.#setupIntersectionObserver();
      }

      // Load playlist data
      await this.#loadPlaylistData();

      // Setup event listeners
      this.#setupEventListeners();

      // Setup initial view
      this.#setupInitialView();

      // Render playlists
      this.#renderPlaylists();

      this.#initialized = true;
      console.log("Enhanced Streaming initialized successfully!");
    } catch (error) {
      console.error("Error initializing streaming:", error);
      this.#showError("Failed to initialize streaming system");
    }
  }

  /**
   * Load playlist data from data.json
   * @private
   */
  async #loadPlaylistData() {
    // Cancel any existing request
    if (this.#abortController) {
      this.#abortController.abort();
    }

    this.#abortController = new AbortController();

    try {
      this.#showLoading();

      const response = await fetch(EnhancedStreaming.CONFIG.DATA_URL, {
        signal: this.#abortController.signal,
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.playlists || !Array.isArray(data.playlists)) {
        throw new Error(
          "Invalid data format: playlists not found or not an array"
        );
      }

      // Process and store data
      const processedData = data.playlists.map((playlist) => ({
        ...playlist,
        type: "youtube",
        isFavorite: this.#isFavorite(playlist.playlistId),
        id: playlist.playlistId, // Ensure consistent ID field
      }));

      this.#youtubeData = [...processedData];
      this.#originalData = [...processedData];

      this.#hideLoading();
      console.log(`Loaded ${processedData.length} playlists successfully`);
    } catch (error) {
      this.#hideLoading();
      if (error.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }

      console.error("Error loading playlist data:", error);
      this.#showError(`Failed to load playlists: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup intersection observer for lazy loading (disabled for manual loading)
   * @private
   */
  #setupIntersectionObserver() {
    // Intersection observer disabled for manual loading with buttons
    // Users will click "Load Video" buttons to load players manually
    console.log(
      "Intersection observer disabled - using manual loading with buttons"
    );
    return;
  }

  /**
   * Load video frame for manual lazy loading
   * @private
   */
  #loadVideoFrame(element) {
    const placeholder = element.querySelector(".video-placeholder");
    if (!placeholder) return;

    const src = placeholder.dataset.src;
    const title = placeholder.dataset.title;
    if (!src) return;

    // Create loading indicator
    placeholder.innerHTML = `
      <div class="d-flex align-items-center justify-content-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading video...</span>
      </div>
    `;

    // Create iframe with a small delay for better UX
    setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.className = "w-100 h-100 rounded-top";
      iframe.allowFullscreen = true;
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.title = title || "YouTube video";

      // Replace placeholder with iframe
      placeholder.parentNode.replaceChild(iframe, placeholder);
    }, 500);
  }

  /**
   * Creates a modern Bootstrap 5 video card element
   * @private
   */
  #createVideoElement(playlist) {
    const layoutClass =
      EnhancedStreaming.CONFIG.GRID_LAYOUTS[this.#currentView] ||
      EnhancedStreaming.CONFIG.GRID_LAYOUTS.responsive;

    const colDiv = document.createElement("div");
    colDiv.className = `${layoutClass} mb-4`;
    colDiv.dataset.playlistId = playlist.playlistId;

    const isFavorite = this.#isFavorite(playlist.playlistId);

    colDiv.innerHTML = `
      <div class="card h-100 shadow-sm ${isFavorite ? "border-warning" : ""}">
        <div class="ratio ratio-16x9">
          ${
            this.options.enableLazyLoading
              ? `<div class="video-placeholder d-flex align-items-center justify-content-center rounded-top"
                  data-src="https://www.youtube.com/embed/videoseries?list=${playlist.playlistId}"
                  data-title="${playlist.title}">
               <div class="text-center p-3">
                 <i class="fab fa-youtube fa-4x text-danger mb-3"></i>
                 <h6 class="mb-3">${playlist.title}</h6>
                 <button class="btn btn-primary load-video-btn" data-translate="loadPlayer">
                   <i class="fas fa-play me-2"></i><span data-translate="loadPlayer">Load Player</span>
                 </button>
                 <p class="small mt-2 mb-0" data-translate="clickToLoad">Click to load the video player</p>
               </div>
             </div>`
              : `<iframe
               src="https://www.youtube.com/embed/videoseries?list=${playlist.playlistId}"
               title="${playlist.title}"
               class="w-100 h-100 rounded-top"
               allowfullscreen
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               referrerpolicy="strict-origin-when-cross-origin">
             </iframe>`
          }
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="card-title mb-0 flex-grow-1">${playlist.title}</h5>
            <button class="btn btn-outline-warning btn-sm favorite-btn ms-2 ${
              isFavorite ? "active" : ""
            }"
                    data-playlist-id="${playlist.playlistId}"
                    aria-label="${
                      isFavorite ? "Remove from favorites" : "Add to favorites"
                    }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="mt-auto">
            <a href="${playlist.url}"
               target="_blank"
               rel="noopener noreferrer"
               class="btn btn-primary btn-sm w-100">
              <i class="fab fa-youtube me-1"></i>
              <span data-translate="openInYoutube"></span>
            </a>
          </div>
        </div>
      </div>
    `;

    return colDiv;
  }

  /**
   * Check if a playlist is favorite
   * @private
   */
  #isFavorite(playlistId) {
    return this.#favorites.has(`youtube-${playlistId}`);
  }

  /**
   * Setup event listeners
   * @private
   */
  #setupEventListeners() {
    // Search functionality
    const searchInput = this.#elements.get(this.options.searchInput);
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.#filterPlaylists(e.target.value);
        }, 300); // Debounce search
      });
    }

    // View toggle
    const viewToggle = this.#elements.get(this.options.viewToggle);
    if (viewToggle) {
      viewToggle.addEventListener("click", () => {
        this.#toggleView();
      });
    }

    // Event delegation for dynamic content
    const container = this.#elements.get(this.options.container);
    if (container) {
      container.addEventListener("click", (e) => {
        // Handle favorite button clicks
        if (e.target.closest(".favorite-btn")) {
          const btn = e.target.closest(".favorite-btn");
          const playlistId = btn.dataset.playlistId;
          this.#toggleFavorite(playlistId);
        }

        // Handle load video button clicks
        if (e.target.closest(".load-video-btn")) {
          const placeholder = e.target.closest(".video-placeholder");
          if (placeholder) {
            // Disable the button to prevent multiple clicks
            const button = placeholder.querySelector(".load-video-btn");
            if (button) {
              button.disabled = true;
            }
            this.#loadVideoFrame(placeholder.parentElement);
          }
        }
      });
    }
  }

  /**
   * Setup initial view configuration
   * @private
   */
  #setupInitialView() {
    // Load saved view preference
    const savedView = localStorage.getItem(
      EnhancedStreaming.CONFIG.STORAGE_KEYS.VIEW
    );
    if (savedView && EnhancedStreaming.CONFIG.GRID_LAYOUTS[savedView]) {
      this.#currentView = savedView;
    }

    // Update view toggle button
    this.#updateViewToggle();
  }

  /**
   * Render playlists to the container
   * @private
   */
  #renderPlaylists() {
    const container = this.#elements.get(this.options.container);
    if (!container) {
      console.error("Container not found for rendering");
      return;
    }

    // Clear container
    container.innerHTML = "";

    if (!this.#youtubeData || this.#youtubeData.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">
            <i class="fas fa-info-circle me-2"></i>
            No playlists found.
          </div>
        </div>
      `;
      return;
    }

    // Sort data (favorites first)
    const sortedData = [...this.#youtubeData].sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

    // Create Bootstrap container structure
    const containerFluid = document.createElement("div");
    containerFluid.className = "container-fluid";

    const row = document.createElement("div");
    row.className = "row g-4";

    // Render each playlist
    sortedData.forEach((playlist) => {
      const playlistElement = this.#createVideoElement(playlist);
      row.appendChild(playlistElement);

      // Intersection observer disabled for manual loading
      // Videos will be loaded manually when user clicks "Load Player" button
    });

    containerFluid.appendChild(row);
    container.appendChild(containerFluid);

    console.log(`Rendered ${sortedData.length} playlists`);
  }

  /**
   * Filter playlists based on search term
   * @private
   */
  #filterPlaylists(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (term === "") {
      // Reset to original data
      this.#youtubeData = [...this.#originalData];
    } else {
      // Filter original data
      this.#youtubeData = this.#originalData.filter((playlist) =>
        playlist.title.toLowerCase().includes(term)
      );
    }

    // Re-render
    this.#renderPlaylists();
  }

  /**
   * Toggle view between grid and list
   * @private
   */
  #toggleView() {
    const views = Object.keys(EnhancedStreaming.CONFIG.GRID_LAYOUTS);
    const currentIndex = views.indexOf(this.#currentView);
    const nextIndex = (currentIndex + 1) % views.length;

    this.#currentView = views[nextIndex];

    // Save preference
    localStorage.setItem(
      EnhancedStreaming.CONFIG.STORAGE_KEYS.VIEW,
      this.#currentView
    );

    // Update UI
    this.#updateViewToggle();
    this.#renderPlaylists();
  }

  /**
   * Update view toggle button
   * @private
   */
  #updateViewToggle() {
    const viewToggle = this.#elements.get(this.options.viewToggle);
    if (!viewToggle) return;

    const icons = {
      responsive: "fas fa-th",
      large: "fas fa-th-large",
      medium: "fas fa-th",
      small: "fas fa-th",
      single: "fas fa-list",
    };

    viewToggle.innerHTML = `<i class="${
      icons[this.#currentView] || icons.responsive
    }"></i>`;
    viewToggle.title = `Current view: ${this.#currentView}`;
  }

  /**
   * Toggle favorite status of a playlist
   * @private
   */
  #toggleFavorite(playlistId) {
    const favoriteKey = `youtube-${playlistId}`;
    const isFavorite = this.#favorites.has(favoriteKey);

    if (isFavorite) {
      this.#favorites.delete(favoriteKey);
    } else {
      this.#favorites.add(favoriteKey);
    }

    // Save to localStorage
    this.#saveFavorites();

    // Update data
    this.#youtubeData = this.#youtubeData.map((playlist) => {
      if (playlist.playlistId === playlistId) {
        return { ...playlist, isFavorite: !isFavorite };
      }
      return playlist;
    });

    // Update original data too
    this.#originalData = this.#originalData.map((playlist) => {
      if (playlist.playlistId === playlistId) {
        return { ...playlist, isFavorite: !isFavorite };
      }
      return playlist;
    });

    // Re-render to show changes
    this.#renderPlaylists();
  }

  /**
   * Show loading animation
   * @private
   */
  #showLoading() {
    const loading = this.#elements.get(this.options.loadingElement);
    if (loading) {
      loading.style.display = "block";
    }
  }

  /**
   * Hide loading animation
   * @private
   */
  #hideLoading() {
    const loading = this.#elements.get(this.options.loadingElement);
    if (loading) {
      loading.style.display = "none";
    }
  }

  /**
   * Show error message
   * @private
   */
  #showError(message) {
    const container = this.#elements.get(this.options.container);
    if (!container) return;

    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${message}
          <button class="btn btn-outline-danger btn-sm ms-3" onclick="location.reload()">
            <i class="fas fa-sync-alt me-1"></i><span data-translate="retryButton">Retry</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Public method to refresh data
   * @public
   */
  async refresh() {
    try {
      await this.#loadPlaylistData();
      this.#renderPlaylists();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }

  /**
   * Public method to get current data
   * @public
   */
  getData() {
    return [...this.#youtubeData];
  }

  /**
   * Public method to search playlists
   * @public
   */
  search(term) {
    this.#filterPlaylists(term);
  }

  /**
   * Cleanup method
   * @public
   */
  destroy() {
    // Cancel any pending requests
    if (this.#abortController) {
      this.#abortController.abort();
    }

    // Disconnect intersection observer
    if (this.#intersectionObserver) {
      this.#intersectionObserver.disconnect();
    }

    // Clear container
    const container = this.#elements.get(this.options.container);
    if (container) {
      container.innerHTML = "";
    }

    // Reset state
    this.#initialized = false;
    this.#elements.clear();
  }
}

// Legacy data for backward compatibility
const playlistData = [];

/**
 * Legacy function - Creates a video element with iframe and link using Bootstrap 5 grid
 * @param {Object} video - Video object containing title, playlistId, and url
 * @param {string} layoutType - Grid layout type to use (optional)
 * @returns {HTMLElement} - The created video element
 * @deprecated Use EnhancedStreaming class instead
 */
function createVideoElement(video, layoutType = "responsive") {
  const colDiv = document.createElement("div");
  // Use the specified layout or default responsive layout
  const gridClass = gridLayouts[layoutType] || gridLayouts.responsive;
  colDiv.className = `${gridClass} mb-4`;

  colDiv.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="ratio ratio-16x9">
        <iframe
          src="https://www.youtube.com/embed/${video.playlistId}?si=dca-S4qIp2txXlSA"
          title="${video.title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="rounded-top"
        ></iframe>
      </div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${video.title}</h5>
        <div class="mt-auto">
          <a
            rel="noopener"
            class="btn btn-primary btn-sm w-100"
            href="${video.url}"
            target="_blank"
          >
            <i class="bi bi-play-circle me-1"></i>
            Assistir no YouTube
          </a>
        </div>
      </div>
    </div>
  `;

  return colDiv;
}

/**
 * Loads and displays all videos in the video container using Bootstrap 5 grid
 * @param {string} layoutType - Grid layout type to use (optional)
 * @returns {void}
 */
function loadVideos(layoutType = "responsive") {
  const videoContainer = document.getElementById("videoContainer");

  if (!videoContainer) {
    console.warn("videoContainer não encontrado.");
    return;
  }

  // Clear existing content
  videoContainer.innerHTML = "";

  // Create Bootstrap 5 grid structure
  const containerFluid = document.createElement("div");
  containerFluid.className = "container-fluid";

  const row = document.createElement("div");
  row.className = "row g-4"; // g-4 adds consistent gutters between columns

  // Add each video to the row with specified layout
  playlistData.forEach((video) => {
    const videoElement = createVideoElement(video, layoutType);
    row.appendChild(videoElement);
  });

  containerFluid.appendChild(row);
  videoContainer.appendChild(containerFluid);
}

/**
 * Gets the video data array
 * @returns {Array} - Array of video objects
 */
function getplaylistData() {
  return playlistData;
}

/**
 * Adds a new video to the collection
 * @param {Object} video - Video object containing title, videoId, and url
 */
function addVideo(video) {
  if (video && video.title && video.videoId && video.url) {
    playlistData.push(video);
  } else {
    console.error("Invalid video object provided");
  }
}

/**
 * Grid layout configuration options
 */
const gridLayouts = {
  // Responsive layout (default)
  responsive: "col-12 col-md-6 col-lg-4 col-xl-3",
  // Large cards - 2 per row on medium screens, 3 on large
  large: "col-12 col-md-6 col-lg-4",
  // Medium cards - 2 per row on small screens, 4 on large
  medium: "col-12 col-sm-6 col-lg-3",
  // Small cards - 3 per row on medium screens, 6 on large
  small: "col-12 col-sm-4 col-md-3 col-lg-2",
  // Single column layout
  single: "col-12",
};

/**
 * Sets the grid layout for video cards
 * @param {string} layoutType - Type of layout (responsive, large, medium, small, single)
 */
function setGridLayout(layoutType = "responsive") {
  const layout = gridLayouts[layoutType] || gridLayouts.responsive;

  // Update existing video cards
  const videoCards = document.querySelectorAll("#videoContainer .col-12");
  videoCards.forEach((card) => {
    card.className = `${layout} mb-4`;
  });
}

/**
 * Loads videos with a specific grid layout
 * @param {string} layoutType - Type of layout to use
 */
function loadVideosWithLayout(layoutType = "responsive") {
  loadVideos();
  setGridLayout(layoutType);
}

/**
 * Gets available grid layout options
 * @returns {Object} - Object containing available layout types
 */
function getGridLayouts() {
  return Object.keys(gridLayouts);
}

// Global instance for backward compatibility
let streamingInstance = null;

/**
 * Initialize the enhanced streaming system
 * @param {Object} options - Configuration options
 * @returns {EnhancedStreaming} - The streaming instance
 */
function initializeEnhancedStreaming(options = {}) {
  if (!streamingInstance) {
    streamingInstance = new EnhancedStreaming(options);
  }
  return streamingInstance;
}

/**
 * Get the current streaming instance
 * @returns {EnhancedStreaming|null} - The streaming instance or null
 */
function getStreamingInstance() {
  return streamingInstance;
}

/**
 * Modern initialization for the enhanced streaming system
 */
function initializeModernStreaming() {
  // Check if we're on the videos page
  const container = document.getElementById("videoContainer");
  if (!container) {
    console.log("Video container not found, skipping streaming initialization");
    return;
  }

  console.log("Initializing modern streaming system...");

  const options = {
    container: "videoContainer",
    searchInput: "youtubeSearch",
    loadingElement: "loadingAnimation",
    viewToggle: "viewToggle",
    pagination: "paginationYoutube",
    autoInit: true,
    enableLazyLoading: true,
    enableIntersectionObserver: false, // Disabled for manual loading with buttons
  };

  streamingInstance = new EnhancedStreaming(options);

  // Make instance globally available for debugging
  if (typeof window !== "undefined") {
    window.streamingInstance = streamingInstance;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure all elements are loaded
  setTimeout(initializeModernStreaming, 100);
});

// Also listen for template loaded events (for SPA-like behavior)
document.addEventListener("videosTemplateLoaded", () => {
  setTimeout(initializeModernStreaming, 100);
});

// Export functions for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    EnhancedStreaming,
    initializeEnhancedStreaming,
    getStreamingInstance,
    initializeModernStreaming,
    // Legacy exports
    loadVideos,
    getplaylistData,
    addVideo,
    createVideoElement,
    setGridLayout,
    loadVideosWithLayout,
    getGridLayouts,
    gridLayouts,
  };
}

// Global exports for browser usage
if (typeof window !== "undefined") {
  window.EnhancedStreaming = EnhancedStreaming;
  window.initializeEnhancedStreaming = initializeEnhancedStreaming;
  window.getStreamingInstance = getStreamingInstance;
  window.initializeModernStreaming = initializeModernStreaming;
}
