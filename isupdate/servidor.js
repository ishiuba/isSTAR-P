require("dotenv").config();
const express = require("express");
const {
  ServicoAtualizacoes,
  ErroServicoAtualizacoes,
} = require("./servicoAtualizacoes");
const BancoDados = require("./bancoDados");

const app = express();
const porta = process.env.PORTA || 3000;

const binId = process.env.JSONBIN_ID;
const chaveAcesso = process.env.JSONBIN_ACCESS_KEY;
const duracaoCacheMinutos = parseInt(
  process.env.DURACAO_CACHE_MINUTOS || "15",
  10
);

let servicoAtualizacoes;
let bancoDados;

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

app.get("/", (req, res) => {
  res.json({
    mensagem: "Serviço de Atualizações - API",
    versao: "1.0.0",
    endpoints: {
      atualizacoes: "/api/atualizacoes",
      atualizacaoPorVersao: "/api/atualizacoes/:versao",
      atualizacoesPorPrefixo: "/api/atualizacoes/prefixo/:prefixo",
      sincronizar: "/api/sincronizar",
      exportar: "/api/exportar",
      estatisticas: "/api/estatisticas",
    },
  });
});

app.get("/api/atualizacoes", async (req, res) => {
  try {
    const atualizacoes = await servicoAtualizacoes.obterAtualizacoes();

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.json({
      sucesso: true,
      total: atualizacoes.length,
      atualizacoes: atualizacoes,
    });
  } catch (erro) {
    console.error("Erro ao obter atualizações:", erro);
    res.status(503).json({
      sucesso: false,
      erro: "Falha ao carregar atualizações",
      detalhes: erro.message,
    });
  }
});

app.get("/api/atualizacoes/:versao", async (req, res) => {
  try {
    const { versao } = req.params;
    const atualizacao = await bancoDados.obterAtualizacaoPorVersao(versao);

    if (!atualizacao) {
      return res.status(404).json({
        sucesso: false,
        erro: "Atualização não encontrada",
      });
    }

    res.json({
      sucesso: true,
      atualizacao: atualizacao,
    });
  } catch (erro) {
    console.error("Erro ao buscar atualização:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar atualização",
      detalhes: erro.message,
    });
  }
});

app.get("/api/atualizacoes/prefixo/:prefixo", async (req, res) => {
  try {
    const { prefixo } = req.params;
    const atualizacoes = await bancoDados.obterAtualizacoesPorPrefixo(prefixo);

    res.json({
      sucesso: true,
      prefixo: prefixo,
      total: atualizacoes.length,
      atualizacoes: atualizacoes,
    });
  } catch (erro) {
    console.error("Erro ao buscar atualizações por prefixo:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar atualizações",
      detalhes: erro.message,
    });
  }
});

app.post("/api/sincronizar", async (req, res) => {
  try {
    await servicoAtualizacoes.sincronizarComBanco();

    res.json({
      sucesso: true,
      mensagem: "Atualizações sincronizadas com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao sincronizar:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao sincronizar atualizações",
      detalhes: erro.message,
    });
  }
});

app.get("/api/exportar", async (req, res) => {
  try {
    const atualizacoes = await bancoDados.obterTodasAtualizacoes();

    res.json({
      sucesso: true,
      total: atualizacoes.length,
      dados: atualizacoes,
      exportadoEm: new Date().toISOString(),
    });
  } catch (erro) {
    console.error("Erro ao exportar:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao exportar dados",
      detalhes: erro.message,
    });
  }
});

app.get("/api/estatisticas", async (req, res) => {
  try {
    const todasAtualizacoes = await bancoDados.obterTodasAtualizacoes();

    const estatisticas = {
      total: todasAtualizacoes.length,
      porPrefixo: {},
    };

    todasAtualizacoes.forEach((atualizacao) => {
      const prefixo = atualizacao.prefixo || "desconhecido";
      estatisticas.porPrefixo[prefixo] =
        (estatisticas.porPrefixo[prefixo] || 0) + 1;
    });

    res.json({
      sucesso: true,
      estatisticas: estatisticas,
    });
  } catch (erro) {
    console.error("Erro ao obter estatísticas:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao obter estatísticas",
      detalhes: erro.message,
    });
  }
});

app.post("/api/atualizacoes", async (req, res) => {
  try {
    const { version, title, content, preview_link } = req.body;

    if (!version || !title || !content) {
      return res.status(400).json({
        sucesso: false,
        erro: "Campos obrigatórios: version, title, content",
      });
    }

    const atualizacao = {
      version,
      title,
      content,
      preview_link: preview_link || null,
    };

    const id = await bancoDados.inserirAtualizacao(atualizacao);

    res.json({
      sucesso: true,
      mensagem: "Atualização adicionada com sucesso",
      id: id,
    });
  } catch (erro) {
    console.error("Erro ao adicionar atualização:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao adicionar atualização",
      detalhes: erro.message,
    });
  }
});

app.delete("/api/atualizacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await bancoDados.deletarAtualizacao(parseInt(id, 10));

    res.json({
      sucesso: true,
      mensagem: "Atualização deletada com sucesso",
    });
  } catch (erro) {
    console.error("Erro ao deletar atualização:", erro);
    res.status(500).json({
      sucesso: false,
      erro: "Erro ao deletar atualização",
      detalhes: erro.message,
    });
  }
});

async function inicializar() {
  try {
    servicoAtualizacoes = new ServicoAtualizacoes(
      binId,
      chaveAcesso,
      duracaoCacheMinutos
    );
    await servicoAtualizacoes.inicializar();

    bancoDados = servicoAtualizacoes.bancoDados;

    console.log("Sincronizando atualizações iniciais...");
    await servicoAtualizacoes.sincronizarComBanco();

    app.listen(porta, () => {
      console.log(`\n🚀 Servidor rodando na porta ${porta}`);
      console.log(`📡 API disponível em http://localhost:${porta}`);
      console.log(`📚 Documentação em http://localhost:${porta}\n`);
    });
  } catch (erro) {
    console.error("Erro ao inicializar servidor:", erro);
    process.exit(1);
  }
}

inicializar();
