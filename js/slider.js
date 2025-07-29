document.addEventListener("DOMContentLoaded", function () {
  // Hero Slider Functionality
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const prevBtn = document.querySelector(".prev-slide");
  const nextBtn = document.querySelector(".next-slide");

  let currentSlide = 0;
  const slideCount = slides.length;
  let slideInterval;
  let isAnimating = false;
  const animationDuration = 800; // Match this with CSS transition duration

  // Initialize slider
  function initSlider() {
    // Set first slide as active
    slides[0].classList.add("active");
    dots[0].classList.add("active");

    // Add progress indicator to first slide
    addProgressIndicator(slides[0]);

    // Start auto-sliding
    startSlideInterval();

    // Add event listeners
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isAnimating) {
        clearInterval(slideInterval);
        prevSlide();
        // Restart auto-sliding after manual navigation
        setTimeout(startSlideInterval, animationDuration);
      }
    });

    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!isAnimating) {
        clearInterval(slideInterval);
        nextSlide();
        // Restart auto-sliding after manual navigation
        setTimeout(startSlideInterval, animationDuration);
      }
    });

    // Add dot click events
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        if (!isAnimating && currentSlide !== index) {
          clearInterval(slideInterval);
          goToSlide(index);
          // Restart auto-sliding after manual navigation
          setTimeout(startSlideInterval, animationDuration);
        }
      });
    });

    // Pause auto-sliding on hover or touch
    const sliderContainer = document.querySelector(".slider-container");

    // Mouse events
    sliderContainer.addEventListener("mouseenter", () => {
      clearInterval(slideInterval);
    });

    sliderContainer.addEventListener("mouseleave", () => {
      startSlideInterval();
    });

    // Touch events for mobile
    sliderContainer.addEventListener(
      "touchstart",
      () => {
        clearInterval(slideInterval);
      },
      { passive: true }
    );

    sliderContainer.addEventListener(
      "touchend",
      () => {
        startSlideInterval();
      },
      { passive: true }
    );

    // Swipe functionality for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    sliderContainer.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const swipeThreshold = 50; // Minimum distance for swipe
      if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - go to next slide
        if (!isAnimating) {
          nextSlide();
        }
      } else if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - go to previous slide
        if (!isAnimating) {
          prevSlide();
        }
      }
    }

    // Pause slider when page is not visible
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearInterval(slideInterval);
      } else {
        startSlideInterval();
      }
    });
  }

  // Add progress indicator to active slide
  function addProgressIndicator(slide) {
    // Remove existing progress indicators
    const existingIndicators = document.querySelectorAll(".slide-progress");
    existingIndicators.forEach((indicator) => indicator.remove());

    // Create and add new progress indicator
    const progressIndicator = document.createElement("div");
    progressIndicator.className = "slide-progress";
    slide.appendChild(progressIndicator);

    // Trigger animation
    setTimeout(() => {
      progressIndicator.classList.add("animate");
    }, 50);
  }

  // Start auto-sliding
  function startSlideInterval() {
    // Clear any existing interval
    clearInterval(slideInterval);

    // Start new interval
    slideInterval = setInterval(nextSlide, 6000); // 6 seconds per slide
  }

  // Go to previous slide
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Go to next slide
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  // Go to specific slide
  function goToSlide(slideIndex) {
    if (isAnimating) return;

    isAnimating = true;

    // Remove active class from current slide and dot
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    // Calculate new slide index (handle wrapping)
    currentSlide = (slideIndex + slideCount) % slideCount;

    // Add active class to new slide and dot
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");

    // Add progress indicator to new active slide
    addProgressIndicator(slides[currentSlide]);

    // Reset animation flag after transition completes
    setTimeout(() => {
      isAnimating = false;
    }, animationDuration);
  }

  // Initialize slider if it exists on the page
  if (slides.length > 0 && dots.length > 0) {
    initSlider();
  }
});
