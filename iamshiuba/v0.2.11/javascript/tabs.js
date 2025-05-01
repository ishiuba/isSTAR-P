// Este arquivo gerencia a funcionalidade dos tabs e o carregamento de templates

/**
 * Gerenciador de Tabs e Templates
 * - Gerencia a navegação entre abas
 * - Carrega templates HTML dinamicamente
 * - Implementa roteamento baseado em hash
 */
class TabsManager {
  constructor() {
    this.contentContainer = document.getElementById('content-container');
    this.tabLinks = [];
    this.templateCache = {}; // Cache para templates carregados
    this.currentTemplate = null;
    this.isLoading = false;
  }

  /**
   * Inicializa o gerenciador de tabs
   */
  init() {
    // Verificar se o nav já foi carregado
    if (!document.querySelector('[data-tabs-target]')) {
      // Se não foi carregado, tentar novamente em 100ms
      setTimeout(() => this.init(), 100);
      return;
    }

    // Selecionar todos os tabs
    this.tabLinks = document.querySelectorAll('[data-tabs-target]');

    // Adicionar evento de clique a cada tab
    this.tabLinks.forEach(tabLink => {
      tabLink.addEventListener('click', (e) => this.handleTabClick(e, tabLink));
    });

    // Configurar o listener para mudanças no hash da URL
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Carregar o template inicial baseado no hash ou selecionar o primeiro tab
    this.handleHashChange();
  }

  /**
   * Manipula o clique em um tab
   * @param {Event} e - Evento de clique
   * @param {Element} tabLink - Elemento do tab clicado
   */
  handleTabClick(e, tabLink) {
    e.preventDefault();

    // Obter o ID do conteúdo alvo
    const targetId = tabLink.getAttribute('data-tabs-target');
    const templateName = targetId.replace('#', '').replace('-content', '');

    // Atualizar o hash da URL (isso vai acionar o evento hashchange)
    window.location.hash = templateName;
  }

  /**
   * Manipula mudanças no hash da URL
   */
  handleHashChange() {
    // Obter o hash atual (sem o #)
    let hash = window.location.hash.substring(1);

    // Se não houver hash, usar 'home' como padrão
    if (!hash) {
      hash = 'home';
      window.location.hash = hash;
      return; // O evento hashchange será acionado novamente
    }

    // Encontrar o tab correspondente
    const targetTab = Array.from(this.tabLinks).find(tab => {
      const targetId = tab.getAttribute('data-tabs-target');
      return targetId === `#${hash}-content`;
    });

    if (targetTab) {
      // Carregar o template correspondente
      this.loadTemplate(hash);

      // Atualizar a seleção visual dos tabs
      this.updateTabSelection(targetTab);
    }
  }

  /**
   * Carrega um template HTML
   * @param {string} templateName - Nome do template a ser carregado
   */
  async loadTemplate(templateName) {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      // Mostrar indicador de carregamento
      this.showLoading();

      // Verificar se o template já está em cache
      if (!this.templateCache[templateName]) {
        // Carregar o template via fetch
        const response = await fetch(`./templates/${templateName}.html`);

        if (!response.ok) {
          throw new Error(`Erro ao carregar template: ${response.status}`);
        }

        const html = await response.text();

        // Armazenar no cache
        this.templateCache[templateName] = html;
      }

      // Obter o HTML do cache
      const templateHtml = this.templateCache[templateName];

      // Aplicar o template ao container
      this.applyTemplate(templateHtml);

      // Atualizar o template atual
      this.currentTemplate = templateName;

      // Disparar evento de template carregado
      this.dispatchTemplateLoadedEvent(templateName);
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      this.contentContainer.innerHTML = `
        <div class="p-4 text-center">
          <h2 class="text-xl text-red-500">Erro ao carregar conteúdo</h2>
          <p>Não foi possível carregar o template "${templateName}".</p>
        </div>
      `;
    } finally {
      // Esconder indicador de carregamento
      this.hideLoading();
      this.isLoading = false;
    }
  }

  /**
   * Aplica o HTML do template ao container
   * @param {string} html - HTML do template
   */
  applyTemplate(html) {
    console.log("Aplicando template ao container");

    // Aplicar fade-out
    this.contentContainer.style.opacity = '0';

    // Aguardar a transição de fade-out
    setTimeout(() => {
      // Inserir o HTML do template
      this.contentContainer.innerHTML = html;

      // Aplicar fade-in
      this.contentContainer.style.opacity = '1';

      // Garantir que o conteúdo seja visível
      const panels = this.contentContainer.querySelectorAll('[role="tabpanel"]');
      panels.forEach(panel => {
        panel.classList.remove('hidden');
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
      });

      // Garantir que containers específicos sejam visíveis
      const streamingContainers = this.contentContainer.querySelectorAll('.streaming-container');
      streamingContainers.forEach(container => {
        container.style.display = 'grid';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      });

      // Traduzir o conteúdo, se o gerenciador de traduções estiver disponível
      if (typeof translationManager !== 'undefined') {
        translationManager.translatePage();
      }

      console.log("Template aplicado e elementos configurados para visibilidade");
    }, 200);
  }

  /**
   * Atualiza a seleção visual dos tabs
   * @param {Element} selectedTab - Tab selecionado
   */
  updateTabSelection(selectedTab) {
    // Atualizar o estado de seleção dos tabs
    this.tabLinks.forEach(link => {
      link.setAttribute('aria-selected', 'false');
    });

    // Marcar o tab selecionado
    selectedTab.setAttribute('aria-selected', 'true');
  }

  /**
   * Mostra o indicador de carregamento
   */
  showLoading() {
    // Criar ou obter o indicador de carregamento
    let loader = document.getElementById('template-loader');

    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'template-loader';
      loader.className = 'fixed top-0 left-0 w-full h-1 bg-red-600 animate-pulse';
      document.body.appendChild(loader);
    }

    loader.style.display = 'block';
  }

  /**
   * Esconde o indicador de carregamento
   */
  hideLoading() {
    const loader = document.getElementById('template-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  /**
   * Dispara um evento customizado quando um template é carregado
   * @param {string} templateName - Nome do template carregado
   */
  dispatchTemplateLoadedEvent(templateName) {
    console.log(`Disparando evento templateLoaded para: ${templateName}`);

    // Pequeno atraso para garantir que o DOM esteja completamente atualizado
    setTimeout(() => {
      const event = new CustomEvent('templateLoaded', {
        detail: {
          templateName: templateName
        }
      });

      document.dispatchEvent(event);

      // Disparar um evento específico para cada tipo de template
      const specificEvent = new CustomEvent(`${templateName}TemplateLoaded`);
      document.dispatchEvent(specificEvent);

      console.log(`Eventos disparados para o template: ${templateName}`);
    }, 100);
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Criar e inicializar o gerenciador de tabs
  window.tabsManager = new TabsManager();
  window.tabsManager.init();
});
