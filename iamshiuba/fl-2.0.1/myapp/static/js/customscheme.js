/* 
  THIS SCRIPT IS UNDER CONSTRUCTION,
  IT WILL MAKE POSSIBLE FOR USERS TO CUSTOMIZE MORE THE APP,
  BUT I'M KINDA LAZY (AND ALSO TOO DUMB) TO FINISH IT RIGHT NOW!
*/

document.addEventListener("DOMContentLoaded", () => {
  const customSchemeSwitcher = document.getElementById("custom-scheme-switcher");

  function initializeCustomScheme() {
    const savedCustomScheme = localStorage.getItem("custom-scheme") || "default";
    setCustomScheme(savedCustomScheme);
  }

  function setCustomScheme(customScheme) {
    document.documentElement.setAttribute("data-custom-scheme", customScheme);
    updateCustomSchemeButtonIcon(customScheme === "custom");
    localStorage.setItem("custom-scheme", customScheme);
  }

  function updateCustomSchemeButtonIcon(isCustom) {
    const icon = customSchemeSwitcher.querySelector('i');
    if (isCustom) {
      icon.classList.remove('fa-paint-brush');
      icon.classList.add('fa-palette');
    } else {
      icon.classList.remove('fa-palette');
      icon.classList.add('fa-paint-brush');
    }
  }

  customSchemeSwitcher.addEventListener("click", () => {
    const currentCustomScheme = document.documentElement.getAttribute("data-custom-scheme");
    setCustomScheme(currentCustomScheme === "custom" ? "default" : "custom");
  });

  initializeCustomScheme();
});