require("dotenv").config();
const express = require("express");
const {
  ServicoAtualizacoesVercel,
  ErroServicoAtualizacoes,
} = require("../servicoAtualizacoesVercel");

const app = express();

const binId = process.env.JSONBIN_ID;
const chaveAcesso = process.env.JSONBIN_ACCESS_KEY;
const duracaoCacheMinutos = parseInt(
  process.env.DURACAO_CACHE_MINUTOS || "15",
  10
);

let servicoAtualizacoes;

app.use(express.json());
app.use(express.static("public"));

app.use((req, res, proximo) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  proximo();
});

// Inicializa o serviço
if (!servicoAtualizacoes) {
  servicoAtualizacoes = new ServicoAtualizacoesVercel(
    binId,
    chaveAcesso,
    duracaoCacheMinutos
  );
}

app.get("/", (req, res) => {
  res.json({
    mensagem: "Serviço de Atualizações - API (Vercel)",
    versao: "1.0.0",
    endpoints: {
      atualizacoes: "/api/atualizacoes",
      atualizacaoPorVersao: "/api/atualizacoes/:versao",
      atualizacoesPorPrefixo: "/api/atualizacoes/prefixo/:prefixo",
      exportar: "/api/exportar",
      estatisticas: "/api/estatisticas",
    },
  });
});

app.get("/api/atualizacoes", async (req, res) => {
  try {
    const atualizacoes = await servicoAtualizacoes.obterAtualizacoes();

    res.json({
      sucesso: true,
      total: atualizacoes.length,
      atualizacoes,
    });
  } catch (erro) {
    console.error("Erro ao obter atualizações:", erro);
    res.status(erro.codigoStatus || 500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

app.get("/api/atualizacoes/:versao", async (req, res) => {
  try {
    const { versao } = req.params;
    const atualizacao =
      await servicoAtualizacoes.obterAtualizacaoPorVersao(versao);

    res.json({
      sucesso: true,
      atualizacao,
    });
  } catch (erro) {
    console.error("Erro ao obter atualização:", erro);
    res.status(erro.codigoStatus || 500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

app.get("/api/atualizacoes/prefixo/:prefixo", async (req, res) => {
  try {
    const { prefixo } = req.params;
    const atualizacoes =
      await servicoAtualizacoes.obterAtualizacoesPorPrefixo(prefixo);

    res.json({
      sucesso: true,
      total: atualizacoes.length,
      atualizacoes,
    });
  } catch (erro) {
    console.error("Erro ao obter atualizações por prefixo:", erro);
    res.status(erro.codigoStatus || 500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

app.get("/api/exportar", async (req, res) => {
  try {
    const dados = await servicoAtualizacoes.exportarDados();

    res.json({
      sucesso: true,
      total: dados.length,
      dados,
      exportadoEm: new Date().toISOString(),
    });
  } catch (erro) {
    console.error("Erro ao exportar dados:", erro);
    res.status(erro.codigoStatus || 500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

app.get("/api/estatisticas", async (req, res) => {
  try {
    const estatisticas = await servicoAtualizacoes.obterEstatisticas();

    res.json({
      sucesso: true,
      estatisticas,
    });
  } catch (erro) {
    console.error("Erro ao obter estatísticas:", erro);
    res.status(erro.codigoStatus || 500).json({
      sucesso: false,
      erro: erro.message,
    });
  }
});

module.exports = app;

