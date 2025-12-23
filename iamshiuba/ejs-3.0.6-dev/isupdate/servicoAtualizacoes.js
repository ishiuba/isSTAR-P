const axios = require("axios");
const BancoDados = require("./bancoDados");

class ErroServicoAtualizacoes extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = "ErroServicoAtualizacoes";
  }
}

class ServicoAtualizacoes {
  constructor(binId, chaveAcesso, duracaoCacheMinutos = 15) {
    this.binId = binId;
    this.chaveAcesso = chaveAcesso;
    this.cache = null;
    this.expiracaoCache = null;
    this.duracaoCache = duracaoCacheMinutos * 60 * 1000;
    this.bancoDados = new BancoDados();

    if (!this.binId || !this.chaveAcesso) {
      throw new ErroServicoAtualizacoes(
        "Credenciais do JSONBin não configuradas"
      );
    }
  }

  async inicializar() {
    await this.bancoDados.conectar();
    await this.bancoDados.inicializarTabelas();
  }

  cacheValido() {
    return (
      this.cache !== null &&
      this.expiracaoCache !== null &&
      Date.now() < this.expiracaoCache
    );
  }

  extrairPrefixoVersao(versao) {
    if (versao.includes("-") && versao.split("-").length === 2) {
      const [prefixo, versaoLimpa] = versao.split("-");
      return { prefixo, versaoLimpa };
    }
    return { prefixo: "dj", versaoLimpa: versao.replace(/^v/, "") };
  }

  converterVersaoParaTupla(versao) {
    try {
      const partes = versao.replace(/^v/, "").split(".");
      return partes
        .filter((parte) => /^\d+$/.test(parte))
        .map((parte) => parseInt(parte, 10));
    } catch (erro) {
      return [0, 0, 0];
    }
  }

  chaveOrdenacaoVersao(atualizacao) {
    const versao = atualizacao.version || "dj-v0.0.0";

    try {
      const { prefixo, versaoLimpa } = this.extrairPrefixoVersao(versao);
      const tuplaVersao = this.converterVersaoParaTupla(versaoLimpa);

      const prioridadePrefixo = { js: 1, fl: 2, dj: 3 };
      const ordemPrefixo = prioridadePrefixo[prefixo] || 99;

      return { ordemPrefixo, tuplaVersao };
    } catch (erro) {
      return { ordemPrefixo: 999, tuplaVersao: [0, 0, 0] };
    }
  }

  compararVersoes(a, b) {
    const chaveA = this.chaveOrdenacaoVersao(a);
    const chaveB = this.chaveOrdenacaoVersao(b);

    if (chaveA.ordemPrefixo !== chaveB.ordemPrefixo) {
      return chaveA.ordemPrefixo - chaveB.ordemPrefixo;
    }

    for (
      let i = 0;
      i < Math.max(chaveA.tuplaVersao.length, chaveB.tuplaVersao.length);
      i++
    ) {
      const numA = chaveA.tuplaVersao[i] || 0;
      const numB = chaveB.tuplaVersao[i] || 0;
      if (numA !== numB) {
        return numB - numA;
      }
    }

    return 0;
  }

  async buscarAtualizacoesJsonBin() {
    try {
      const timestamp = Date.now();
      const url = `https://api.jsonbin.io/v3/b/${this.binId}?_t=${timestamp}`;

      const resposta = await axios.get(url, {
        headers: {
          "X-Access-Key": this.chaveAcesso,
          "X-Bin-Meta": "false",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        timeout: 10000,
      });

      const dados = resposta.data;
      let atualizacoes = [];

      if (dados.updates) {
        atualizacoes = dados.updates;
      } else if (dados.record && dados.record.updates) {
        atualizacoes = dados.record.updates;
      }

      atualizacoes.sort((a, b) => this.compararVersoes(a, b));

      this.cache = atualizacoes;
      this.expiracaoCache = Date.now() + this.duracaoCache;

      return atualizacoes;
    } catch (erro) {
      throw new ErroServicoAtualizacoes(
        `Falha ao buscar atualizações: ${erro.message}`
      );
    }
  }

  async obterAtualizacoes() {
    if (this.cacheValido()) {
      console.log("Retornando atualizações do cache");
      return this.cache;
    }

    try {
      const atualizacoes = await this.buscarAtualizacoesJsonBin();
      console.log(`Carregadas ${atualizacoes.length} atualizações do JSONBin`);
      return atualizacoes;
    } catch (erro) {
      console.warn("⚠️  JSONBin falhou, usando banco local como fallback");
      console.warn(`Erro: ${erro.message}`);

      const atualizacoesBanco = await this.bancoDados.obterTodasAtualizacoes();

      if (atualizacoesBanco.length === 0) {
        throw new ErroServicoAtualizacoes(
          "Nenhuma atualização disponível no banco local"
        );
      }

      console.log(
        `✓ Carregadas ${atualizacoesBanco.length} atualizações do banco local`
      );
      return this.converterDoBanco(atualizacoesBanco);
    }
  }

  converterDoBanco(atualizacoesBanco) {
    return atualizacoesBanco.map((atualizacao) => ({
      version: atualizacao.versao,
      title: atualizacao.titulo,
      content: atualizacao.conteudo,
      preview_link: atualizacao.link_preview,
    }));
  }

  async sincronizarComBanco() {
    const atualizacoes = await this.obterAtualizacoes();

    for (const atualizacao of atualizacoes) {
      await this.bancoDados.inserirAtualizacao(atualizacao);
    }

    console.log(
      `Sincronizadas ${atualizacoes.length} atualizações com o banco de dados`
    );
  }
}

module.exports = { ServicoAtualizacoes, ErroServicoAtualizacoes };
