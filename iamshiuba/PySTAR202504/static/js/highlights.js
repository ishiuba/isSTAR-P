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

    container.innerHTML = `
      <div class="highlight-wrapper">
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
            title="${title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    `;
  } catch (error) {
    // Se ocorrer qualquer erro, mostra no console
    console.error("Erro ao carregar vídeo em destaque:", error);
  }
}

// Executa a função loadHighlight quando a página terminar de carregar
window.onload = function () {
  loadHighlight().then(function () {});
};
