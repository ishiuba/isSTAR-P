/**
 * Streaming.js
 * Versão aprimorada do gerenciador de streaming com recursos avançados
 */

class Streaming {
  constructor() {
    // Estado
    this.youtubeData = [];
    this.originalData = []; // Armazenar dados originais para restauração
    this.favorites = this.loadFavorites();
    this.currentView = "grid"; // 'grid' ou 'list'
    this.itemsPerPage = 6;
    this.currentPage = 1;
    this.initialized = false;
    this.elements = {};

    console.log("Construtor do Streaming executado");

    // Inicializar elementos e iniciar o streaming
    this.initializeElements();

    // Se os elementos necessários foram encontrados, inicializar
    if (this.elements.youtubeContainer) {
      this.init();
      this.initialized = true;
    } else {
      console.log("Elementos necessários não encontrados, aguardando eventos");
    }
  }

  /**
   * Inicializar elementos DOM
   */
  initializeElements() {
    console.log("Inicializando elementos DOM...");

    // Elementos DOM - Garantir que encontramos os elementos mesmo após navegação
    this.elements = {
      youtubeContainer: document.getElementById("playlistContainer"),
      youtubeSearch: document.getElementById("youtubeSearch"),
      loadingAnimation: document.getElementById("loadingAnimation"),
      viewToggle: document.getElementById("viewToggle"),
      paginationYoutube: document.getElementById("paginationYoutube"),
    };

    // Se não encontramos o container, tentar novamente após um pequeno atraso
    if (!this.elements.youtubeContainer) {
      console.log("Container não encontrado, tentando novamente em 100ms...");
      setTimeout(() => {
        this.elements.youtubeContainer = document.getElementById("playlistContainer");
        if (this.elements.youtubeContainer) {
          console.log("Container encontrado após nova tentativa!");
          this.init();
        }
      }, 100);
    }
  }

  /**
   * Inicializar o gerenciador de streaming
   */
  init() {
    console.log("Inicializando Streaming...");

    // Verificar se os elementos necessários estão disponíveis
    if (!this.elements.youtubeContainer) {
      console.error("Elemento playlistContainer não encontrado!");
      return;
    }

    // Carregar dados
    this.loadYouTubePlaylists();

    // Configurar eventos
    this.setupEventListeners();

    // Configurar visualização inicial
    this.setupInitialView();

    console.log("Streaming inicializado com sucesso!");
  }

  /**
   * Configurar ouvintes de eventos
   */
  setupEventListeners() {
    // Eventos de pesquisa
    if (this.elements.youtubeSearch) {
      this.elements.youtubeSearch.addEventListener("input", (e) => {
        this.filterPlaylists("youtube", e.target.value);
      });

      const youtubeForm = this.elements.youtubeSearch.closest("form");
      if (youtubeForm) {
        youtubeForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.filterPlaylists("youtube", this.elements.youtubeSearch.value);
        });
      }
    }

    // Evento de alternância de visualização
    if (this.elements.viewToggle) {
      this.elements.viewToggle.addEventListener("click", () => {
        this.toggleView();
      });
    }

    // Eventos de paginação
    document.addEventListener("click", (e) => {
      if (e.target.matches(".pagination-button")) {
        const page = parseInt(e.target.dataset.page);
        const type = e.target.dataset.type;
        this.goToPage(type, page);
      }
    });

    // Eventos de favoritos
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(".favorite-button") ||
        e.target.closest(".favorite-button")
      ) {
        const button = e.target.matches(".favorite-button")
          ? e.target
          : e.target.closest(".favorite-button");
        const id = button.dataset.id;
        const type = button.dataset.type;
        this.toggleFavorite(id, type);
      }
    });
  }

  /**
   * Configurar visualização inicial
   */
  setupInitialView() {
    // Verificar se há uma preferência salva
    const savedView = localStorage.getItem("streaming-view");
    if (savedView && (savedView === "grid" || savedView === "list")) {
      this.currentView = savedView;
    }

    // Remover classes existentes e adicionar a classe correta
    document.body.classList.remove("view-grid", "view-list");
    document.body.classList.add(`view-${this.currentView}`);

    // Atualizar botões de visualização
    this.updateViewToggle();

    // Garantir que os containers sejam visíveis
    setTimeout(() => {
      if (this.elements.youtubeContainer) {
        this.elements.youtubeContainer.style.visibility = "visible";
        this.elements.youtubeContainer.style.opacity = "1";
        this.elements.youtubeContainer.style.display = "grid";
      }
    }, 500);
  }

  /**
   * Carregar playlists do YouTube
   */
  async loadYouTubePlaylists() {
    try {
      this.showLoading();

      console.log("Carregando playlists do YouTube...");

      // Usar caminho relativo à raiz do site
      const response = await fetch("./playlists/data.json");

      if (!response.ok) {
        throw new Error(`Erro ao carregar data.json: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.playlists || !Array.isArray(data.playlists)) {
        throw new Error("Formato de dados inválido: playlists não encontradas ou não é um array");
      }

      // Processar e armazenar os dados
      const processedData = data.playlists.map((playlist) => ({
        ...playlist,
        type: "youtube",
        isFavorite: this.isFavorite(playlist.playlistId, "youtube"),
      }));

      // Armazenar tanto nos dados atuais quanto nos originais para restauração
      this.youtubeData = [...processedData];
      this.originalData = [...processedData]; // Cópia para restauração

      this.renderPlaylists("youtube");
      this.hideLoading();
    } catch (error) {
      console.error("Erro ao carregar YouTube playlists:", error);
      this.hideLoading();
      this.showError(
        "youtube",
        `Não foi possível carregar as playlists do YouTube. Erro: ${error.message}`
      );
    }
  }

  /**
   * Renderizar playlists
   * @param {string} type - Tipo de playlist ('youtube')
   */
  renderPlaylists(type) {
    console.log(`Renderizando playlists do tipo: ${type}`);

    const container = this.elements.youtubeContainer;
    const data = this.youtubeData;

    if (!container) {
      console.error("Container não encontrado! Não é possível renderizar playlists.");
      return;
    }

    // Garantir que o container esteja visível
    container.style.visibility = "visible";
    container.style.opacity = "1";
    container.style.display = "grid";

    // Limpar container
    container.innerHTML = "";

    // Verificar se há dados para renderizar
    if (!data || data.length === 0) {
      console.warn("Nenhum dado disponível para renderizar");
      container.innerHTML = `<div class="no-results">Nenhuma playlist encontrada.</div>`;
      return;
    }

    // Ordenar dados para mostrar favoritos primeiro
    const sortedData = [...data].sort((a, b) => {
      // Se ambos são favoritos ou ambos não são, manter a ordem original
      if (a.isFavorite === b.isFavorite) return 0;
      // Se a é favorito e b não é, a vem primeiro
      if (a.isFavorite) return -1;
      // Se b é favorito e a não é, b vem primeiro
      return 1;
    });

    // Calcular paginação
    const totalPages = Math.ceil(sortedData.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Renderizar playlists
    if (paginatedData.length === 0) {
      container.innerHTML = `<div class="no-results">Nenhuma playlist encontrada.</div>`;
      return;
    }

    // Criar HTML para todos os itens
    let html = "";

    paginatedData.forEach((playlist) => {
      html += `
          <div class="playlist-item ${
            playlist.isFavorite ? "is-favorite" : ""
          }" data-id="${playlist.playlistId}">
            ${this.getYouTubeHTML(playlist)}
          </div>
        `;
    });

    // Adicionar HTML ao container
    container.innerHTML = html;

    console.log("HTML renderizado no container");

    // Configurar lazy loading para todos os itens
    const items = container.querySelectorAll(".playlist-item");
    console.log(`Configurando lazy loading para ${items.length} itens`);

    items.forEach((item) => {
      this.setupLazyLoading(item);
    });

    // Garantir novamente que o container esteja visível após a renderização
    setTimeout(() => {
      container.style.visibility = "visible";
      container.style.opacity = "1";
      container.style.display = "grid";

      // Verificar se os itens estão visíveis
      const checkItems = container.querySelectorAll(".playlist-item");
      console.log(`Verificação final: ${checkItems.length} itens no container`);
    }, 100);
  }

  /**
   * Gerar HTML para playlist do YouTube
   * @param {Object} playlist - Dados da playlist
   * @returns {string} - HTML do item
   */
  getYouTubeHTML(playlist) {
    return `
        <div class="video-container" data-id="${playlist.playlistId}">
          <div class="placeholder" data-src="https://www.youtube.com/embed/videoseries?list=${
            playlist.playlistId
          }">
            <div class="placeholder-content">
              <div class="placeholder-icon">
                <i class="fab fa-youtube"></i>
              </div>
              <p>${playlist.title}</p>
              <button class="load-video-btn">
                <i class="fas fa-play"></i> <span data-translate="loadVideo">Carregar vídeo</span>
              </button>
            </div>
          </div>
        </div>
        <div class="playlist-info">
          <div class="playlist-header">
            <h3>${playlist.title}</h3>
            <button class="favorite-button ${
              playlist.isFavorite ? "active" : ""
            }" data-id="${
      playlist.playlistId
    }" data-type="youtube" aria-label="${
      playlist.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
    }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="playlist-actions">
            <a class="action-button youtube" href="${
              playlist.url
            }" target="_blank" aria-label="Abrir ${playlist.title} no YouTube">
              <i class="fab fa-youtube"></i> <span data-translate="OpenYoutube">Abrir no YouTube</span>
            </a>
          </div>
        </div>
      `;
  }

  /**
   * Configurar lazy loading para iframes
   * @param {HTMLElement} item - Elemento da playlist
   */
  setupLazyLoading(item) {
    const placeholder = item.querySelector(".placeholder");
    if (!placeholder) return;

    const loadButton = placeholder.querySelector(".load-video-btn");
    if (loadButton) {
      loadButton.addEventListener("click", () => {
        const src = placeholder.dataset.src;
        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.allowFullscreen = true;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        placeholder.parentNode.replaceChild(iframe, placeholder);
      });
    }
  }

  /**
   * Filtrar playlists
   * @param {string} type - Tipo de playlist ('youtube')
   * @param {string} searchTerm - Termo de pesquisa
   */
  filterPlaylists(type, searchTerm) {
    // Usar os dados originais para filtrar
    const searchValue = searchTerm.toLowerCase().trim();

    // Resetar para a primeira página
    this.currentPage = 1;

    // Se a pesquisa estiver vazia, restaurar dados originais e renderizar
    if (searchValue === "") {
      // Restaurar dados originais
      this.youtubeData = [...this.originalData];
      this.renderPlaylists(type);
      return;
    }

    // Filtrar dados a partir dos dados originais
    const filteredData = this.originalData.filter((playlist) => {
      return playlist.title.toLowerCase().includes(searchValue);
    });

    // Atualizar dados temporariamente
    this.youtubeData = filteredData;

    // Renderizar playlists filtradas
    this.renderPlaylists(type);
  }

  /**
   * Alternar entre abas
   * Método mantido para compatibilidade, mas simplificado
   * já que agora só temos a aba do YouTube
   */
  switchTab() {
    // Exibir apenas a aba do YouTube
    if (this.elements.youtubeContainer) {
      this.elements.youtubeContainer.style.display = "grid";
    }

    if (this.elements.youtubeSearch) {
      this.elements.youtubeSearch.closest(".search-section").style.display = "block";
    }

    if (this.elements.paginationYoutube) {
      this.elements.paginationYoutube.style.display = "flex";
    }
  }

  /**
   * Alternar entre visualizações (grade/lista)
   */
  toggleView() {
    this.currentView = this.currentView === "grid" ? "list" : "grid";

    // Atualizar classes do corpo
    document.body.classList.remove("view-grid", "view-list");
    document.body.classList.add(`view-${this.currentView}`);

    // Atualizar botão de alternância
    this.updateViewToggle();

    // Salvar preferência
    localStorage.setItem("streaming-view", this.currentView);

    // Renderizar novamente as playlists para aplicar a nova visualização
    this.renderPlaylists("youtube");
  }

  /**
   * Atualizar botão de alternância de visualização
   */
  updateViewToggle() {
    if (!this.elements.viewToggle) return;

    if (this.currentView === "grid") {
      this.elements.viewToggle.innerHTML = '<i class="fas fa-list"></i>';
      this.elements.viewToggle.setAttribute(
        "aria-label",
        "Mudar para visualização em lista"
      );
      this.elements.viewToggle.setAttribute(
        "title",
        "Mudar para visualização em lista"
      );
    } else {
      this.elements.viewToggle.innerHTML = '<i class="fas fa-th-large"></i>';
      this.elements.viewToggle.setAttribute(
        "aria-label",
        "Mudar para visualização em grade"
      );
      this.elements.viewToggle.setAttribute(
        "title",
        "Mudar para visualização em grade"
      );
    }
  }

  /**
   * Alternar favorito
   * @param {string} id - ID da playlist
   * @param {string} type - Tipo de playlist ('youtube')
   */
  toggleFavorite(id, type) {
    const key = `${type}-${id}`;
    const isFavorite = this.favorites.includes(key);

    if (isFavorite) {
      // Remover dos favoritos
      this.favorites = this.favorites.filter((item) => item !== key);
    } else {
      // Adicionar aos favoritos
      this.favorites.push(key);
    }

    // Salvar favoritos
    this.saveFavorites();

    // Atualizar dados
    this.youtubeData = this.youtubeData.map((playlist) => {
      if (playlist.playlistId === id) {
        return { ...playlist, isFavorite: !isFavorite };
      }
      return playlist;
    });

    // Atualizar UI
    const button = document.querySelector(
      `.favorite-button[data-id="${id}"][data-type="${type}"]`
    );
    if (button) {
      button.classList.toggle("active", !isFavorite);
      button.setAttribute(
        "aria-label",
        !isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
      );
    }

    const item = document.querySelector(`.playlist-item[data-id="${id}"]`);
    if (item) {
      item.classList.toggle("is-favorite", !isFavorite);
    }
  }

  /**
   * Verificar se uma playlist é favorita
   * @param {string} id - ID da playlist
   * @param {string} type - Tipo de playlist ('youtube')
   * @returns {boolean} - Se a playlist é favorita
   */
  isFavorite(id, type) {
    return this.favorites.includes(`${type}-${id}`);
  }

  /**
   * Carregar favoritos do localStorage
   * @returns {Array} - Lista de favoritos
   */
  loadFavorites() {
    const favorites = localStorage.getItem("streaming-favorites");
    return favorites ? JSON.parse(favorites) : [];
  }

  /**
   * Salvar favoritos no localStorage
   */
  saveFavorites() {
    localStorage.setItem("streaming-favorites", JSON.stringify(this.favorites));
  }

  /**
   * Mostrar animação de carregamento
   */
  showLoading() {
    if (this.elements.loadingAnimation) {
      this.elements.loadingAnimation.style.display = "block";
    }
  }

  /**
   * Ocultar animação de carregamento
   */
  hideLoading() {
    if (this.elements.loadingAnimation) {
      this.elements.loadingAnimation.style.display = "none";
    }
  }

  /**
   * Mostrar mensagem de erro
   * @param {string} type - Tipo de playlist ('youtube')
   * @param {string} message - Mensagem de erro
   */
  showError(type, message) {
    const container = this.elements.youtubeContainer;
    if (!container) return;

    // Adicionar HTML de erro diretamente
    container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>${message}</p>
          <button class="retry-button" data-type="${type}">
            <i class="fas fa-sync-alt"></i> Tentar novamente
          </button>
        </div>
      `;

    // Adicionar evento ao botão de retry
    const retryButton = container.querySelector(".retry-button");
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        this.loadYouTubePlaylists();
      });
    }
  }
}

// Variável global para o gerenciador de streaming
let streamingManager = null;

/**
 * Inicializa o gerenciador de streaming se ainda não estiver inicializado
 */
function initializeStreamingManager() {
  if (!streamingManager) {
    console.log("Criando nova instância do gerenciador de streaming");
    streamingManager = new Streaming();
  } else if (streamingManager && !streamingManager.initialized) {
    console.log("Reinicializando gerenciador de streaming existente");
    streamingManager.initializeElements();
    streamingManager.init();
    streamingManager.initialized = true;
  } else {
    console.log("Gerenciador de streaming já inicializado, recarregando playlists");

    // Reinicializar elementos para garantir que temos referências atualizadas
    streamingManager.initializeElements();

    // Restaurar dados originais se existirem
    if (streamingManager.originalData && streamingManager.originalData.length > 0) {
      streamingManager.youtubeData = [...streamingManager.originalData];
      streamingManager.renderPlaylists("youtube");
    } else {
      // Se não tiver dados originais, recarregar do servidor
      streamingManager.loadYouTubePlaylists();
    }
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, configurando listeners para o gerenciador de streaming...");

  // Listener específico para o template de vídeos
  document.addEventListener("videosTemplateLoaded", () => {
    console.log("Evento videosTemplateLoaded detectado - inicializando streaming");
    // Pequeno atraso para garantir que o DOM esteja completamente atualizado
    setTimeout(() => {
      initializeStreamingManager();
    }, 300);
  });

  // Listener genérico para qualquer template carregado
  document.addEventListener("templateLoaded", (event) => {
    console.log("Template carregado:", event.detail.templateName);
    if (event.detail.templateName === "videos") {
      console.log("Template de vídeos carregado via evento genérico");
      // Pequeno atraso para garantir que o DOM esteja completamente atualizado
      setTimeout(() => {
        initializeStreamingManager();
      }, 300);
    }
  });

  // Listener para mudanças de hash na URL
  window.addEventListener("hashchange", () => {
    console.log("Hash mudou para:", window.location.hash);
    if (window.location.hash === "#videos") {
      console.log("Navegação para a aba de vídeos detectada");
      // Pequeno atraso para garantir que o template seja carregado
      setTimeout(() => {
        initializeStreamingManager();
      }, 500);
    }
  });

  // Verificar se já estamos na página de vídeos (hash = videos)
  if (window.location.hash === "#videos") {
    console.log("Página inicial é vídeos, inicializando após um atraso");
    // Aguardar um momento para garantir que o DOM esteja pronto
    setTimeout(() => {
      initializeStreamingManager();
    }, 800);
  }
});
