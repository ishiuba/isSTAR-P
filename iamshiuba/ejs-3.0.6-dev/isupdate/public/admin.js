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
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; color: #888;">Nenhuma atualização cadastrada</td></tr>';
    return;
  }

  tbody.innerHTML = atualizacoes
    .map(
      (atualizacao) => `
    <tr>
      <td>${atualizacao.id}</td>
      <td><strong>${atualizacao.versao}</strong></td>
      <td><span class="badge badge-${atualizacao.prefixo}">${
        atualizacao.prefixo
      }</span></td>
      <td>${atualizacao.titulo}</td>
      <td>${atualizacao.conteudo.substring(0, 50)}${
        atualizacao.conteudo.length > 50 ? "..." : ""
      }</td>
      <td>${
        atualizacao.link_preview
          ? `<a href="${atualizacao.link_preview}" target="_blank" style="color: #4CAF50;">🔗 Ver</a>`
          : "-"
      }</td>
      <td class="acoes">
        <button class="btn btn-secundario btn-pequeno" onclick='editarAtualizacao(${JSON.stringify(
          atualizacao
        )})'>✏️ Editar</button>
        <button class="btn btn-perigo btn-pequeno" onclick="deletarAtualizacao(${
          atualizacao.id
        }, '${atualizacao.versao}')">🗑️ Deletar</button>
      </td>
    </tr>
  `
    )
    .join("");
}

async function salvarAtualizacao(event) {
  event.preventDefault();

  const id = document.getElementById("idAtualizacao").value;
  const versao = document.getElementById("versao").value;
  const titulo = document.getElementById("titulo").value;
  const conteudo = document.getElementById("conteudo").value;
  const linkPreview = document.getElementById("linkPreview").value;

  const dados = {
    version: versao,
    title: titulo,
    content: conteudo,
    preview_link: linkPreview || null,
  };

  try {
    const resposta = await fetch(`${API_URL}/atualizacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error(resultado.erro);
    }

    mostrarMensagem(
      id
        ? "Atualização editada com sucesso!"
        : "Atualização adicionada com sucesso!",
      "sucesso"
    );
    limparFormulario();
    carregarAtualizacoes();
  } catch (erro) {
    mostrarMensagem(`Erro ao salvar: ${erro.message}`, "erro");
  }
}

function editarAtualizacao(atualizacao) {
  document.getElementById("idAtualizacao").value = atualizacao.id;
  document.getElementById("versao").value = atualizacao.versao;
  document.getElementById("titulo").value = atualizacao.titulo;
  document.getElementById("conteudo").value = atualizacao.conteudo;
  document.getElementById("linkPreview").value = atualizacao.link_preview || "";

  document.getElementById("tituloFormulario").textContent =
    "✏️ Editar Atualização";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deletarAtualizacao(id, versao) {
  if (!confirm(`Tem certeza que deseja deletar a atualização ${versao}?`)) {
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/atualizacoes/${id}`, {
      method: "DELETE",
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
      throw new Error(resultado.erro);
    }

    mostrarMensagem("Atualização deletada com sucesso!", "sucesso");
    carregarAtualizacoes();
  } catch (erro) {
    mostrarMensagem(`Erro ao deletar: ${erro.message}`, "erro");
  }
}

function limparFormulario() {
  document.getElementById("formAtualizacao").reset();
  document.getElementById("idAtualizacao").value = "";
  document.getElementById("tituloFormulario").textContent =
    "➕ Adicionar Nova Atualização";
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
