async function loadPlaylists() {
  try {
    const response = await fetch("/static/playlists/data.json");
    const { playlists } = await response.json();

    const playlistContainer = document.getElementById("playlistContainer");

    if (!playlistContainer) {
      console.warn("playlistContainer não encontrado.");
      return;
    }

    playlists.forEach(({ playlistId, title, url }) => {
      // Usando a classe playlist-item em vez de text-center
      const colDiv = document.createElement("div");
      colDiv.className = "playlist-item";

      colDiv.innerHTML = `
            <div class="video-container">
              <iframe
                src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
                title="${title}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
            <div class="playlist-info">
              <h3>${title}</h3>
              <div class="playlist-actions">
                <a
                  class="action-button youtube"
                  href="${url}"
                  target="_blank"
                  aria-label="Check out ${title} playlist on YouTube"
                >
                <i class="fab fa-youtube"></i> <span data-translate="OpenYouTube">Abrir no YouTube</span>
                </a>
              </div>
            </div>
          `;

      playlistContainer.appendChild(colDiv);
    });
  } catch (error) {
    console.error("Erro ao carregar playlists:", error);
  }
}

function filterYouTubePlaylists(searchTerm) {
  // Atualizando o seletor para usar .playlist-item
  const items = document.querySelectorAll("#playlistContainer .playlist-item");
  const searchValue = searchTerm.toLowerCase().trim();

  items.forEach((item) => {
    const title = item
      .querySelector(".playlist-info h3")
      .textContent.toLowerCase();
    const isVisible = title.includes(searchValue);
    item.style.display = isVisible ? "block" : "none";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const loading = document.getElementById("loadingAnimation");
  loading.style.display = "block";

  loadPlaylists().then(() => {
    loading.style.display = "none";

    // Atualizando o seletor para usar .playlist-item
    const cards = document.querySelectorAll(
      "#playlistContainer .playlist-item"
    );
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.style.animation = "slideUp 0.5s ease forwards";
    });
  });

  const searchForm = document.querySelector("#youtubeSearch").closest("form");
  const youtubeSearch = document.getElementById("youtubeSearch");

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Previne o recarregamento da página
      filterYouTubePlaylists(youtubeSearch.value);
    });
  }

  if (youtubeSearch) {
    youtubeSearch.addEventListener("input", (e) => {
      filterYouTubePlaylists(e.target.value);
    });
  }
});
