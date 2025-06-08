class UpdateManager {
  constructor() {
    this.updates = [];
    this.init();
  }

  async init() {
    await this.loadUpdates();
    this.renderUpdates();
  }

  async loadUpdates() {
    try {
      const response = await fetch('/static/data/updates.json');
      const data = await response.json();
      this.updates = data.updates;
      return this.updates;
    } catch (error) {
      console.error('Erro ao carregar atualizações:', error);
      return [];
    }
  }

  renderUpdates() {
    const container = document.querySelector('.updates-grid');
    if (!container) return;

    if (this.updates.length === 0) {
      container.innerHTML = `
        <div class="update-card">
          <div class="card-header">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Sem Atualizações</h2>
          </div>
          <div class="update-content">
            <p>Não há atualizações disponíveis no momento.</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.updates.map(update => `
      <div class="update-card">
        <div class="card-header">
          <i class="fas fa-newspaper"></i>
          <h2>${update.title}</h2>
        </div>
        <div class="version-badge">${update.version}</div>
        <div class="update-content">${update.content}</div>
        ${update.preview_link ? `
          <a href="${update.preview_link}" target="_blank" class="update-preview">
            Ver Preview
          </a>
        ` : ''}
      </div>
    `).join('');
  }
}

window.updateManager = new UpdateManager();