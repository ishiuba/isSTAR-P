document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.getElementById("navbar");
  navbar.innerHTML = `
    <nav class="navbar navbar-expand-lg">
      <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu" aria-controls="menu" aria-expanded="false">
          <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand">
          <img class="logo" src="./static/img/ishiuba.png" alt="shiuba" />
        </a>
        <div class="collapse navbar-collapse justify-content-end" id="menu">
          <ul id="pageURl" class="nav nav-underline">
            <li class="nav-item">
              <a class="nav-link active" data-page="home" data-translate="Homepage"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-page="about" data-translate="About"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-page="articles" data-translate="Articles"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-page="TERMS" data-translate="tos"></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-page="PRIVACY" data-translate="privacy"></a>
            </li>
          </ul>
        </div>
        <div class="d-flex col-lg-4">
          <button id="langselect" class="icon" type="button" title="Change Language" data-bs-toggle="collapse" data-bs-target="#language" aria-controls="menu" aria-expanded="false" aria-label="Change Language">
            <span class="fa-solid fa-language"></span>
            <label for="langselect"><span data-translate="Translations"></span></label>
          </button>
          <div class="langclp collapse p-1" id="language">
            <button type="button" data-language="en" title="English" class="fi fi-us"></button>
            <button type="button" data-language="br" title="Português" class="fi fi-br"></button>
            <button type="button" data-language="jp" title="日本語" class="fi fi-jp"></button>
          </div>
        </div>
        <button id="theme-switcher" type="button" class="switch" aria-label="Toggle Theme">
          <i class="fas fa-moon"></i>
        </button>
      </div>
    </nav>
  `;

  // Função para mostrar a seção correspondente e esconder as outras
  function showSection(page) {
    // Esconde todas as seções
    document.querySelectorAll("main section").forEach((section) => {
      section.style.display = "none";
    });

    // Mostra a seção correspondente
    const section = document.getElementById(page);
    if (section) {
      section.style.display = "block";
    }
  }

  // Função para definir o link ativo
  function setActiveLink(activeLink) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    activeLink.classList.add("active");
  }

  // Adiciona o evento de clique para os links da navbar
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.getAttribute("data-page");
      showSection(page);
      setActiveLink(link);
      history.pushState({ page }, page, `#${page}`);
    });
  });

  // Adiciona o evento de clique para o logo (voltar para a home)
  document.querySelector(".navbar-brand").addEventListener("click", () => {
    showSection("home");
    setActiveLink(document.querySelector('.nav-link[data-page="home"]'));
    history.pushState({ page: "home" }, "home", "#home");
  });

  // Verifica o hash da URL ao carregar a página
  function checkHash() {
    const hash = window.location.hash.substring(1); // Remove o '#'
    const validPages = ["home", "about", "articles", "TERMS", "PRIVACY"];
    if (validPages.includes(hash)) {
      showSection(hash);
      setActiveLink(document.querySelector(`.nav-link[data-page="${hash}"]`));
    } else {
      showSection("home");
      setActiveLink(document.querySelector('.nav-link[data-page="home"]'));
    }
  }

  // Verifica o hash ao carregar a página
  checkHash();

  // Verifica o hash quando o usuário navega no histórico
  window.addEventListener("popstate", () => {
    checkHash();
  });
});