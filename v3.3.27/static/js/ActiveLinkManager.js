// Marca o link ativo comparando paths absolutos (suporta index.html e barra final)
(function () {
    const normalize = (path) => {
        if (!path) return '/';
        // Garante um formato consistente para homepage
        if (path.endsWith('/')) path += 'index.html';
        if (path.endsWith('/index.html')) return path.slice(0, -'/index.html'.length) || '/';
        return path;
    };

    const updateActiveLinks = () => {
        const currentPath = normalize(window.location.pathname);
        const links = document.querySelectorAll('.n-link, .f-link, .drawer-link');

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href) return;
            // Resolve para URL absoluta e compare apenas pathname
            const linkPath = normalize(new URL(href, window.location.href).pathname);
            if (linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Executa quando o DOM estiver pronto (garante que <i-nav>/<i-menu> já renderizaram)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateActiveLinks);
    } else {
        updateActiveLinks();
    }
})();