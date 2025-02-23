/* This JavaScript code snippet is used to add an "active" class to the navigation link that
corresponds to the current page. Here's a breakdown of what it does: */
const currentPage = window.location.pathname;
document.querySelectorAll(".nav-link").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

/* This JavaScript code snippet is targeting a group of buttons within an element with the id
"lang-container". Here's a breakdown of what it does: */
const langButtons = document.querySelectorAll(
  `#lang-container button#langselect`
);
if (langButtons) {
  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.classList.contains("active")) {
        button.classList.remove("active");
      } else {
        langButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
      }
    });
  });
}
