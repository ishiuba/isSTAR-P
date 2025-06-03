async function loadHighlight() {
  try {
    const response = await fetch("/static/playlists/highlights.json");
    const data = await response.json();
    const highlight = data.highlight;

    const container = document.getElementById("highlightContainer");

    if (!container) {
      console.warn("highlightContainer não encontrado.");
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/videoseries?list=${highlight.playlistId}`;
    iframe.title = highlight.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    container.appendChild(iframe);

  } catch (error) {
    console.error("Erro ao carregar vídeo em destaque:", error);
  }
}

window.onload = function () {
  loadHighlight();
};
