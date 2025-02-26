document.addEventListener("DOMContentLoaded", () => {
  const themeSwitcher = document.getElementById("theme-switcher");

  // Função para inicializar o tema com base na preferência do usuário ou do sistema
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
  }

  // Função para definir o tema e atualizar o ícone do botão
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButton(theme === "dark");
    localStorage.setItem("theme", theme);
  }

  // Função para atualizar o ícone do botão do tema
  function updateThemeButton(isDark) {
    if (isDark) {
      themeSwitcher.classList.remove('fa-moon');
      themeSwitcher.classList.add('fa-sun');
    } else {
      themeSwitcher.classList.remove('fa-sun');
      themeSwitcher.classList.add('fa-moon');
    }
  }

  // Event listener para o botão de alternar tema
  themeSwitcher.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });

  // Inicializa o tema ao carregar a página
  initializeTheme();
});