// UI Module - Interactions, Animations, and Event Handlers

// Loading Screen Management
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// Particle Background
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
  }
}

// Terminal Animation
function typeTerminalText() {
  const terminal = document.getElementById('terminal');
  if (!terminal) return;
  
  const phrases = [
    'npm install security-analytics',
    'npm run analytics:start',
    'npm run dashboard:serve',
    'git commit -m "Analytics integration complete"',
    'docker-compose up -d',
    'kubectl apply -f deployment.yaml'
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentPhrase = phrases[phraseIndex];
    const terminalText = document.getElementById('terminalText');
    
    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        terminalText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      } else {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      typedTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    
    setTimeout(type, isDeleting ? 50 : 100);
  }
  
  typeTerminalText();
}

// Skill Progress Bars Animation
function animateSkillBars() {
  const progressBars = document.querySelectorAll('.progress-fill');
  
  progressBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
      bar.style.width = width;
    }, 200);
  });
}

// Trigger skill animation when skills section is in view
function setupSkillAnimation() {
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;
  
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSkillBars();
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  skillsObserver.observe(skillsSection);
}

// Parallax Effect for Hero Section
function updateParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  
  const scrolled = window.pageYOffset;
  const parallaxElements = hero.querySelectorAll('.hero-text, .hero-visual');
  
  parallaxElements.forEach((element, index) => {
    const speed = index === 0 ? 0.5 : 0.3;
    element.style.transform = `translateY(${scrolled * speed}px)`;
  });
}

// Cursor Glow Effect (Optional - for desktop)
function createCursorGlow() {
  if (window.innerWidth <= 768) return;
  
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
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

// Initialize UI components
function initUI() {
  hideLoadingScreen();
  createParticles();
  typeTerminalText();
  setupSkillAnimation();
  createCursorGlow();
}

// Export for use in other modules
export {
  hideLoadingScreen,
  createParticles,
  typeTerminalText,
  animateSkillBars,
  setupSkillAnimation,
  updateParallax,
  createCursorGlow,
  initUI,
  debounce
};
