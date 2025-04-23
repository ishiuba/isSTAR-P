document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("is_theme-switcher");

  // Função para inicializar o tema com base na preferência do usuário ou do sistema
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "is_dark" : "is_light");
    setTheme(savedTheme);
  }

  // Função para definir o tema e atualizar o ícone do botão
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtonIcon(theme === "is_dark");
    localStorage.setItem("theme", theme);
  }

  // Função para atualizar o ícone do botão do tema
  function updateThemeButtonIcon(isDark) {
    const icon = themeSwitcher.querySelector('i');
    if (isDark) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }

  // Event listener para o botão de alternar tema
  themeSwitcher.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "is_dark" ? "is_light" : "is_dark");
  });

  // Inicializa o tema ao carregar a página
  initializeTheme();
});