const nav = document.querySelector('#nav');

// Função para importar o nav
function importNav() {
  const navHtml = fetch('../../templates/partials/nav.html')
    .then(response => response.text())
    .then(html => {
      nav.innerHTML = html;
    });
}

// Chamar a função para importar o nav
importNav();