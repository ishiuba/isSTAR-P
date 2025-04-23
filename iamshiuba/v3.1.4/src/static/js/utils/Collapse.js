/*
// Armazena os elementos em cache e usa const para melhor performance
const collapseElements = document.querySelectorAll('[data-toggle="collapse"]');

// Usa delegação de eventos para reduzir o número de event listeners
document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-toggle="collapse"]');
    if (!trigger) return;

    // Obtém o elemento alvo
    const targetId = trigger.getAttribute('data-target');
    const target = document.getElementById(targetId);
    if (!target) return;

    // Alterna especificamente a barra de navegação (caso necessário)
    const isNavbar = target.classList.contains('md:grid-cols-3'); // Verifica se é o menu da navbar

    if (isNavbar) {
        if (window.innerWidth < 768) {
            target.classList.toggle('show');
        }
    } else {
        target.classList.toggle('show');
    }
});

// Manipula o redimensionamento da janela para a navbar
window.addEventListener('resize', () => {
    const navbar = document.querySelector('.md\\:grid-cols-3');
    if (navbar) {
        if (window.innerWidth >= 768) {
            navbar.classList.add('show');
        } else {
            navbar.classList.remove('show');
        }
    }
});
*/