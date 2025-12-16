/**
 * CarregadorIframeLazy.js
 * Gerencia carregamento lazy de conteúdo iframe com funcionalidade click-to-load
 */

class CarregadorIframeLazy {
  constructor(opcoes = {}) {
    this.padroes = {
      seletorPlaceholder: '.placeholder[data-src-embed]',
      seletorBotaoCarregar: '.botao-carregar-video',
      seletorContainer: '.container-video',
      classeCarregando: 'carregando',
      classeCarregado: 'carregado'
    };

    this.opcoes = { ...this.padroes, ...opcoes };
    this.inicializar();
  }

  /**
   * Inicializa o carregador lazy de iframe
   */
  inicializar() {
    this.configurarEventListeners();
  }

  /**
   * Configura event listeners para botões de carregar
   */
  configurarEventListeners() {
    document.addEventListener('click', (evento) => {
      const botaoCarregar = evento.target.closest(this.opcoes.seletorBotaoCarregar);
      if (!botaoCarregar) return;

      evento.preventDefault();
      
      const placeholder = botaoCarregar.closest(this.opcoes.seletorPlaceholder);
      if (!placeholder) return;

      this.carregarIframe(placeholder);
    });
  }

  /**
   * Carrega conteúdo do iframe
   * @param {HTMLElement} placeholder - Elemento placeholder
   */
  carregarIframe(placeholder) {
    const srcEmbed = placeholder.dataset.srcEmbed;
    const titulo = placeholder.dataset.titulo || 'Conteúdo incorporado';
    const container = placeholder.closest(this.opcoes.seletorContainer);
    
    if (!srcEmbed || !container) return;

    // Adiciona estado de carregamento
    placeholder.classList.add(this.opcoes.classeCarregando);
    
    // Cria elemento iframe
    const iframe = document.createElement('iframe');
    iframe.src = srcEmbed;
    iframe.width = '100%';
    iframe.height = '352';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.title = titulo;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.loading = 'lazy';

    // Manipula carregamento do iframe
    iframe.onload = () => {
      placeholder.style.display = 'none';
      container.classList.add(this.opcoes.classeCarregado);
      
      // Dispara evento customizado
      container.dispatchEvent(new CustomEvent('iframeCarregado', {
        detail: { src: srcEmbed, iframe }
      }));
    };

    // Manipula erro do iframe
    iframe.onerror = () => {
      placeholder.classList.remove(this.opcoes.classeCarregando);
      placeholder.classList.add('erro');
      
      const mensagemErro = placeholder.querySelector('p');
      if (mensagemErro) {
        mensagemErro.textContent = 'Erro ao carregar conteúdo';
      }
    };

    // Insere iframe
    container.appendChild(iframe);
  }

  /**
   * Atualiza carregador para conteúdo adicionado dinamicamente
   */
  atualizar() {
    // Event listeners já estão configurados globalmente, não precisa atualizar
    console.log('[CarregadorIframeLazy] Pronto para novo conteúdo');
  }
}

// Inicializa quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  window.carregadorIframeLazy = new CarregadorIframeLazy();
});
