async function loadPlaylists() {
  try {
    const response = await fetch('/static/playlists/data.json');
    const {playlists} = await response.json();

    const playlistContainer = document.getElementById("playlistContainer");

    if (!playlistContainer) {
      console.warn("playlistContainer não encontrado.");
      return;
    }

    playlists.forEach(({playlistId, title, url}) => {
      const colDiv = document.createElement("div");
      colDiv.className = "col-4 p-3";

      colDiv.innerHTML = `
            <div class="youtube-playlist ratio ratio-16x9">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
                title="${title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
            <div class="playlist-links">
              <a
                type="button"
                rel="noopener"
                class="btn yt-spotify-btn"
                href="${url}"
                target="_blank"
                aria-label="Check out ${title} playlist on YouTube"
              >
              <span class="lead">${title}</span>
              </a>
            </div>
          `;

    playlistContainer.appendChild(colDiv);
  });
  } catch (error) {
    console.error("Erro ao carregar playlists:", error);
  }
}

function filterYouTubePlaylists(searchTerm) {
  const items = document.querySelectorAll('#playlistContainer .col-4');
  items.forEach(item => {
    const title = item.querySelector('.lead').textContent.toLowerCase();
    item.style.display = title.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const loading = document.getElementById('loadingAnimation');
  loading.style.display = 'block';
  
  loadPlaylists().then(() => {
    loading.style.display = 'none';
    
    const cards = document.querySelectorAll('#playlistContainer .col-4');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  });

  const youtubeSearch = document.getElementById('youtubeSearch');
  if (youtubeSearch) {
    youtubeSearch.addEventListener('input', (e) => {
      filterYouTubePlaylists(e.target.value);
    });
  }
});
