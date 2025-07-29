document.addEventListener("DOMContentLoaded", function () {
  // Get the button
  const goToTopButton = document.getElementById("goToTop");

  // Show the button when the user scrolls down 300px from the top
  window.addEventListener("scroll", function () {
    const scrollPosition =
      window.pageYOffset || document.documentElement.scrollTop;

    if (scrollPosition > 300) {
      if (!goToTopButton.classList.contains("active")) {
        goToTopButton.classList.add("active");

        // Add a subtle entrance animation
        setTimeout(() => {
          goToTopButton.style.transform = "translateY(0) scale(1.1)";
          setTimeout(() => {
            goToTopButton.style.transform = "translateY(0) scale(1)";
          }, 200);
        }, 10);
      }
    } else {
      goToTopButton.classList.remove("active");
    }

    // Calculate scroll percentage for progress indicator
    const scrollPercentage =
      (scrollPosition /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight)) *
      100;

    // Optional: You could use this to show a progress indicator on the button
    // For example, changing the button's border or background based on scroll percentage
  });

  // Smooth scroll to top when button is clicked
  goToTopButton.addEventListener("click", function (e) {
    e.preventDefault();

    // Add click animation
    this.classList.add("clicked");
    setTimeout(() => {
      this.classList.remove("clicked");
    }, 300);

    // For modern browsers
    if ("scrollBehavior" in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // For older browsers that don't support scrollTo with behavior
      smoothScrollToTop();
    }

    function smoothScrollToTop() {
      const currentPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (currentPosition > 0) {
        window.requestAnimationFrame(smoothScrollToTop);
        window.scrollTo(0, currentPosition - currentPosition / 8);
      }
    }
  });

  // Add a float animation when hovering
  goToTopButton.addEventListener("mouseenter", function () {
    this.querySelector("i").style.animation = "float 1s ease-in-out infinite";
  });

  goToTopButton.addEventListener("mouseleave", function () {
    this.querySelector("i").style.animation = "none";
  });

  // Add CSS for the clicked animation
  const style = document.createElement("style");
  style.textContent = `
        .go-to-top.clicked {
            animation: clickPulse 0.3s ease-out;
        }

        @keyframes clickPulse {
            0% { transform: scale(1); }
            50% { transform: scale(0.9); }
            100% { transform: scale(1); }
        }
    `;
  document.head.appendChild(style);
});
