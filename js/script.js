document.addEventListener("DOMContentLoaded", function () {
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  // Create menu overlay
  const menuOverlay = document.createElement("div");
  menuOverlay.className = "menu-overlay";
  document.body.appendChild(menuOverlay);

  if (mobileMenuBtn) {
    // Toggle menu on button click
    mobileMenuBtn.addEventListener("click", function () {
      toggleMobileMenu();
    });

    // Close menu when clicking on overlay
    menuOverlay.addEventListener("click", function () {
      closeMobileMenu();
    });

    // Close menu when clicking on a nav link
    const navItems = document.querySelectorAll(".nav-links a");
    navItems.forEach((item) => {
      item.addEventListener("click", function () {
        closeMobileMenu();
      });
    });

    // Close menu on escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("show")) {
        closeMobileMenu();
      }
    });
  }

  // Toggle mobile menu
  function toggleMobileMenu() {
    navLinks.classList.toggle("show");
    menuOverlay.classList.toggle("show");
    mobileMenuBtn.classList.toggle("active");

    // Prevent body scrolling when menu is open
    if (navLinks.classList.contains("show")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  // Close mobile menu
  function closeMobileMenu() {
    navLinks.classList.remove("show");
    menuOverlay.classList.remove("show");
    mobileMenuBtn.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Cart functionality removed

  // Smooth Scrolling for Navigation Links
  const scrollLinks = document.querySelectorAll('a[href^="#"]');

  scrollLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: "smooth",
        });

        // Close mobile menu if open
        if (navLinks.classList.contains("show")) {
          navLinks.classList.remove("show");
        }
      }
    });
  });

  // Video Play Functionality (Placeholder)
  const videoItems = document.querySelectorAll(".video-item");

  videoItems.forEach((video) => {
    video.addEventListener("click", function () {
      const videoTitle = this.querySelector("img").getAttribute("alt");
      alert(`Playing video: ${videoTitle}`);
      // Here you would typically open a modal with an embedded video
    });
  });

  // Search functionality removed

  // Newsletter Subscription (Placeholder)
  const newsletterForm = document.querySelector(".newsletter-form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const emailInput = this.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (email && isValidEmail(email)) {
        // Save email to localStorage for backend simulation
        saveSubscriber(email);
        alert(`Thank you for subscribing with: ${email}`);
        emailInput.value = "";
      } else {
        alert("Please enter a valid email address");
      }
    });
  }

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Save subscriber to localStorage (backend simulation)
  function saveSubscriber(email) {
    let subscribers = JSON.parse(localStorage.getItem("subscribers")) || [];
    subscribers.push({
      email: email,
      date: new Date().toISOString(),
    });
    localStorage.setItem("subscribers", JSON.stringify(subscribers));
  }

  // Add active class to nav links based on scroll position
  window.addEventListener("scroll", function () {
    const sections = document.querySelectorAll("section[id]");
    const scrollPosition = window.scrollY;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        const activeLink = document.querySelector(
          `.nav-links a[href="#${sectionId}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      } else {
        const inactiveLink = document.querySelector(
          `.nav-links a[href="#${sectionId}"]`
        );
        if (inactiveLink) {
          inactiveLink.classList.remove("active");
        }
      }
    });
  });
});
