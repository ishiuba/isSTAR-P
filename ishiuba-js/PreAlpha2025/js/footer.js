const footer = document.querySelector('footer');

// Função para importar o footer
function importFooter() {
    const footerHtml = fetch('../../templates/partials/footer.html')
        .then(response => response.text())
        .then(html => {
            footer.innerHTML = html;
        });
}

// Chamar a função para importar o footer
importFooter();