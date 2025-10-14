class UpdateManager {
  constructor() {
    this.updates = [];
  }

  async loadUpdates() {
    try {
      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      const response = await fetch(`/api/updates?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar dados');
      }

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
