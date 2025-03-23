async function loadHighlight() {
  try {
    // Busca os dados do arquivo JSON que contém as informações do vídeo
    const response = await fetch("/static/playlists/highlights.json");
    // Converte a resposta para formato JSON
    const data = await response.json();
    // Extrai playlistId e title do objeto highlight dentro do JSON
    const { playlistId, title } = data.highlight;

    // Procura um elemento HTML com id "highlightContainer"
    const container = document.getElementById("highlightContainer");

    // Se não encontrar o container, mostra aviso e encerra a função
    if (!container) {
      console.warn("highlightContainer não encontrado.");
      return;
    }

    // Cria um elemento iframe para embedar o vídeo do YouTube
    const iframe = document.createElement("iframe");
    // Define o src do iframe com a URL do YouTube usando a playlist
    iframe.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    // Define o título do iframe
    iframe.title = title;
    // Define permissões do iframe para funcionalidades do YouTube
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    // Define política de referência para segurança
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    // Permite modo tela cheia
    iframe.allowFullscreen = true;
    iframe.className = "aspect-video w-full rounded-lg";

    // Adiciona o iframe dentro do container
    container.appendChild(iframe);
  } catch (error) {
    // Se ocorrer qualquer erro, mostra no console
    console.error("Erro ao carregar vídeo em destaque:", error);
  }
}

// Executa a função loadHighlight quando a página terminar de carregar
window.onload = function () {
  loadHighlight().then(function () {});
};
