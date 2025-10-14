document.addEventListener("DOMContentLoaded", () => {
  // Lista de temas disponíveis
  const availableThemes = ["light", "dark", "black", "red"];

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
  function setTheme(theme, animate = true) {
    // Verifica se o tema está na lista de temas disponíveis
    if (!availableThemes.includes(theme)) {
      theme = defaultSystemTheme;
    }

    // Get current theme for transition
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || defaultSystemTheme;

    // Only animate if it's a different theme and animation is requested
    if (currentTheme !== theme && animate) {
      animateThemeTransition(currentTheme, theme);
    } else {
      // Apply theme immediately without animation
      document.documentElement.setAttribute("data-theme", theme);
    }

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
        ["fa-sun", "fa-moon", "fa-lightbulb", "fa-fire"].forEach((cls) => {
          switcher.classList.remove(cls);
        });

        // Adiciona o ícone apropriado baseado no tema atual
        switch (currentTheme) {
          case "dark":
            switcher.classList.add("fa-moon");
            break;
          case "black":
            switcher.classList.add("fa-lightbulb");
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
        black: "fa-lightbulb",
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

  /**
   * Animate theme transition with a smooth fade effect
   * @param {string} fromTheme - Current theme
   * @param {string} toTheme - Target theme
   */
  function animateThemeTransition(fromTheme, toTheme) {
    // Create a transition overlay
    const overlay = document.createElement("div");
    overlay.className = "theme-transition-overlay";
    document.body.appendChild(overlay);

    // Add transition styles if not already present
    if (!document.getElementById("theme-transition-styles")) {
      const style = document.createElement("style");
      style.id = "theme-transition-styles";
      style.textContent = `
        .theme-transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0);
          z-index: 9999;
          pointer-events: none;
          transition: background-color 0.5s ease;
        }

        .theme-transition-overlay.fade-in {
          background-color: rgba(0, 0, 0, 0.2);
        }

        .theme-transition-overlay.fade-out {
          background-color: rgba(0, 0, 0, 0);
        }

        .theme-icon {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          font-size: 4rem;
          color: white;
          z-index: 10000;
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .theme-icon.show {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }

    // Create theme icon
    const icon = document.createElement("div");
    icon.className = "theme-icon";

    // Set icon based on target theme
    if (toTheme === "dark") {
      icon.innerHTML = '<i class="fas fa-moon"></i>';
    } else if (toTheme === "black") {
      icon.innerHTML = '<i class="fas fa-lightbulb"></i>';
    } else if (toTheme === "light") {
      icon.innerHTML = '<i class="fas fa-sun"></i>';
    } else if (toTheme === "red") {
      icon.innerHTML = '<i class="fas fa-fire"></i>';
    }

    document.body.appendChild(icon);

    // Animate transition
    setTimeout(() => {
      overlay.classList.add("fade-in");
      icon.classList.add("show");
    }, 50);

    // Change theme after fade in
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", toTheme);
    }, 300);

    // Fade out
    setTimeout(() => {
      overlay.classList.remove("fade-in");
      overlay.classList.add("fade-out");
      icon.classList.remove("show");
    }, 800);

    // Remove elements after animation
    setTimeout(() => {
      overlay.remove();
      icon.remove();
    }, 1300);
  }

  // Inicializa o tema ao carregar a página
  initializeTheme();

  // Exporta funções úteis para uso global
  window.themeManager = {
    setTheme,
    getCurrentTheme: () => document.documentElement.getAttribute("data-theme"),
    getAvailableThemes: () => [...availableThemes],
    animateThemeTransition,
  };
});
