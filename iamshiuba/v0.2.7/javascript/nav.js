const nav = document.querySelector("nav");

// Função para importar o nav
function importNav() {
  const navHtml = fetch("nav.html")
    .then((response) => response.text())
    .then((html) => {
      nav.innerHTML = html;
    });
}

// Chamar a função para importar o nav
importNav();

function setLanguage(language) {
  const elementsToTranslate = document.querySelectorAll("[data-translate]");
  elementsToTranslate.forEach((element) => {
    const translationKey = element.getAttribute("data-translate");
    element.innerHTML = translations[language][translationKey];
  });
  // Atualizar textos fora do "data-translate"
  document.querySelector(".greetings h1").innerHTML =
    translations[language].greeting;
  document.querySelector(".greetings p").innerHTML =
    translations[language].mainMessage;
  document.querySelector("footer p");
  // Alterar o texto do botão do seletor de idioma
  const languageDropdownButton = document.getElementById("languageDropdown");
  languageDropdownButton.innerHTML =
    language === "en" ? "EN" : language === "br" ? "BR" : "JP";
  localStorage.setItem("selectedLanguage", language);
}

document.addEventListener("DOMContentLoaded", function () {
  // Verificar se há um idioma selecionado em localStorage
  const selectedLanguage = localStorage.getItem("selectedLanguage");

  // Se houver um idioma selecionado, aplicá-lo
  if (selectedLanguage) {
    setLanguage(selectedLanguage);
  }
});
