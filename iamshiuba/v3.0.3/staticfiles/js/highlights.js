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
    this.container = document.getElementById("highlight-section");

    if (!this.container) {
      console.warn(
        "Highlight section not found. Skipping highlight initialization."
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

    // Update iframe attributes
    const iframe = this.highlightElement.querySelector("iframe");
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/videoseries?list=OLAK5uy_laLvEldekJ_qsP5DMbG-PYcEW3oQEYu_Q`;
      iframe.title = "Featured Playlist";
    }

    // Show highlight element
    this.highlightElement.style.display = "block";

    // Update button click handler
    const button = document.getElementById("playlist-button");
    if (button) {
      button.onclick = () => {
        window.open(
          `https://www.youtube.com/playlist?list=OLAK5uy_laLvEldekJ_qsP5DMbG-PYcEW3oQEYu_Q`,
          "_blank"
        );
      };
    }
  }
}

// Initialize the highlight manager
const highlightManager = new HighlightManager();
