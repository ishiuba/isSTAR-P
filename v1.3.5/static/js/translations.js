// Função para carregar as traduções de um arquivo JSON
async function loadTranslations(language) {
  try {
    const response = await fetch(`./json/translations/${language}.json`);
    if (!response.ok) {
      throw new Error(
        `Erro ao carregar o arquivo de tradução para o idioma ${language}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar as traduções:", error);
    return {};
  }
}

// Função para definir o idioma e traduzir a página
async function setLanguage(language) {
  const translations = await loadTranslations(language);
  const elementsToTranslate = document.querySelectorAll("[data-translate]");

  elementsToTranslate.forEach((element) => {
    const translationKey = element.getAttribute("data-translate");
    element.innerHTML = translations[translationKey] || translationKey;
  });

  localStorage.setItem("selectedLanguage", language);
  document.documentElement.setAttribute("lang", language);

  // Atualiza a classe 'active' nos botões de idioma
  document.querySelectorAll("#language button").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeButton = document.querySelector(
    `#language button[data-language="${language}"]`
  );
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

// Inicializa o idioma ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
  await setLanguage(savedLanguage);

  // Adiciona event listeners aos botões de idioma
  document.querySelectorAll("#language button").forEach((button) => {
    button.addEventListener("click", async function () {
      const language = this.dataset.language;
      await setLanguage(language);
    });
  });
});
