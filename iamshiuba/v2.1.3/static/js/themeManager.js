/**
 * Enhanced Theme Manager Module
 * Handles light/dark theme switching with Bootstrap 5 integration
 * Based on modern data-attribute approach for better CSS integration
 */

class ThemeManager {
  constructor(options = {}) {
    // Configurações
    this.themes = options.themes || ['light', 'dark'];
    this.defaultTheme = options.defaultTheme || 'light';
    this.storageKey = options.storageKey || 'theme';
    this.dataAttribute = options.dataAttribute || 'data-theme';

    // Estado
    this.currentTheme = this.loadSavedTheme();

    // Inicialização
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }

  // Carrega o tema salvo ou detecta a preferência do sistema
  loadSavedTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);

    if (savedTheme && this.themes.includes(savedTheme)) {
      return savedTheme;
    }

    // Detecta preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.themes.includes('dark') ? 'dark' : this.defaultTheme;
    }

    return this.defaultTheme;
  }

  // Aplica o tema ao documento
  applyTheme(theme) {
    if (!this.themes.includes(theme)) {
      theme = this.defaultTheme;
    }

    // Remove tema anterior do body (compatibilidade com CSS existente)
    document.body.classList.remove('dark', 'light');

    // Aplica novo tema usando data-attribute (abordagem moderna)
    document.documentElement.setAttribute(this.dataAttribute, theme);

    // Mantém compatibilidade com CSS existente
    if (theme === 'dark') {
      document.body.classList.add('dark');
    }

    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);

    // Atualiza controles de tema
    this.updateThemeControls();

    // Dispara evento para possível uso externo
    document.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, previousTheme: this.currentTheme }
    }));
  }

  // Atualiza os controles de tema (switch e botões)
  updateThemeControls() {
    // Atualiza o switch tradicional (compatibilidade)
    const themeSwitcher = document.getElementById("theme-switcher");
    if (themeSwitcher) {
      themeSwitcher.checked = this.currentTheme === 'dark';
    }

    // Atualiza botões de tema com data-attributes
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('data-current-theme', this.currentTheme);

      if (button.hasAttribute('data-theme-value')) {
        const themeValue = button.getAttribute('data-theme-value');
        button.classList.toggle('active', themeValue === this.currentTheme);

        // Adiciona classes Bootstrap para indicar estado ativo
        if (themeValue === this.currentTheme) {
          button.classList.add('btn-primary');
          button.classList.remove('btn-outline-primary', 'btn-secondary', 'btn-outline-secondary');
        } else {
          button.classList.remove('btn-primary');
          button.classList.add('btn-outline-secondary');
        }
      }
    });
  }

  // Configura ouvintes de eventos para controles de tema
  setupEventListeners() {
    // Event listener para o switch tradicional (compatibilidade)
    const themeSwitcher = document.getElementById("theme-switcher");
    if (themeSwitcher) {
      themeSwitcher.addEventListener("change", (event) => {
        const newTheme = event.target.checked ? 'dark' : 'light';
        this.applyTheme(newTheme);
      });
    }

    // Event listener para botões com data-attributes (nova abordagem)
    document.addEventListener('click', (event) => {
      const themeButton = event.target.closest('[data-theme-toggle]');
      if (!themeButton) return;

      event.preventDefault();

      const targetTheme = themeButton.dataset.themeValue;

      // Se tem um tema específico, usa ele
      if (targetTheme && this.themes.includes(targetTheme)) {
        this.applyTheme(targetTheme);
      }
      // Se não, alterna para o próximo tema na lista
      else {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIndex]);
      }
    });

    // Listener para mudança de preferência do sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Só aplica se não há preferência salva do usuário
        if (!localStorage.getItem(this.storageKey)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // Interface pública - compatibilidade com código existente
  getTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    this.applyTheme(theme);
  }

  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.applyTheme(this.themes[nextIndex]);
  }

  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  // Método para aplicar estilos específicos por tema (melhorado)
  applyThemeStyles(element, themeStyles) {
    if (!element || !themeStyles) return;

    const styles = themeStyles[this.currentTheme] || themeStyles[this.defaultTheme] || {};

    Object.keys(styles).forEach(property => {
      element.style[property] = styles[property];
    });
  }

  // Método para obter classe CSS específica do tema
  getThemeClass(baseClass) {
    return `${baseClass}-${this.currentTheme}`;
  }
}

// Funções de compatibilidade com o código existente
let themeManagerInstance = null;

function getCurrentTheme() {
  return themeManagerInstance ? themeManagerInstance.getTheme() : 'light';
}

function setTheme(theme) {
  if (themeManagerInstance) {
    themeManagerInstance.setTheme(theme);
  }
}

function toggleTheme() {
  if (themeManagerInstance) {
    themeManagerInstance.toggleTheme();
  }
}

function isDarkTheme() {
  return themeManagerInstance ? themeManagerInstance.isDarkTheme() : false;
}

function applyThemeStyles(element, lightStyles, darkStyles) {
  if (themeManagerInstance) {
    const themeStyles = {
      light: lightStyles,
      dark: darkStyles
    };
    themeManagerInstance.applyThemeStyles(element, themeStyles);
  }
}

function getThemeClass(baseClass) {
  return themeManagerInstance ? themeManagerInstance.getThemeClass(baseClass) : `${baseClass}-light`;
}

function setupSystemThemeDetection() {
  // Esta funcionalidade já está integrada no ThemeManager
  console.log('System theme detection is already integrated in the new ThemeManager');
}

function initializeTheme() {
  // Inicializa o novo ThemeManager
  themeManagerInstance = new ThemeManager({
    themes: ['light', 'dark'],
    defaultTheme: 'light'
  });

  // Exporta para uso global
  window.themeManager = themeManagerInstance;

  console.log('Enhanced Theme Manager initialized');
}

// Export functions for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ThemeManager,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    initializeTheme,
    isDarkTheme,
    applyThemeStyles,
    getThemeClass,
    setupSystemThemeDetection
  };
}
