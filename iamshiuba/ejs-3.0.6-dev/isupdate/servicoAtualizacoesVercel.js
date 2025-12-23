const axios = require("axios");

class ErroServicoAtualizacoes extends Error {
  constructor(mensagem, codigoStatus = 500) {
    super(mensagem);
    this.name = "ErroServicoAtualizacoes";
    this.codigoStatus = codigoStatus;
  }
}

class ServicoAtualizacoesVercel {
  constructor(binId, chaveAcesso, duracaoCacheMinutos = 15) {
    this.binId = binId;
    this.chaveAcesso = chaveAcesso;
    this.duracaoCacheMinutos = duracaoCacheMinutos;
    this.cache = null;
    this.ultimaAtualizacaoCache = null;
  }

  cacheValido() {
    if (!this.cache || !this.ultimaAtualizacaoCache) {
      return false;
    }

    const agora = Date.now();
    const tempoDecorrido = agora - this.ultimaAtualizacaoCache;
    const tempoMaximo = this.duracaoCacheMinutos * 60 * 1000;

    return tempoDecorrido < tempoMaximo;
  }

  async buscarAtualizacoesJsonBin() {
    try {
      const resposta = await axios.get(
        `https://api.jsonbin.io/v3/b/${this.binId}/latest`,
        {
          headers: {
            "X-Access-Key": this.chaveAcesso,
          },
        }
      );

      const atualizacoes = resposta.data.record.updates || [];

      this.cache = atualizacoes;
      this.ultimaAtualizacaoCache = Date.now();

      return atualizacoes;
    } catch (erro) {
      console.error("Erro ao buscar do JSONBin:", erro.message);
      throw new ErroServicoAtualizacoes(
        "Erro ao buscar atualizações do JSONBin",
        500
      );
    }
  }

  async obterAtualizacoes() {
    if (this.cacheValido()) {
      console.log("✅ Usando cache");
      return this.cache;
    }

    console.log("📡 Buscando do JSONBin...");
    return await this.buscarAtualizacoesJsonBin();
  }

  async obterAtualizacaoPorVersao(versao) {
    const atualizacoes = await this.obterAtualizacoes();
    const atualizacao = atualizacoes.find((a) => a.version === versao);

    if (!atualizacao) {
      throw new ErroServicoAtualizacoes(
        `Atualização ${versao} não encontrada`,
        404
      );
    }

    return atualizacao;
  }

  async obterAtualizacoesPorPrefixo(prefixo) {
    const atualizacoes = await this.obterAtualizacoes();
    const prefixoLower = prefixo.toLowerCase();

    const filtradas = atualizacoes.filter((a) =>
      a.version.toLowerCase().startsWith(prefixoLower)
    );

    return filtradas;
  }

  async obterEstatisticas() {
    const atualizacoes = await this.obterAtualizacoes();

    const porPrefixo = atualizacoes.reduce((acc, atualizacao) => {
      const prefixo = atualizacao.version.split("-")[0];
      acc[prefixo] = (acc[prefixo] || 0) + 1;
      return acc;
    }, {});

    return {
      total: atualizacoes.length,
      porPrefixo,
      ultimaAtualizacao:
        atualizacoes.length > 0 ? atualizacoes[0].version : null,
    };
  }

  async exportarDados() {
    const atualizacoes = await this.obterAtualizacoes();

    return atualizacoes.map((atualizacao) => ({
      id: null,
      versao: atualizacao.version,
      titulo: atualizacao.title,
      conteudo: atualizacao.content,
      link_preview: atualizacao.preview_link || null,
      prefixo: atualizacao.version.split("-")[0],
      data_criacao: null,
      data_atualizacao: null,
    }));
  }
}

module.exports = {
  ServicoAtualizacoesVercel,
  ErroServicoAtualizacoes,
};

