// Função para carregar as traduções de um arquivo JSON
async function loadTranslations(language) {
  try {
    const response = await fetch(`/static/translations/${language}.json`);
    if (!response.ok) {
      throw new Error(`Error loading translations for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Translation loading error:", error);
    return null;
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
  document.title = `iSHIUBA - ${translations.title[currentPath] || "iSHIUBA"}`;

  // Atualiza localStorage e lang do HTML
  localStorage.setItem("selectedLanguage", language);
  document.documentElement.setAttribute("lang", language);

  // Atualiza botão de idioma ativo
  document.querySelectorAll("#language button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.language === language);
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
  setLanguage(savedLanguage);

  // Event listeners para botões de idioma
  document.querySelectorAll("#language button").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });
});
