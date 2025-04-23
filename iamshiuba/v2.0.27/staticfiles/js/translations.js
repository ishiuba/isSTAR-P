// Função para carregar as traduções de um arquivo JSON
async function loadTranslations(language) {
  try {    
    // Faz a solicitação HTTP para carregar as traduções
    const response = await fetch(`/static/translations/${language}.json`);
    
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro ao carregar o arquivo de tradução para o idioma ${language}`);
    }
    
    // Retorna as traduções como JSON
    return await response.json();
  } catch (error) {
    // Imprime a mensagem de erro e retorna um objeto vazio
    console.error("Erro ao carregar as traduções:", error);
    return {};
  }
}

// Função para definir o idioma e traduzir a página
async function setLanguage(language) {
  // Carrega as traduções para o idioma selecionado
  const translations = await loadTranslations(language);
  
  // Seleciona os elementos que precisam ser traduzidos
  const elementsToTranslate = document.querySelectorAll("[data-translate]");

  // Traduz cada elemento
  elementsToTranslate.forEach(element => {
    const translationKey = element.getAttribute("data-translate");
    element.innerHTML = translations[translationKey] || translationKey;
  });

  // Salva o idioma selecionado no armazenamento local
  localStorage.setItem("selectedLanguage", language);
  
  // Define a linguagem do documento
  document.documentElement.setAttribute("lang", language);
  
  // Atualiza o título da página
  document.title = translations[document.title.split(" - ")[1]] || document.title.split(" - ")[1];

  // Atualiza a classe 'active' nos botões de idioma
  document.querySelectorAll("#language button").forEach(btn => {
    btn.classList.remove("active");
  });
  
  const activeButton = document.querySelector(`#language button[data-language="${language}"]`);
  if (activeButton) {
    activeButton.classList.add("active");
  }
}

// Inicializa o idioma ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  // Carrega o idioma selecionado do armazenamento local
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
  
  // Define o idioma e traduz a página
  await setLanguage(savedLanguage);

  // Adiciona event listeners aos botões de idioma
  document.querySelectorAll("#language button").forEach(button => {
    button.addEventListener("click", async function() {
      const language = this.dataset.language;
      
      // Define o novo idioma e traduz a página novamente
      await setLanguage(language);
    });
  });
});