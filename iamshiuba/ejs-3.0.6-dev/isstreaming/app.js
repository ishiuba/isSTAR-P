require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const SpotifyWebApi = require("spotify-web-api-node");
const path = require("path");
const app = express();

// Configura o cliente do YouTube
const youtubeApi = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Configura o cliente do Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Função para obter token de acesso do Spotify
async function getSpotifyAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body["access_token"]);
    return true;
  } catch (error) {
    console.error("Erro ao obter token do Spotify:", error);
    return false;
  }
}

// Configuração de arquivos estáticos para Vercel
app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "public/static")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do EJS para Vercel
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Rota para exibir a página do YouTube
app.get("/youtube", async (req, res) => {
  try {
    let todasPlaylists = [];
    let proximaPagina = null;

    // Loop para buscar TODAS as playlists (paginação)
    do {
      const resposta = await youtubeApi.playlists.list({
        part: "snippet,contentDetails",
        channelId: process.env.YOUTUBE_CHANNEL_ID,
        maxResults: 50,
        pageToken: proximaPagina, // Token da próxima página (obrigatório da API)
      });

      todasPlaylists = todasPlaylists.concat(resposta.data.items);
      proximaPagina = resposta.data.nextPageToken; // Pega o token da próxima página
    } while (proximaPagina); // Continua enquanto houver próxima página

    res.render("layout", {
      conteudo: "./pages/youtube",
      playlists: todasPlaylists,
    });
  } catch (erro) {
    console.error("Erro ao buscar playlists do YouTube:", erro);
    res.render("layout", {
      conteudo: "./pages/youtube",
      playlists: [],
      error: "Erro ao carregar playlists",
    });
  }
});

// Rota para exibir a página do Spotify
app.get("/spotify", async (req, res) => {
  try {
    // Obtém token de acesso
    await getSpotifyAccessToken();

    let todosAlbuns = [];
    let posicao = 0;
    let temMais = true;

    // Loop para buscar TODOS os álbuns (paginação)
    while (temMais) {
      const resposta = await spotifyApi.getArtistAlbums(
        process.env.SPOTIFY_ARTIST_ID,
        {
          limit: 50,
          offset: posicao, // Posição inicial (obrigatório da API)
          include_groups: "album,single",
        }
      );

      todosAlbuns = todosAlbuns.concat(resposta.body.items);
      posicao += 50; // Próxima página
      temMais = resposta.body.next !== null; // Verifica se há mais resultados
    }

    res.render("layout", {
      conteudo: "./pages/spotify",
      albums: todosAlbuns,
    });
  } catch (erro) {
    console.error("Erro ao buscar álbuns do Spotify:", erro);
    res.render("layout", {
      conteudo: "./pages/spotify",
      albums: [],
      error: "Erro ao carregar álbuns",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Export the Express app for Vercel
module.exports = app;
