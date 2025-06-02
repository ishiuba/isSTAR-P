document.addEventListener("DOMContentLoaded", () => {
  // Lista de temas disponíveis
  const availableThemes = ["light", "dark", "red"];

  // Tema padrão do sistema
  const defaultSystemTheme = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "dark"
    : "light";

  // Função para inicializar o tema com base na preferência do usuário ou do sistema
  function initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || defaultSystemTheme;
    setTheme(savedTheme);
  }

  // Função para definir o tema e atualizar os botões de tema
  function setTheme(theme) {
    // Verifica se o tema está na lista de temas disponíveis
    if (!availableThemes.includes(theme)) {
      theme = defaultSystemTheme;
    }

    document.documentElement.setAttribute("data-theme", theme);
    updateThemeButtons(theme);
    localStorage.setItem("theme", theme);
  }

  // Função para atualizar todos os botões de tema
  function updateThemeButtons(currentTheme) {
    // Seleciona todos os elementos com atributo data-theme-switch
    const themeSwitchers = document.querySelectorAll("[data-theme-switch]");

    themeSwitchers.forEach((switcher) => {
      // Atualiza o atributo data-current-theme para todos os elementos
      switcher.setAttribute("data-current-theme", currentTheme);

      // Verifica se o elemento usa classes para ícones (para compatibilidade com o código antigo)
      if (
        switcher.classList.contains("fa-sun") ||
        switcher.classList.contains("fa-moon")
      ) {
        // Remove todas as classes de ícones possíveis
        ["fa-sun", "fa-moon", "fa-fire"].forEach((cls) => {
          switcher.classList.remove(cls);
        });

        // Adiciona o ícone apropriado baseado no tema atual
        switch (currentTheme) {
          case "dark":
            switcher.classList.add("fa-moon");
            break;
          case "red":
            switcher.classList.add("fa-fire");
            break;
          default: // light ou outros
            switcher.classList.add("fa-sun");
            break;
        }
      }

      // Se o botão tem um tema específico, marca como ativo se for o tema atual
      if (switcher.hasAttribute("data-theme-value")) {
        const themeValue = switcher.getAttribute("data-theme-value");
        if (themeValue === currentTheme) {
          switcher.classList.add("active");
        } else {
          switcher.classList.remove("active");
        }
      }
    });
  }

  // Event listener para todos os elementos com data-theme-switch
  document.addEventListener("click", (event) => {
    let target = event.target;

    // Navega para cima na árvore DOM para encontrar o elemento com o atributo
    while (target && target !== document) {
      if (target.hasAttribute("data-theme-switch")) {
        // Se o elemento especifica um valor de tema específico
        if (target.hasAttribute("data-theme-value")) {
          const newTheme = target.getAttribute("data-theme-value");
          setTheme(newTheme);
        }
        // Comportamento antigo: alternar entre dark/light
        else {
          const currentTheme =
            document.documentElement.getAttribute("data-theme");
          setTheme(currentTheme === "dark" ? "light" : "dark");
        }
        break;
      }
      target = target.parentElement;
    }
  });

  // Função para adicionar seletores de tema ao DOM
  function createThemeSelector(container) {
    if (!container) return;

    // Limpa o container
    container.innerHTML = "";

    // Cria um botão para cada tema
    availableThemes.forEach((theme) => {
      const button = document.createElement("button");
      button.setAttribute("data-theme-switch", "");
      button.setAttribute("data-theme-value", theme);
      button.classList.add("theme-button");
      button.title = `Tema ${theme}`;

      // Ícone ou texto do botão
      const themeIcons = {
        light: "fa-sun",
        dark: "fa-moon",
        red: "fa-fire",
      };

      if (themeIcons[theme]) {
        button.innerHTML = `<i class="fas ${themeIcons[theme]}"></i>`;
      } else {
        button.textContent = theme;
      }

      container.appendChild(button);
    });
  }

  // Cria seletores de tema em containers designados
  document.querySelectorAll("[data-theme-selector]").forEach((container) => {
    createThemeSelector(container);
  });

  // Inicializa o tema ao carregar a página
  initializeTheme();

  // Exporta funções úteis para uso global
  window.themeManager = {
    setTheme,
    getCurrentTheme: () => document.documentElement.getAttribute("data-theme"),
    getAvailableThemes: () => [...availableThemes],
  };
});
