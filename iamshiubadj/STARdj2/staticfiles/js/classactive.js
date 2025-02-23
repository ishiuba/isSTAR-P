/* This JavaScript code snippet is targeting a group of buttons within an element with the id
"lang-container". Here's a breakdown of what it does: */
const langButtons = document.querySelectorAll(`#lang-container button#langselect`);
if (langButtons) {
  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.classList.contains('active')) {
        button.classList.remove('active');
      } else {
        langButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      }
    });
  });
}
