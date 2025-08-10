// Define loadComponent if not exists
if (!window.loadComponent) {
  window.loadComponent = async function (selector, url) {
    try {
      const element = document.querySelector(selector);
      if (!element) {
        console.warn(`Element with selector "${selector}" not found`);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }

      const html = await response.text();
      element.innerHTML = html;
    } catch (error) {
      console.error("Error loading component:", error);
    }
  };
}

// Load footer and set up dynamic year
async function initFooter() {
  await loadComponent("footer", "footer.html");

  function updateYear() {
    const currentYear = new Date().getFullYear();

    // Try to find specific year placeholder
    const yearElement =
      document.querySelector("#current-year") ||
      document.querySelector(".js-current-year");
    if (yearElement) {
      yearElement.textContent = currentYear;
      return;
    }

    // If no placeholder, update the copyright text directly
    const footerParagraph = document.querySelector("footer p");
    if (footerParagraph) {
      // Update the year range in the copyright text
      footerParagraph.innerHTML = footerParagraph.innerHTML.replace(
        /&copy;\s*(\d{4})\s*-\s*\d{4}/,
        `&copy; $1 - ${currentYear}`
      );
    }
  }

  updateYear();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initFooter);
