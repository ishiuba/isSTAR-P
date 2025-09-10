async function loadPlaylists() {
  try {
    const response = await fetch('/static/playlists/data.json');
    const data = await response.json();
    const playlists = data.playlists;

    const playlistContainer = document.getElementById("playlistContainer");

    if (!playlistContainer) {
      console.warn("playlistContainer não encontrado.");
      return;
    }

    playlists.forEach((playlist) => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-4 p-3";

      colDiv.innerHTML = `
            <div class="ratio ratio-16x9">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=${playlist.playlistId}"
                title="${playlist.title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
            <div class="playlist-links">
              <a
                type="button"
                rel="noopener"
                class="btn"
                href="${playlist.url}"
                target="_blank"
                aria-label="Check out ${playlist.title} playlist on YouTube"
              >
              <span class="lead">${playlist.title}</span>
              </a>
            </div>
          `;

    playlistContainer.appendChild(colDiv);
  });
  } catch (error) {
    console.error("Erro ao carregar playlists:", error);
  }
}

window.onload = function () {
  loadPlaylists();
};
