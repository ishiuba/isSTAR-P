function showSection(sectionId) {
  const carousel = document.querySelector("#carouselExample");
  const items = carousel.querySelectorAll(".carousel-item");

  items.forEach((item) => {
    item.classList.remove("active");
    if (item.id === sectionId) {
      item.classList.add("active");
    }
  });
}
