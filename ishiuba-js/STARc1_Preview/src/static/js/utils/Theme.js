document.addEventListener("DOMContentLoaded", () => {
  // Função para inicializar o tema com base na preferência do usuário ou do sistema
  function initializeTheme() {
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(savedTheme);
  }

  // Função para definir o tema e atualizar os botões de tema
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtons(theme === "dark");
    localStorage.setItem("theme", theme);
  }

  // Função para atualizar todos os botões de tema
  function updateThemeButtons(isDark) {
    // Seleciona todos os elementos com atributo data-theme-switch
    const themeSwitchers = document.querySelectorAll("[data-theme-switch]");
    
    themeSwitchers.forEach(switcher => {
      // Verifica se o elemento usa classes para ícones
      if (switcher.classList.contains("fa-sun") || switcher.classList.contains("fa-moon")) {
        if (isDark) {
          switcher.classList.remove("fa-sun");
          switcher.classList.add("fa-moon");
        } else {
          switcher.classList.remove("fa-moon");
          switcher.classList.add("fa-sun");
        }
      }
      
      // Atualiza o atributo data-current-theme para todos os elementos
      switcher.setAttribute("data-current-theme", isDark ? "dark" : "light");
    });
  }

  // Event listener para todos os elementos com data-theme-switch
  document.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-theme-switch")) {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      setTheme(currentTheme === "dark" ? "light" : "dark");
    }
  });

  // Inicializa o tema ao carregar a página
  initializeTheme();
});