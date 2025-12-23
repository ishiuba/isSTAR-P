const API_URL = process.env.API_URL;

function mostrarMensagem(texto, tipo = "sucesso") {
  const mensagem = document.getElementById("mensagem");
  mensagem.textContent = texto;
  mensagem.className = `mensagem ${tipo}`;
  mensagem.style.display = "block";

  setTimeout(() => {
    mensagem.style.display = "none";
  }, 5000);
}

async function carregarAtualizacoes() {
  try {
    const resposta = await fetch(`${API_URL}/exportar`);
    const dados = await resposta.json();

    if (!dados.sucesso) {
      throw new Error(dados.erro);
    }

    renderizarTabela(dados.dados);
  } catch (erro) {
    mostrarMensagem(`Erro ao carregar atualizações: ${erro.message}`, "erro");
  }
}

function renderizarTabela(atualizacoes) {
  const tbody = document.getElementById("tabelaAtualizacoes");

  if (atualizacoes.length === 0) {
    tbody.innerHTML = `<div class="atualizacoes_card">
          <div class="atualizacoes_card_cabecalho">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Sem Atualizações</h2>
          </div>
          <div class="atualizacoes_conteudo">
            <p>Não há atualizações disponíveis no momento.</p>
          </div>
        </div>`;
    return;
  }

  tbody.innerHTML = atualizacoes
    .map(
      (atualizacao) => `
        <div class="atualizacoes_grade">
          <div class="atualizacoes_card">
            <div class="atualizacoes_card_cabecalho">
              <i class="fas fa-newspaper"></i>
              <h2>${atualizacao.titulo}</h2>
            </div>
            <div class="atualizacoes_versao">${atualizacao.versao}</div>
            <div class="atualizacoes_conteudo">
              <p class="atualizacoes_conteudo_texto">
                ${atualizacao.conteudo}
              </p>

              ${
                atualizacao.link_preview
                  ? `<div class="atualizacoes_cpa">
                      <a
                        href="${atualizacao.link_preview}"
                        target="_blank"
                        class="atualizacao_linkPreview"
                      >
                        <span data-translate="viewPreview">Ver Prévia</span>
                      </a>
                    </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

async function sincronizar() {
  try {
    mostrarMensagem("Sincronizando com JSONBin...", "sucesso");

    const resposta = await fetch(`${API_URL}/sincronizar`, {
      method: "POST",
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error(resultado.erro);
    }

    mostrarMensagem("Sincronização concluída com sucesso!", "sucesso");
    carregarAtualizacoes();
  } catch (erro) {
    mostrarMensagem(`Erro ao sincronizar: ${erro.message}`, "erro");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarAtualizacoes();
});
