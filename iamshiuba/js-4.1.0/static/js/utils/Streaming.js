/**
 * StreamingManager - Manages the streaming playlists section
 * Dynamically generates iframe elements for YouTube and Spotify playlists
 */
class StreamingManager {
  constructor() {
    this.youtubeData = null;
    this.spotifyData = null;
    this.currentTab = "youtube";
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.searchQuery = "";

    // DOM elements
    this.youtubeContainer = null;
    this.spotifyContainer = null;
    this.youtubeSearch = null;
    this.spotifySearch = null;
    this.tabButtons = null;
    this.loadingAnimation = null;

    // Lazy loading
    this.intersectionObserver = null;
    this.loadedIframes = new Set();

    this.init();
  }

  /**
   * Initialize the streaming manager
   */
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Set up the streaming manager
   */
  async setup() {
    this.findDOMElements();
    this.setupEventListeners();
    this.initializeView();
    await this.loadData();
    this.renderCurrentTab();
  }

  /**
   * Find and cache DOM elements
   */
  findDOMElements() {
    this.youtubeContainer = document.getElementById("playlistContainer");
    this.spotifyContainer = document.getElementById("spotifyContainer");
    this.youtubeSearch = document.getElementById("youtubeSearch");
    this.spotifySearch = document.getElementById("spotifySearch");
    this.loadingAnimation = document.getElementById("loadingAnimation");
    this.tabButtons = document.querySelectorAll(".tab-button");

    if (!this.youtubeContainer || !this.spotifyContainer) {
      console.warn(
        "Streaming containers not found. Skipping streaming initialization."
      );
      return false;
    }
    return true;
  }

  /**
   * Initialize the default view
   */
  initializeView() {
    // Set default view to grid
    document.body.classList.add("view-grid");
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Tab switching
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // View toggle functionality
    const viewToggle = document.getElementById("viewToggle");
    if (viewToggle) {
      viewToggle.addEventListener("click", () => {
        this.toggleView();
      });
    }

    // Load all button functionality
    const loadAllBtn = document.getElementById("loadAllBtn");
    if (loadAllBtn) {
      loadAllBtn.addEventListener("click", () => {
        this.loadAllIframes();
      });
    }

    // Search functionality
    if (this.youtubeSearch) {
      this.youtubeSearch.addEventListener("input", (e) => {
        if (this.currentTab === "youtube") {
          this.searchQuery = e.target.value.toLowerCase();
          this.currentPage = 1;
          this.renderCurrentTab();
        }
      });
    }

    if (this.spotifySearch) {
      this.spotifySearch.addEventListener("input", (e) => {
        if (this.currentTab === "spotify") {
          this.searchQuery = e.target.value.toLowerCase();
          this.currentPage = 1;
          this.renderCurrentTab();
        }
      });
    }
  }

  /**
   * Load playlist data from JSON files
   */
  async loadData() {
    this.showLoading(true);

    try {
      // Load YouTube playlists
      const youtubeResponse = await fetch(
        "./static/data/youtube-playlists.json"
      );
      this.youtubeData = await youtubeResponse.json();

      // Load Spotify playlists
      const spotifyResponse = await fetch(
        "./static/data/spotify-playlists.json"
      );
      this.spotifyData = await spotifyResponse.json();

      console.log("Playlist data loaded successfully");
    } catch (error) {
      console.error("Error loading playlist data:", error);
      this.showError("Failed to load playlist data");
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Switch between YouTube and Spotify tabs
   */
  switchTab(tab) {
    if (this.currentTab === tab) return;

    this.currentTab = tab;
    this.currentPage = 1;
    this.searchQuery = "";

    // Update tab button states
    this.tabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });

    // Clear search inputs
    if (this.youtubeSearch) this.youtubeSearch.value = "";
    if (this.spotifySearch) this.spotifySearch.value = "";

    // Show/hide sections
    const youtubeSection = document.querySelector(".youtube-section");
    const spotifySection = document.querySelector(".spotify-section");

    if (youtubeSection && spotifySection) {
      youtubeSection.style.display = tab === "youtube" ? "block" : "none";
      spotifySection.style.display = tab === "spotify" ? "block" : "none";
    }

    this.renderCurrentTab();
  }

  /**
   * Render the current tab content
   */
  renderCurrentTab() {
    if (this.currentTab === "youtube") {
      this.renderYoutubePlaylists();
    } else {
      this.renderSpotifyPlaylists();
    }
    
    // Atualizar traduções após renderizar o conteúdo
    if (window.translationManager) {
      setTimeout(() => {
        window.translationManager.refreshDynamicTranslations();
      }, 100);
    }
  }

  /**
   * Generate YouTube iframe HTML with lazy loading
   */
  generateYoutubeIframe(playlist) {
    return `
      <div class="playlist-item" data-title="${playlist.title.toLowerCase()}" data-playlist-id="${
      playlist.playlistId
    }" data-platform="youtube">
        <div class="video-container">
          <div class="placeholder">
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <i class="fab fa-youtube"></i>
              </div>
              <p>${playlist.title}</p>
              <button class="load-video-btn" onclick="streamingManager.loadIframe(this)">
                <i class="fas fa-play"></i> <span data-translate="loadVideo">Load Video</span>
              </button>
            </div>
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-header">
            <h3>${playlist.title}</h3>
          </div>
          <div class="playlist-actions">
            <a href="${
              playlist.url
            }" target="_blank" rel="noopener" class="action-button youtube">
              <i class="fab fa-youtube"></i> <span data-translate="OpenYoutube">Open on YouTube</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate Spotify iframe HTML with lazy loading
   */
  generateSpotifyIframe(playlist) {
    return `
      <div class="playlist-item" data-title="${playlist.title.toLowerCase()}" data-playlist-id="${
      playlist.playlistId
    }" data-platform="spotify">
        <div class="video-container">
          <div class="placeholder">
            <div class="placeholder-content spotify">
              <div class="placeholder-icon">
                <i class="fab fa-spotify"></i>
              </div>
              <p>${playlist.title}</p>
              <button class="load-video-btn" onclick="streamingManager.loadIframe(this)">
                <i class="fas fa-play"></i> <span data-translate="loadPlayer">Load Player</span>
              </button>
            </div>
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-header">
            <h3>${playlist.title}</h3>
          </div>
          <div class="playlist-actions">
            <a href="${
              playlist.url
            }" target="_blank" rel="noopener" class="action-button spotify">
              <i class="fab fa-spotify"></i> <span data-translate="OpenSpotify">Open on Spotify</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Filter playlists based on search query
   */
  filterPlaylists(playlists, query) {
    if (!query) return playlists;
    return playlists.filter((playlist) =>
      playlist.title.toLowerCase().includes(query)
    );
  }

  /**
   * Paginate playlists array
   */
  paginatePlaylists(playlists, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return playlists.slice(startIndex, endIndex);
  }

  /**
   * Render YouTube playlists
   */
  renderYoutubePlaylists() {
    if (!this.youtubeData || !this.youtubeContainer) return;

    const playlists = this.youtubeData.playlists || [];
    const filteredPlaylists = this.filterPlaylists(playlists, this.searchQuery);
    const paginatedPlaylists = this.paginatePlaylists(
      filteredPlaylists,
      this.currentPage,
      this.itemsPerPage
    );

    if (filteredPlaylists.length === 0) {
      this.youtubeContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>No YouTube playlists found matching "${this.searchQuery}"</p>
        </div>
      `;
      return;
    }

    // Generate HTML for all playlists
    const playlistsHTML = paginatedPlaylists
      .map((playlist) => this.generateYoutubeIframe(playlist))
      .join("");

    // Update container
    this.youtubeContainer.innerHTML = playlistsHTML;

    // Update pagination
    this.updatePagination("youtube", filteredPlaylists.length);

    // Update load all button text
    this.updateLoadAllButton();
  }

  /**
   * Render Spotify playlists
   */
  renderSpotifyPlaylists() {
    if (!this.spotifyData || !this.spotifyContainer) return;

    const playlists = this.spotifyData.playlists || [];
    const filteredPlaylists = this.filterPlaylists(playlists, this.searchQuery);
    const paginatedPlaylists = this.paginatePlaylists(
      filteredPlaylists,
      this.currentPage,
      this.itemsPerPage
    );

    if (filteredPlaylists.length === 0) {
      this.spotifyContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <p>No Spotify playlists found matching "${this.searchQuery}"</p>
        </div>
      `;
      return;
    }

    // Generate HTML for all playlists
    const playlistsHTML = paginatedPlaylists
      .map((playlist) => this.generateSpotifyIframe(playlist))
      .join("");

    // Update container
    this.spotifyContainer.innerHTML = playlistsHTML;

    // Update pagination
    this.updatePagination("spotify", filteredPlaylists.length);

    // Update load all button text
    this.updateLoadAllButton();
  }

  /**
   * Update pagination controls
   */
  updatePagination(platform, totalItems) {
    const paginationContainer = document.getElementById(
      `pagination${platform.charAt(0).toUpperCase() + platform.slice(1)}`
    );
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / this.itemsPerPage);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let paginationHTML = "";

    // Previous button
    if (this.currentPage > 1) {
      paginationHTML += `<button class="pagination-button" onclick="streamingManager.goToPage(${
        this.currentPage - 1
      })">
        <i class="fas fa-chevron-left"></i>
      </button>`;
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === this.currentPage ? "active" : "";
      paginationHTML += `<button class="pagination-button ${isActive}" onclick="streamingManager.goToPage(${i})">${i}</button>`;
    }

    // Next button
    if (this.currentPage < totalPages) {
      paginationHTML += `<button class="pagination-button" onclick="streamingManager.goToPage(${
        this.currentPage + 1
      })">
        <i class="fas fa-chevron-right"></i>
      </button>`;
    }

    paginationContainer.innerHTML = paginationHTML;
  }

  /**
   * Go to specific page
   */
  goToPage(page) {
    this.currentPage = page;
    this.renderCurrentTab();
  }

  /**
   * Show/hide loading animation
   */
  showLoading(show) {
    if (this.loadingAnimation) {
      this.loadingAnimation.style.display = show ? "block" : "none";
    }
  }

  /**
   * Load iframe on demand (lazy loading)
   */
  loadIframe(button) {
    const playlistItem = button.closest(".playlist-item");
    const videoContainer = playlistItem.querySelector(".video-container");
    const placeholder = videoContainer.querySelector(".placeholder");
    const playlistId = playlistItem.dataset.playlistId;
    const platform = playlistItem.dataset.platform;

    // Check if iframe already exists
    if (videoContainer.querySelector("iframe")) {
      placeholder.style.display = "none";
      return;
    }

    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;

    // Create iframe based on platform
    let iframe;
    if (platform === "youtube") {
      iframe = document.createElement("iframe");
      iframe.width = "560";
      iframe.height = "315";
      iframe.src = `https://www.youtube.com/embed/videoseries?si=T8n7UDd9G2Xa4m65&list=${playlistId}`;
      iframe.title = "YouTube video player";
      iframe.style.border = "none";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
    } else if (platform === "spotify") {
      iframe = document.createElement("iframe");
      iframe.style.borderRadius = "12px";
      iframe.src = `https://open.spotify.com/embed/album/${playlistId}?utm_source=generator`;
      iframe.width = "100%";
      iframe.height = "352";
      iframe.style.border = "none";
      iframe.allowFullscreen = true;
      iframe.allow =
        "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      iframe.loading = "lazy";
    }

    // Replace placeholder with iframe
    if (iframe) {
      iframe.onload = () => {
        placeholder.style.display = "none";
      };

      iframe.onerror = () => {
        button.innerHTML =
          '<i class="fas fa-exclamation-triangle"></i> Error loading';
        button.disabled = false;
      };

      videoContainer.appendChild(iframe);
    }
  }

  /**
   * Load all iframes at once
   */
  loadAllIframes() {
    const loadButtons = document.querySelectorAll(".load-video-btn");
    const loadAllBtn = document.getElementById("loadAllBtn");

    if (loadAllBtn) {
      loadAllBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Loading All...';
      loadAllBtn.disabled = true;
    }

    let loadedCount = 0;
    const totalCount = loadButtons.length;

    if (totalCount === 0) {
      if (loadAllBtn) {
        loadAllBtn.innerHTML = '<i class="fas fa-check"></i> All Loaded';
        setTimeout(() => {
          loadAllBtn.innerHTML = '<i class="fas fa-download"></i> Load All';
          loadAllBtn.disabled = false;
        }, 2000);
      }
      return;
    }

    loadButtons.forEach((button, index) => {
      // Stagger the loading to avoid overwhelming the browser
      setTimeout(() => {
        if (!button.disabled) {
          this.loadIframe(button);
        }

        loadedCount++;
        if (loadedCount === totalCount && loadAllBtn) {
          loadAllBtn.innerHTML = '<i class="fas fa-check"></i> All Loaded';
          setTimeout(() => {
            loadAllBtn.innerHTML = '<i class="fas fa-download"></i> Load All';
            loadAllBtn.disabled = false;
          }, 2000);
        }
      }, index * 200); // 200ms delay between each load
    });
  }

  /**
   * Toggle between grid and list view
   */
  toggleView() {
    const body = document.body;
    const viewToggle = document.getElementById("viewToggle");

    if (body.classList.contains("view-list")) {
      body.classList.remove("view-list");
      body.classList.add("view-grid");
      if (viewToggle) {
        viewToggle.innerHTML = '<i class="fas fa-list"></i>';
        viewToggle.setAttribute("aria-label", "Switch to list view");
      }
    } else {
      body.classList.remove("view-grid");
      body.classList.add("view-list");
      if (viewToggle) {
        viewToggle.innerHTML = '<i class="fas fa-th"></i>';
        viewToggle.setAttribute("aria-label", "Switch to grid view");
      }
    }
  }

  /**
   * Update load all button text with count
   */
  updateLoadAllButton() {
    const loadAllBtn = document.getElementById("loadAllBtn");
    if (!loadAllBtn) return;

    const loadButtons = document.querySelectorAll(
      ".load-video-btn:not([disabled])"
    );
    const count = loadButtons.length;

    if (count === 0) {
      loadAllBtn.innerHTML = '<i class="fas fa-check"></i> All Loaded';
      loadAllBtn.disabled = true;
    } else {
      loadAllBtn.innerHTML = `<i class="fas fa-download"></i> Load All (${count})`;
      loadAllBtn.disabled = false;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error(message);
    // You can implement a more sophisticated error display here
    if (this.youtubeContainer) {
      this.youtubeContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
    if (this.spotifyContainer) {
      this.spotifyContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
  }
}

// Initialize the streaming manager
const streamingManager = new StreamingManager();
