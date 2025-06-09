document.addEventListener('DOMContentLoaded', () => {
  const slides  = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current   = 0;

  function showSlide(index) {
    console.log(`showSlide() called with index = ${index}`);
    console.log(`slides.length = ${slides.length}`);

    // clamp to valid range
    const newIndex = Math.max(0, Math.min(slides.length - 1, index));
    console.log(` → clamped to newIndex = ${newIndex}`);
    current = newIndex;

    // show/hide slides
    slides.forEach((slide, i) => {
      const visible = i === current;
      slide.style.display = visible ? 'block' : 'none';
      console.log(`   slide[${i}].style.display = ${visible ? 'block' : 'none'}`);
    });

    // update buttons
    if (current === 0) {
      console.log('  on first slide → hide Prev, show Next');
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'inline-block';
    }
    else if (current === slides.length - 1) {
      console.log('  on last slide → show Prev, hide Next');
      prevBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
    }
    else {
      console.log('  on middle slide → show both');
      prevBtn.style.display = 'inline-block';
      nextBtn.style.display = 'inline-block';
    }
  }

  prevBtn.addEventListener('click', () => {
    console.log('Prev button clicked (current =', current, ')');
    showSlide(current - 1);
  });

  nextBtn.addEventListener('click', () => {
    console.log('Next button clicked (current =', current, ')');
    showSlide(current + 1);
  });

  // initial render
  showSlide(0);
});


