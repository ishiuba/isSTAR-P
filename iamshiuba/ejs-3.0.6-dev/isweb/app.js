require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const SpotifyWebApi = require("spotify-web-api-node");
const path = require("path");
const app = express();

// Configura o cliente do YouTube
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Cache para dados do YouTube
let youtubeCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutos em milissegundos
};

// Configura Spotify
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Cache para dados do Spotify
let spotifyCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutos em milissegundos
};

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

// Função auxiliar para adicionar timeout em promises
function promiseWithTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    ),
  ]);
}

// Função para buscar estatísticas do YouTube com cache
async function getYouTubeStats() {
  // Verifica se há cache válido
  const now = Date.now();
  if (
    youtubeCache.data &&
    youtubeCache.timestamp &&
    now - youtubeCache.timestamp < youtubeCache.ttl
  ) {
    console.log("Usando cache do YouTube");
    return youtubeCache.data;
  }

  try {
    const response = await promiseWithTimeout(
      youtube.channels.list({
        part: "statistics",
        id: process.env.YOUTUBE_CHANNEL_ID,
      }),
      3000
    );

    if (response.data.items.length > 0) {
      const stats = response.data.items[0].statistics;

      // Atualiza o cache
      youtubeCache.data = stats;
      youtubeCache.timestamp = now;

      return stats;
    }

    return { viewCount: 0, subscriberCount: 0, videoCount: 0 };
  } catch (error) {
    console.error("Erro ao buscar dados do YouTube:", error.message);

    // Se houver cache antigo, usa ele mesmo expirado
    if (youtubeCache.data) {
      console.log("Usando cache expirado do YouTube devido a erro");
      return youtubeCache.data;
    }

    return { viewCount: 0, subscriberCount: 0, videoCount: 0 };
  }
}

// Função para buscar estatísticas do artista no Spotify
async function getSpotifyArtistStats() {
  // Verifica se há cache válido
  const now = Date.now();
  if (
    spotifyCache.data &&
    spotifyCache.timestamp &&
    now - spotifyCache.timestamp < spotifyCache.ttl
  ) {
    console.log("Usando cache do Spotify");
    return spotifyCache.data;
  }

  try {
    // Garante que temos um token válido
    await getSpotifyAccessToken();

    // Busca os álbuns do artista com timeout de 3 segundos
    const albums = await promiseWithTimeout(
      spotifyApi.getArtistAlbums(process.env.SPOTIFY_ARTIST_ID, {
        limit: 50,
        include_groups: "album,single",
      }),
      3000
    );

    let totalTracks = 0;

    // Busca detalhes de todos os álbuns em paralelo (máximo 10 por vez para não sobrecarregar)
    const albumIds = albums.body.items.map((album) => album.id);
    const batchSize = 10;

    for (let i = 0; i < albumIds.length; i += batchSize) {
      const batch = albumIds.slice(i, i + batchSize);
      const albumDetailsPromises = batch.map((id) =>
        promiseWithTimeout(spotifyApi.getAlbum(id), 2000).catch((err) => {
          console.error(`Erro ao buscar álbum ${id}:`, err.message);
          return null;
        })
      );

      const results = await Promise.all(albumDetailsPromises);

      for (const albumDetails of results) {
        if (albumDetails && albumDetails.body) {
          totalTracks += albumDetails.body.tracks.total;
        }
      }
    }

    const result = {
      totalTracks: totalTracks,
      totalAlbums: albums.body.total,
    };

    // Atualiza o cache
    spotifyCache.data = result;
    spotifyCache.timestamp = now;

    return result;
  } catch (error) {
    console.error("Erro ao buscar dados do Spotify:", error.message);

    // Se houver cache antigo, usa ele mesmo expirado
    if (spotifyCache.data) {
      console.log("Usando cache expirado do Spotify devido a erro");
      return spotifyCache.data;
    }

    return {
      totalTracks: 0,
      totalAlbums: 0,
    };
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

app.get("/", async (req, res) => {
  // Busca dados do YouTube e Spotify em paralelo para melhor performance
  const [estatisticas, spotify_stats] = await Promise.all([
    getYouTubeStats().catch((e) => {
      console.log("Erro na API do YouTube:", e.message);
      return { viewCount: 0, subscriberCount: 0, videoCount: 0 };
    }),
    getSpotifyArtistStats().catch((e) => {
      console.log("Erro na API do Spotify:", e.message);
      return { totalTracks: 0, totalAlbums: 0 };
    }),
  ]);

  // Passa os dados para o layout
  res.render("layout", {
    conteudo: "./pages/index", // Seu include dinâmico
    yt_estatisticas: estatisticas, // Passando os dados para usar no EJS
    spotify_estatisticas: spotify_stats, // Dados do Spotify
  });
});

app.get("/streaming", (req, res) => {
  res.render("layout", { conteudo: "./pages/streaming" });
});

app.get("/sobre", (req, res) => {
  res.render("layout", { conteudo: "./pages/sobre" });
});

app.get("/atualizacoes", (req, res) => {
  res.render("layout", { conteudo: "./pages/atualizacoes" });
})

app.get("/estatisticas-yt", async (req, res) => {
  try {
    // 3. Faz a chamada para a API
    const response = await youtube.channels.list({
      part: "statistics", // Pede apenas as estatísticas
      id: process.env.YOUTUBE_CHANNEL_ID,
    });

    // Verifica se achou o canal
    if (response.data.items.length === 0) {
      return res.status(404).send("Canal não encontrado");
    }

    // 4. Extrai os dados
    const stats = response.data.items[0].statistics;

    const dados = {
      inscritos: stats.subscriberCount,
      visualizacoes: stats.viewCount,
      videos: stats.videoCount,
    };

    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados do Google:", error);
    res.status(500).send("Erro interno ao consultar API");
  }
});

app.get("/estatisticas-spotify", async (req, res) => {
  try {
    const stats = await getSpotifyArtistStats();

    const dados = {
      faixas: stats.totalTracks,
      albuns: stats.totalAlbums,
    };

    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados do Spotify:", error);
    res.status(500).send("Erro interno ao consultar API");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Export the Express app for Vercel
module.exports = app;
