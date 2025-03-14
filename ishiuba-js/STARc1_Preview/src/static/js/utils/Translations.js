// Função para carregar as traduções de um arquivo JSON
async function loadTranslations(language) {
  try {
    const response = await fetch(
      `../../src/static/translations/${language}.json`
    );
    if (!response.ok) {
      throw new Error(`Error loading translations for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Translation loading error:", error);
    throw error; // Relança o erro
  }
}

// Função para definir o idioma e traduzir a página
async function setLanguage(language) {
  const translations = await loadTranslations(language);
  if (!translations) return;

  // Traduz elementos com data-translate
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    element.innerHTML = translations[key] || key;
  });

  // Atualiza título da página
  const currentPath = window.location.pathname.split("/")[1] || "index";
  document.title = `IamSHIUBA - ${
    translations.title[currentPath] || "IamSHIUBA"
  }`;

  // Atualiza localStorage e lang do HTML
  localStorage.setItem("selectedLanguage", language);
  document.documentElement.setAttribute("lang", language);

  // Atualiza o estado ativo em todos os elementos com data-language
  document.querySelectorAll("[data-language]").forEach((el) => {
    if (el.getAttribute("data-language") === language) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

// Configura o MutationObserver para monitorar mudanças no atributo "data-language"
const languageObserver = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (
      mutation.type === "attributes" &&
      mutation.attributeName === "data-language"
    ) {
      const newLanguage = mutation.target.getAttribute("data-language");
      if (newLanguage) {
        setLanguage(newLanguage);
      }
    }
  });
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Recupera o idioma salvo ou define um padrão
  const savedLanguage = localStorage.getItem("selectedLanguage") || "pt-BR";
  setLanguage(savedLanguage).then(() => {});

  // Inicia a observação em todo o documento para mudanças do atributo "data-language"
  languageObserver.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-language"],
  });
});

// Listener global para capturar cliques em qualquer elemento com data-language
document.addEventListener("click", (e) => {
  let el = e.target;
  while (el && el !== document) {
    if (el.hasAttribute("data-language")) {
      const newLanguage = el.getAttribute("data-language");
      if (newLanguage) {
        setLanguage(newLanguage);
      }
      break;
    }
    el = el.parentElement;
  }
});
