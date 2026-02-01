(function () {
  const container = document.querySelector(".chance-cards");
  const leftBtn = document.querySelector(".chance-card__navigation .left");
  const rightBtn = document.querySelector(".chance-card__navigation .right");
  const cards = document.querySelectorAll(".chance-card");

  if (!container || !leftBtn || !rightBtn) return;

  const scrollAmount = 444;

  function updateNavigationColors() {
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    leftBtn.style.backgroundColor = scrollLeft <= 10 ? "#8d8d8d" : "#1f4567";
    rightBtn.style.backgroundColor = scrollLeft >= maxScroll - 10 ? "#8d8d8d" : "#1f4567";
  }

  rightBtn.onclick = () => container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  leftBtn.onclick = () => container.scrollBy({ left: -scrollAmount, behavior: "smooth" });

  container.addEventListener("scroll", updateNavigationColors);
  window.addEventListener("resize", updateNavigationColors);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.style.transition = "all 0.3s ease";
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.filter = "blur(0px)";
      } else {
        entry.target.style.opacity = "0.4";
        entry.target.style.filter = "blur(2px)";
      }
    });
  }, { root: container, threshold: 0.95 });

  cards.forEach((card) => observer.observe(card));
  updateNavigationColors();
})();

// Checkbox elementini ID orqali tanlab olamiz
const customCheckbox = document.getElementById('customCheckbox');
// SVG elementini uning ichidan tanlab olamiz
const checkboxSVG = customCheckbox.querySelector('svg');

// Aktiv holatni kuzatib borish uchun o'zgaruvchi
let isChecked = false;
const activeColor = '#23A8B3';
const defaultColor = '#AFAFAF';

// Klik hodisasini tinglaymiz
customCheckbox.addEventListener('click', function() {
    // Holatni o'zgartiramiz (true -> false yoki false -> true)
    isChecked = !isChecked;

    // SVG fon rangini holatga qarab o'zgartiramiz
    if (isChecked) {
        checkboxSVG.style.backgroundColor = activeColor;
    } else {
        checkboxSVG.style.backgroundColor = defaultColor;
    }
});
