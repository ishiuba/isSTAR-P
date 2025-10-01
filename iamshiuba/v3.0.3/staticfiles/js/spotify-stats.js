/**
 * Carrega estatísticas do Spotify para o artista iamshiuba
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Buscar estatísticas do Spotify
    const response = await fetch('/api/stats/spotify');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Atualizar contador de faixas com dados reais
    const tracksCounter = document.querySelector('.counter[data-translate-key="tracksCreated"]');
    if (tracksCounter && data.total_tracks) {
      tracksCounter.setAttribute('data-target', data.total_tracks);
      
      // Reiniciar animação do contador
      if (window.counterAnimation) {
        // Se counterAnimation já foi inicializado como uma instância
        new CounterAnimation().init();
      } else {
        // Caso ainda não tenha sido inicializado, criar nova instância
        window.counterAnimation = new CounterAnimation();
      }
    }
    
    console.log('Estatísticas do Spotify carregadas');
  } catch (error) {
    console.error('Erro ao carregar estatísticas do Spotify:', error);
    // Manter os valores padrão em caso de erro
  }
});
