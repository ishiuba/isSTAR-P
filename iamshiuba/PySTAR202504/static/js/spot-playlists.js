async function loadSpotifyPlaylists() {
  try {
    const response = await fetch("/static/playlists/spotify-data.json");
    const { playlists } = await response.json();

    const playlistContainer = document.getElementById("spotifyContainer");

    if (!playlistContainer) {
      console.error("Playlist container not found");
      return;
    }

    playlists.forEach(({ playlistId, title, url }) => {
      // Criando um elemento com a classe playlist-item em vez de text-center
      const col = document.createElement("div");
      col.className = "playlist-item";

      col.innerHTML = `
          <div class="video-container">
            <iframe 
              src="https://open.spotify.com/embed/album/${playlistId}"
              frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture">
            </iframe>
          </div>
          <div class="playlist-info">
            <h3>${title}</h3>
            <div class="playlist-actions">
              <a href="${url}" class="action-button spotify" target="_blank">
                <i class="fab fa-spotify"></i> <span data-translate="OpenSpotify">Abrir no Spotify</span>
              </a>
            </div>
          </div>
        `;

      playlistContainer.appendChild(col);
    });
  } catch (error) {
    console.error("Error loading Spotify playlists:", error);
  }
}

function filterSpotifyPlaylists(searchTerm) {
  // Atualizando o seletor para usar .playlist-item
  const items = document.querySelectorAll("#spotifyContainer .playlist-item");
  items.forEach((item) => {
    const title = item
      .querySelector(".playlist-info h3")
      .textContent.toLowerCase();
    item.style.display = title.includes(searchTerm.toLowerCase())
      ? "block"
      : "none";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const loading = document.getElementById("loadingAnimation");
  loading.style.display = "block";

  loadSpotifyPlaylists().then(() => {
    loading.style.display = "none";

    // Atualizando o seletor para usar .playlist-item
    const cards = document.querySelectorAll("#spotifyContainer .playlist-item");
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.animation = "slideUp 0.5s ease forwards";
    });
  });

  const spotifySearch = document.getElementById("spotifySearch");
  if (spotifySearch) {
    spotifySearch.addEventListener("input", (e) => {
      filterSpotifyPlaylists(e.target.value);
    });
  }
});
