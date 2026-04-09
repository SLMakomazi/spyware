// Navigation Module - Navigation and Scroll Functionality

// Active Navigation Link on Scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLink?.classList.add('active');
    }
  });
}

// Navbar Background on Scroll
function updateNavbarBackground() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Smooth Scroll for Navigation Links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Performance Optimization - Debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Consolidated scroll handler
function handleScroll() {
  updateActiveNavLink();
  updateNavbarBackground();
  if (typeof updateParallax === 'function') {
    updateParallax();
  }
}

// Initialize navigation
function initNavigation() {
  setupSmoothScroll();
  
  // Apply debouncing to scroll events
  window.addEventListener('scroll', debounce(handleScroll, 10));
}

// Export for use in other modules
export {
  updateActiveNavLink,
  updateNavbarBackground,
  setupSmoothScroll,
  handleScroll,
  debounce,
  initNavigation
};
