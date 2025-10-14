
/**
 * HighlightManager - Manages the featured video highlights section
 */
class HighlightManager {
  constructor() {
    this.container = null;
    this.highlightElement = null;

    // Initialize when DOM is loaded
    this.init();
  }

  /**
   * Initialize the highlight manager
   */
  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Set up the highlight manager
   */
  setup() {
    // Find the container and template elements
    this.container = document.getElementById("highlightContainer");

    if (!this.container) {
      console.warn(
        "Highlight container not found. Skipping highlight initialization."
      );
      return;
    }

    this.highlightElement = this.container.querySelector(".highlight-wrapper");
    
    // Render the highlight immediately
    this.renderHighlight();
  }

  /**
   * Render the highlight in the container
   */
  renderHighlight() {
    if (!this.container || !this.highlightElement) return;

    const PLAYLIST_ID = "OLAK5uy_laLvEldekJ_qsP5DMbG-PYcEW3oQEYu_Q";
    
    // Update iframe attributes
    const iframe = this.highlightElement.querySelector("iframe");
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}`;
      iframe.title = "Featured Playlist";
    }
    
    // Show highlight element
    this.highlightElement.style.display = "block";

    // Update button click handler
    const buttonContainer = document.querySelector(".button-container button");
    if (buttonContainer) {
      buttonContainer.onclick = function () {
        window.open(`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`);
      };
    }
  }
}

// Initialize the highlight manager
const highlightManager = new HighlightManager();
