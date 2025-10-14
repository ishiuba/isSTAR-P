// Obtém o caminho da URL atual (pathname)
const currentPage = window.location.pathname;

// Obtém todos os links únicos que possuem qualquer uma das classes
const links = document.querySelectorAll('.n-link, .f-link, .drawer-link');

// Processa cada link apenas uma vez
links.forEach((link) => {
    // Verifica se o href do link corresponde à página atual
    if (link.getAttribute("href") === currentPage) {
        // Se corresponder, adiciona a classe 'active' ao link
        link.classList.add("active");
    } else {
        // Se não corresponder, remove a classe 'active' do link
        link.classList.remove("active");
    }
});