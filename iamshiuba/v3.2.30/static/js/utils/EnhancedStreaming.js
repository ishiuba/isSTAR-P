/**
 * EnhancedStreaming.js
 * Versão aprimorada do gerenciador de streaming com recursos avançados
 */

class EnhancedStreaming {
  constructor() {
    // Estado
    this.youtubeData = [];
    this.spotifyData = [];
    this.favorites = this.loadFavorites();
    this.currentView = "grid"; // 'grid' ou 'list'
    this.currentTab = this.getInitialTab(); // 'youtube' ou 'spotify'
    this.itemsPerPage = 6;
    this.currentPage = {
      youtube: 1,
      spotify: 1,
    };

    // Elementos DOM
    this.elements = {
      youtubeContainer: document.getElementById("playlistContainer"),
      spotifyContainer: document.getElementById("spotifyContainer"),
      youtubeSearch: document.getElementById("youtubeSearch"),
      spotifySearch: document.getElementById("spotifySearch"),
      loadingAnimation: document.getElementById("loadingAnimation"),
      tabButtons: document.querySelectorAll(".tab-button"),
      viewToggle: document.getElementById("viewToggle"),
      paginationYoutube: document.getElementById("paginationYoutube"),
      paginationSpotify: document.getElementById("paginationSpotify"),
    };

    // Inicializar
    this.init();
  }

  /**
   * Inicializar o gerenciador de streaming
   */
  init() {
    console.log("Inicializando EnhancedStreaming...");

    // Carregar dados
    this.loadYouTubePlaylists();
    this.loadSpotifyPlaylists();

    // Configurar eventos
    this.setupEventListeners();

    // Configurar navegação por URL
    this.setupURLNavigation();

    // Configurar visualização inicial
    this.setupInitialView();

    console.log("EnhancedStreaming inicializado com sucesso!");
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

    if (this.elements.spotifySearch) {
      this.elements.spotifySearch.addEventListener("input", (e) => {
        this.filterPlaylists("spotify", e.target.value);
      });

      const spotifyForm = this.elements.spotifySearch.closest("form");
      if (spotifyForm) {
        spotifyForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.filterPlaylists("spotify", this.elements.spotifySearch.value);
        });
      }
    }

    // Eventos de abas
    this.elements.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        this.switchTab(tab);
      });
    });

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
   * Obter aba inicial baseada na URL ou variável global
   * @returns {string} - Aba inicial ('youtube' ou 'spotify')
   */
  getInitialTab() {
    // Verificar URL atual
    const path = window.location.pathname;
    if (path.includes("/streaming/spotify")) {
      return "spotify";
    } else if (path.includes("/streaming/youtube")) {
      return "youtube";
    }

    // Verificar variável global do template
    if (window.INITIAL_TAB) {
      return window.INITIAL_TAB;
    }

    // Padrão
    return "youtube";
  }

  /**
   * Configurar navegação por URL
   */
  setupURLNavigation() {
    // Escutar mudanças no histórico do navegador (botões voltar/avançar)
    window.addEventListener("popstate", () => {
      const tab = this.getTabFromURL();
      if (tab !== this.currentTab) {
        this.switchTab(tab, false); // false = não atualizar URL
      }
    });
  }

  /**
   * Obter aba da URL atual
   * @returns {string} - Aba baseada na URL
   */
  getTabFromURL() {
    const path = window.location.pathname;
    if (path.includes("/streaming/spotify")) {
      return "spotify";
    } else if (path.includes("/streaming/youtube")) {
      return "youtube";
    }
    return "youtube"; // padrão
  }

  /**
   * Atualizar URL baseada na aba atual
   * @param {string} tab - Aba ativa
   */
  updateURL(tab) {
    const newPath = `/streaming/${tab}`;
    const currentPath = window.location.pathname;

    if (currentPath !== newPath) {
      // Atualizar URL sem recarregar a página
      window.history.pushState(
        { tab: tab },
        `Streaming - ${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
        newPath
      );

      // Atualizar título da página
      document.title = `Streaming - ${
        tab.charAt(0).toUpperCase() + tab.slice(1)
      } | iamshiuba`;
    }
  }

  /**
   * Configurar visualização inicial
   */
  setupInitialView() {
    console.log("Configurando visualização inicial...");
    console.log("Containers encontrados:", {
      youtube: this.elements.youtubeContainer,
      spotify: this.elements.spotifyContainer,
    });

    // Verificar se há uma preferência salva
    const savedView = localStorage.getItem("streaming-view");
    if (savedView && (savedView === "grid" || savedView === "list")) {
      this.currentView = savedView;
    }

    // Remover classes existentes e adicionar a classe correta
    document.body.classList.remove("view-grid", "view-list");
    document.body.classList.add(`view-${this.currentView}`);

    // Definir aba inicial
    console.log("Aba inicial:", this.currentTab);
    this.switchTab(this.currentTab);

    // Atualizar botões de visualização
    this.updateViewToggle();

    // Garantir que os containers sejam visíveis
    setTimeout(() => {
      if (this.elements.youtubeContainer) {
        this.elements.youtubeContainer.style.visibility = "visible";
        this.elements.youtubeContainer.style.opacity = "1";
        this.elements.youtubeContainer.style.display = "grid";
      }

      if (this.elements.spotifyContainer) {
        this.elements.spotifyContainer.style.visibility = "visible";
        this.elements.spotifyContainer.style.opacity = "1";
        this.elements.spotifyContainer.style.display = "grid";
      }
    }, 500);
  }

  /**
   * Carregar playlists do YouTube
   */
  async loadYouTubePlaylists() {
    try {
      this.showLoading();

      // Usar a nova API em vez do arquivo JSON estático
      const response = await fetch("/api/playlists/youtube");
      const data = await response.json();

      this.youtubeData = data.playlists.map((playlist) => ({
        ...playlist,
        type: "youtube",
        // Usar playlist_id em vez de playlistId para compatibilidade com a API
        playlistId: playlist.playlist_id,
        isFavorite: this.isFavorite(playlist.playlist_id, "youtube"),
      }));

      this.renderPlaylists("youtube");
      this.hideLoading();
    } catch (error) {
      console.error("Erro ao carregar YouTube playlists:", error);
      this.hideLoading();
      this.showError(
        "youtube",
        "Não foi possível carregar as playlists do YouTube."
      );
    }
  }

  /**
   * Carregar álbuns do Spotify (artista iamshiuba)
   */
  async loadSpotifyPlaylists() {
    try {
      this.showLoading();

      // Usar a nova API para carregar álbuns do artista
      const response = await fetch("/api/playlists/spotify");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Dados do Spotify recebidos:", data);

      this.spotifyData = data.playlists.map((album) => ({
        ...album,
        type: "spotify",
        // Usar playlist_id em vez de playlistId para compatibilidade com a API
        playlistId: album.playlist_id,
        isFavorite: this.isFavorite(album.playlist_id, "spotify"),
      }));

      console.log("Dados do Spotify processados:", this.spotifyData);
      this.renderPlaylists("spotify");
      this.hideLoading();
    } catch (error) {
      console.error("Erro ao carregar álbuns do Spotify:", error);
      this.hideLoading();
      this.showError(
        "spotify",
        "Não foi possível carregar os álbuns do Spotify."
      );
    }
  }

  /**
   * Renderizar playlists
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
   */
  renderPlaylists(type) {
    console.log(`Renderizando playlists do tipo: ${type}`);

    const container =
      type === "youtube"
        ? this.elements.youtubeContainer
        : this.elements.spotifyContainer;
    const data = type === "youtube" ? this.youtubeData : this.spotifyData;

    console.log(`Container encontrado para ${type}:`, container);
    console.log(`Dados para renderizar (${type}):`, data);

    if (!container) {
      console.error(`Container não encontrado para ${type}`);
      return;
    }

    // Limpar container
    container.innerHTML = "";

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
    const startIndex = (this.currentPage[type] - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Renderizar playlists
    if (paginatedData.length === 0) {
      container.innerHTML = `<div class="no-results">Nenhuma playlist encontrada.</div>`;
      return;
    }

    // Criar HTML para todos os itens
    let html = "";

    // Não precisamos mais adicionar estilos inline, pois estão no SCSS

    paginatedData.forEach((playlist) => {
      // Determinar o template com base no tipo
      let itemHTML;
      if (type === "youtube") {
        itemHTML = this.getYouTubeHTML(playlist);
      } else {
        itemHTML = this.getSpotifyHTML(playlist);
      }

      html += `
        <div class="playlist-item ${
          playlist.isFavorite ? "is-favorite" : ""
        }" data-id="${playlist.playlistId}">
          ${itemHTML}
        </div>
      `;
    });

    // Adicionar HTML ao container
    container.innerHTML = html;

    // Não precisamos mais adicionar estilos inline, pois estão no SCSS

    // Configurar lazy loading para todos os itens
    const items = container.querySelectorAll(".playlist-item");
    items.forEach((item) => {
      this.setupLazyLoading(item);
    });

    // Renderizar paginação
    this.renderPagination(type, totalPages);
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
          }" data-id="${playlist.playlistId}" data-type="youtube" aria-label="${
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
   * Gerar HTML para playlist do Spotify
   * @param {Object} playlist - Dados da playlist
   * @returns {string} - HTML do item
   */
  getSpotifyHTML(playlist) {
    // Usar embed_url se disponível, caso contrário construir URL baseada no tipo
    const embedUrl =
      playlist.embed_url ||
      `https://open.spotify.com/embed/album/${playlist.playlistId}`;

    return `
      <div class="video-container" data-id="${playlist.playlistId}">
        <div class="placeholder" data-src="${embedUrl}">
          <div class="placeholder-content spotify">
            <div class="placeholder-icon">
              <i class="fab fa-spotify"></i>
            </div>
            <p>${playlist.title}</p>
            <button class="load-video-btn">
              <i class="fas fa-play"></i> <span data-translate="loadPlayer">Carregar player</span>
            </button>
          </div>
        </div>
      </div>
      <div class="playlist-info">
        <div class="playlist-header">
          <h3>${playlist.title}</h3>
          <button class="favorite-button ${
            playlist.isFavorite ? "active" : ""
          }" data-id="${playlist.playlistId}" data-type="spotify" aria-label="${
      playlist.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
    }">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="playlist-actions">
          <a class="action-button spotify" href="${
            playlist.url
          }" target="_blank" aria-label="Abrir ${playlist.title} no Spotify">
            <i class="fab fa-spotify"></i> <span data-translate="OpenSpotify">Abrir no Spotify</span>
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
    if (!placeholder) {
      console.log("Placeholder não encontrado para item:", item);
      return;
    }

    const loadButton = placeholder.querySelector(".load-video-btn");
    if (loadButton) {
      console.log("Configurando lazy loading para:", placeholder.dataset.src);
      loadButton.addEventListener("click", () => {
        const src = placeholder.dataset.src;
        console.log("Carregando iframe com src:", src);

        const iframe = document.createElement("iframe");
        iframe.src = src;
        iframe.allowFullscreen = true;
        iframe.width="100%";
        iframe.height="352px";
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        placeholder.parentNode.replaceChild(iframe, placeholder);
        console.log("Iframe criado e substituído");
      });
    } else {
      console.log("Botão de carregamento não encontrado para item:", item);
    }
  }

  /**
   * Renderizar paginação
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
   * @param {number} totalPages - Total de páginas
   */
  renderPagination(type, totalPages) {
    const paginationContainer =
      type === "youtube"
        ? this.elements.paginationYoutube
        : this.elements.paginationSpotify;
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) {
      paginationContainer.style.display = "none";
      return;
    }

    paginationContainer.style.display = "flex";

    // Botão anterior
    const prevButton = document.createElement("button");
    prevButton.className = `pagination-button prev ${
      this.currentPage[type] === 1 ? "disabled" : ""
    }`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = this.currentPage[type] === 1;
    prevButton.dataset.page = this.currentPage[type] - 1;
    prevButton.dataset.type = type;
    paginationContainer.appendChild(prevButton);

    // Botões de página
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage[type] - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Primeira página
    if (startPage > 1) {
      const firstButton = document.createElement("button");
      firstButton.className = "pagination-button";
      firstButton.textContent = "1";
      firstButton.dataset.page = 1;
      firstButton.dataset.type = type;
      paginationContainer.appendChild(firstButton);

      if (startPage > 2) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }
    }

    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.className = `pagination-button ${
        i === this.currentPage[type] ? "active" : ""
      }`;
      pageButton.textContent = i;
      pageButton.dataset.page = i;
      pageButton.dataset.type = type;
      paginationContainer.appendChild(pageButton);
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "pagination-ellipsis";
        ellipsis.textContent = "...";
        paginationContainer.appendChild(ellipsis);
      }

      const lastButton = document.createElement("button");
      lastButton.className = "pagination-button";
      lastButton.textContent = totalPages;
      lastButton.dataset.page = totalPages;
      lastButton.dataset.type = type;
      paginationContainer.appendChild(lastButton);
    }

    // Botão próximo
    const nextButton = document.createElement("button");
    nextButton.className = `pagination-button next ${
      this.currentPage[type] === totalPages ? "disabled" : ""
    }`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = this.currentPage[type] === totalPages;
    nextButton.dataset.page = this.currentPage[type] + 1;
    nextButton.dataset.type = type;
    paginationContainer.appendChild(nextButton);
  }

  /**
   * Ir para uma página específica
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
   * @param {number} page - Número da página
   */
  goToPage(type, page) {
    this.currentPage[type] = page;
    this.renderPlaylists(type);

    // Rolar para o topo da seção
    const container =
      type === "youtube"
        ? this.elements.youtubeContainer
        : this.elements.spotifyContainer;
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Filtrar playlists
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
   * @param {string} searchTerm - Termo de pesquisa
   */
  filterPlaylists(type, searchTerm) {
    const data = type === "youtube" ? this.youtubeData : this.spotifyData;
    const searchValue = searchTerm.toLowerCase().trim();

    // Resetar para a primeira página
    this.currentPage[type] = 1;

    // Se a pesquisa estiver vazia, mostrar todas as playlists
    if (searchValue === "") {
      this.renderPlaylists(type);
      return;
    }

    // Filtrar dados
    const filteredData = data.filter((playlist) => {
      return playlist.title.toLowerCase().includes(searchValue);
    });

    // Atualizar dados temporariamente
    if (type === "youtube") {
      this.youtubeData = filteredData;
    } else {
      this.spotifyData = filteredData;
    }

    // Renderizar playlists filtradas
    this.renderPlaylists(type);

    // Restaurar dados originais
    if (type === "youtube") {
      this.youtubeData = data;
    } else {
      this.spotifyData = data;
    }
  }

  /**
   * Alternar entre abas
   * @param {string} tab - Aba para mostrar ('youtube' ou 'spotify')
   * @param {boolean} updateURL - Se deve atualizar a URL (padrão: true)
   */
  switchTab(tab, updateURL = true) {
    this.currentTab = tab;

    // Atualizar URL se solicitado
    if (updateURL) {
      this.updateURL(tab);
    }

    // Atualizar botões de aba
    this.elements.tabButtons.forEach((button) => {
      if (button.dataset.tab === tab) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    // Mostrar/ocultar containers
    if (this.elements.youtubeContainer) {
      this.elements.youtubeContainer.style.display =
        tab === "youtube" ? "grid" : "none";
    }

    if (this.elements.spotifyContainer) {
      this.elements.spotifyContainer.style.display =
        tab === "spotify" ? "grid" : "none";
    }

    // Mostrar/ocultar campos de pesquisa
    if (this.elements.youtubeSearch) {
      this.elements.youtubeSearch.closest(".search-section").style.display =
        tab === "youtube" ? "block" : "none";
    }

    if (this.elements.spotifySearch) {
      this.elements.spotifySearch.closest(".search-section").style.display =
        tab === "spotify" ? "block" : "none";
    }

    // Mostrar/ocultar paginação
    if (this.elements.paginationYoutube) {
      this.elements.paginationYoutube.style.display =
        tab === "youtube" ? "flex" : "none";
    }

    if (this.elements.paginationSpotify) {
      this.elements.paginationSpotify.style.display =
        tab === "spotify" ? "flex" : "none";
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
    this.renderPlaylists(this.currentTab);
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
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
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
    if (type === "youtube") {
      this.youtubeData = this.youtubeData.map((playlist) => {
        if (playlist.playlistId === id) {
          return { ...playlist, isFavorite: !isFavorite };
        }
        return playlist;
      });
    } else {
      this.spotifyData = this.spotifyData.map((playlist) => {
        if (playlist.playlistId === id) {
          return { ...playlist, isFavorite: !isFavorite };
        }
        return playlist;
      });
    }

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
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
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
   * @param {string} type - Tipo de playlist ('youtube' ou 'spotify')
   * @param {string} message - Mensagem de erro
   */
  showError(type, message) {
    const container =
      type === "youtube"
        ? this.elements.youtubeContainer
        : this.elements.spotifyContainer;
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
        if (type === "youtube") {
          this.loadYouTubePlaylists();
        } else {
          this.loadSpotifyPlaylists();
        }
      });
    }
  }
}

// Variável global para o gerenciador de streaming
let streamingManager;

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  streamingManager = new EnhancedStreaming();
});
