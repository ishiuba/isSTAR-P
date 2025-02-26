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
      const col = document.createElement("div");
      col.className = "col-auto mb-4";

      col.innerHTML = `
        <div class="spotify-playlist">
          <iframe 
            src="https://open.spotify.com/embed/album/${playlistId}" 
            width="100%" 
            height="380" 
            allowtransparency="true" 
            allow="encrypted-media">
          </iframe>
            <div class="playlist-links">
              <a href="${url}" class="btn yt-spotify-btn" target="_blank">
                <i class="fab fa-spotify me-2"></i>
                ${title}
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
  const items = document.querySelectorAll('#spotifyContainer .col-auto');
  items.forEach(item => {
    const title = item.querySelector('.playlist-links .btn').textContent.toLowerCase();
    item.style.display = title.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const loading = document.getElementById("loadingAnimation");
  loading.style.display = "block";

  loadSpotifyPlaylists().then(() => {
    loading.style.display = "none";

    const cards = document.querySelectorAll("#spotifyContainer .col-auto");
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.animation = "slideUp 0.5s ease forwards";
    });
  });

  const spotifySearch = document.getElementById('spotifySearch');
  if (spotifySearch) {
    spotifySearch.addEventListener('input', (e) => {
      filterSpotifyPlaylists(e.target.value);
    });
  }
});
