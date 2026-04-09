// Mobile Module - Mobile-specific Views and Optimizations

// Mobile viewport height adjustment
function handleMobileViewport() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Adjust for mobile viewport issues
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
}

// Mobile-specific optimizations
function setupMobileOptimizations() {
  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  });

  // Optimize scrolling performance
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateMobileScroll);
      ticking = true;
    }
  }

  function updateMobileScroll() {
    ticking = false;
    // Mobile scroll optimizations here
  }

  document.addEventListener('scroll', requestTick, { passive: true });
}

// Mobile menu handling
function setupMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

// Mobile touch gestures
function setupTouchGestures() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture(touchStartX, touchEndX);
  });
}

function handleSwipeGesture(startX, endX) {
  const swipeThreshold = 50;
  const diff = startX - endX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next section
      navigateToNextSection();
    } else {
      // Swipe right - previous section
      navigateToPreviousSection();
    }
  }
}

function navigateToNextSection() {
  const sections = document.querySelectorAll('section[id]');
  const currentSection = document.querySelector('section[id]:target');
  const currentIndex = Array.from(sections).indexOf(currentSection);
  
  if (currentIndex < sections.length - 1) {
    sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
  }
}

function navigateToPreviousSection() {
  const sections = document.querySelectorAll('section[id]');
  const currentSection = document.querySelector('section[id]:target');
  const currentIndex = Array.from(sections).indexOf(currentSection);
  
  if (currentIndex > 0) {
    sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
  }
}

// Mobile performance optimizations
function optimizeMobilePerformance() {
  // Reduce animation complexity on mobile
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-optimized');
    
    // Disable heavy animations on low-end devices
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    if (isLowEnd) {
      document.body.classList.add('low-performance');
    }
  }
}

// Mobile-specific CSS additions
function addMobileStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .mobile-optimized {
      --animation-duration: 0.3s;
      --transition-speed: fast;
    }
    
    .low-performance {
      --animation-duration: 0.1s;
      --transition-speed: 0s;
    }
    
    .mobile-optimized * {
      will-change: transform, opacity;
    }
    
    @media (max-width: 768px) {
      .hero-text {
        transform: none !important;
      }
      
      .parallax-element {
        transform: none !important;
      }
      
      .cursor-glow {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize mobile functionality
function initMobile() {
  handleMobileViewport();
  setupMobileOptimizations();
  setupMobileMenu();
  setupTouchGestures();
  optimizeMobilePerformance();
  addMobileStyles();
  
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    setTimeout(handleMobileViewport, 100);
  });
}

// Export for use in other modules
export {
  handleMobileViewport,
  setupMobileOptimizations,
  setupMobileMenu,
  setupTouchGestures,
  optimizeMobilePerformance,
  addMobileStyles,
  initMobile
};
