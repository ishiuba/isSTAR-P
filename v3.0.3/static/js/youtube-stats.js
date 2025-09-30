/**
 * Carrega estatísticas do YouTube para o canal iamshiuba
 */
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Buscar estatísticas do YouTube
    const response = await fetch('/api/stats/youtube');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Função para formatar números grandes
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    };
    
    // Atualizar contador de visualizações totais
    const viewsCounter = document.querySelector('.counter[data-translate-key="totalViews"]');
    if (viewsCounter && data.view_count) {
      const formattedViews = formatNumber(data.view_count);
      viewsCounter.setAttribute('data-target', data.view_count);
      viewsCounter.setAttribute('data-formatted-target', formattedViews);
    }
    
    // Atualizar contador de inscritos (se não estiver oculto)
    const subscribersCounter = document.querySelector('.counter[data-translate-key="subscribers"]');
    if (subscribersCounter && data.subscriber_count && !data.subscriber_count_hidden) {
      const formattedSubs = formatNumber(data.subscriber_count);
      subscribersCounter.setAttribute('data-target', data.subscriber_count);
      subscribersCounter.setAttribute('data-formatted-target', formattedSubs);
    }
    
    // Atualizar contador de vídeos
    const videosCounter = document.querySelector('.counter[data-translate-key="totalVideos"]');
    if (videosCounter && data.video_count) {
      videosCounter.setAttribute('data-target', data.video_count);
    }
    
    // Reiniciar animação dos contadores
    if (window.counterAnimation) {
      // Se counterAnimation já foi inicializado, criar nova instância
      new CounterAnimation().init();
    } else {
      // Caso ainda não tenha sido inicializado, criar nova instância
      window.counterAnimation = new CounterAnimation();
    }
    
    console.log('Estatísticas do YouTube carregadas:', {
      views: data.view_count,
      subscribers: data.subscriber_count,
      videos: data.video_count
    });
    
  } catch (error) {
    console.error('Erro ao carregar estatísticas do YouTube:', error);
    // Manter os valores padrão em caso de erro
  }
});
