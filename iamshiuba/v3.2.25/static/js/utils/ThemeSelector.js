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
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.themes.includes('dark') ? 'dark' : this.defaultTheme;
    }
    
    return this.defaultTheme;
  }
  
  // Aplica o tema ao documento
  applyTheme(theme) {
    if (!this.themes.includes(theme)) {
      theme = this.defaultTheme;
    }
    
    document.documentElement.setAttribute(this.dataAttribute, theme);
    this.currentTheme = theme;
    localStorage.setItem(this.storageKey, theme);
    
    // Dispara evento para possível uso externo
    document.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme } 
    }));
  }
  
  // Configura ouvintes de eventos para botões de tema
  setupEventListeners() {
    document.addEventListener('click', (event) => {
      const themeButton = event.target.closest('[data-theme-toggle]');
      if (!themeButton) return;
      
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
    
    // Adiciona listener para mudança de preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // Interface pública
  getTheme() {
    return this.currentTheme;
  }
  
  setTheme(theme) {
    this.applyTheme(theme);
  }
}

// Inicializa o gerenciador de temas quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Exporta para uso global se necessário
  window.themeManager = new ThemeManager({
    themes: ['light', 'dark', 'black', 'red'],
    defaultTheme: 'light'
  });
  
  // Atualiza os estados dos botões quando o tema muda
  document.addEventListener('themechange', (e) => {
    updateThemeButtons(e.detail.theme);
  });
  
  // Atualiza os botões com o estado atual do tema
  function updateThemeButtons(currentTheme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      // Atualiza atributo de tema atual 
      button.setAttribute('data-current-theme', currentTheme);
      
      // Se tem um tema específico, marca como ativo se corresponder
      if (button.hasAttribute('data-theme-value')) {
        const themeValue = button.getAttribute('data-theme-value');
        button.classList.toggle('active', themeValue === currentTheme);
      }
    });
  }
  
  // Atualiza inicialmente os botões
  updateThemeButtons(window.themeManager.getTheme());
});