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

// Load header and set up navigation
async function initNav() {
  await loadComponent("header", "header.html");

  function setActive() {
    const currentPath = location.pathname
      .replace(/\/$/, "")
      .replace(/index\.html$/, "");

    document.querySelectorAll("header .nav-link[href]").forEach((link) => {
      const linkPath = new URL(link.href, location.origin).pathname
        .replace(/\/$/, "")
        .replace(/index\.html$/, "");
      const isActive =
        currentPath === linkPath ||
        (currentPath === "" && linkPath.includes("home"));

      // Toggle active class on link and parent li
      link.classList.toggle("active", isActive);
      const parentLi = link.closest("li.nav-item");
      if (parentLi) {
        parentLi.classList.toggle("active", isActive);
        if (isActive) {
          parentLi.setAttribute("aria-current", "page");
        } else {
          parentLi.removeAttribute("aria-current");
        }
      }
    });
  }

  // Set active on load and navigation
  setActive();
  window.addEventListener("popstate", setActive);
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initNav);
