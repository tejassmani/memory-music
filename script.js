document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;

  function updateSlides() {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      updateSlides();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (current < slides.length - 1) {
      current++;
      updateSlides();
    }
  });

  // show the first slide on load
  updateSlides();
});
