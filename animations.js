// Animations Module - Animation and Transition Utilities

// Fade In Animation
function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in`;
  
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

// Fade Out Animation
function fadeOut(element, duration = 300) {
  element.style.opacity = '1';
  element.style.transition = `opacity ${duration}ms ease-out`;
  
  setTimeout(() => {
    element.style.opacity = '0';
  }, duration + 10);
}

// Slide In Animation
function slideIn(element, direction = 'up', distance = 20, duration = 300) {
  const startTransform = direction === 'up' ? `translateY(${distance}px)` : 
                       direction === 'down' ? `translateY(-${distance}px)` :
                       direction === 'left' ? `translateX(${distance}px)` :
                       `translateX(-${distance}px)`;
  
  element.style.transform = startTransform;
  element.style.transition = `transform ${duration}ms ease-out`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.transform = 'translateY(0) translateX(0)';
    element.style.opacity = '1';
  }, 10);
}

// Slide Out Animation
function slideOut(element, direction = 'up', distance = 20, duration = 300) {
  const endTransform = direction === 'up' ? `translateY(-${distance}px)` : 
                     direction === 'down' ? `translateY(${distance}px)` :
                     direction === 'left' ? `translateX(-${distance}px)` :
                     `translateX(${distance}px)`;
  
  element.style.transform = endTransform;
  element.style.transition = `transform ${duration}ms ease-in`;
  
  setTimeout(() => {
    element.style.opacity = '0';
  }, duration);
}

// Scale Animation
function scaleIn(element, startScale = 0.8, duration = 300) {
  element.style.transform = `scale(${startScale})`;
  element.style.transition = `transform ${duration}ms ease-out`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.transform = 'scale(1)';
    element.style.opacity = '1';
  }, 10);
}

function scaleOut(element, endScale = 0.8, duration = 300) {
  element.style.transform = `scale(${endScale})`;
  element.style.transition = `transform ${duration}ms ease-in`;
  
  setTimeout(() => {
    element.style.opacity = '0';
  }, duration);
}

// Rotate Animation
function rotateIn(element, degrees = 360, duration = 500) {
  element.style.transform = 'rotate(0deg)';
  element.style.transition = `transform ${duration}ms ease-in-out`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.transform = `rotate(${degrees}deg)`;
    element.style.opacity = '1';
  }, 10);
}

// Bounce Animation
function bounceIn(element, duration = 600) {
  element.style.animation = `bounceIn ${duration}ms ease-out`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    element.style.opacity = '1';
  }, 10);
}

// Shake Animation
function shake(element, duration = 500) {
  element.style.animation = `shake ${duration}ms ease-in-out`;
}

// Pulse Animation
function pulse(element, duration = 1000) {
  element.style.animation = `pulse ${duration}ms ease-in-out infinite`;
}

// Typewriter Effect
function typewriter(element, text, speed = 50) {
  let index = 0;
  element.textContent = '';
  
  function typeChar() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(typeChar, speed);
    }
  }
  
  typeChar();
}

// Stagger Animation for Multiple Elements
function staggerAnimation(elements, animation, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.style.animation = animation;
    }, index * delay);
  });
}

// Intersection Observer for Scroll Animations
function createScrollObserver(elements, animation, threshold = 0.1) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = animation;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold });
  
  elements.forEach(element => observer.observe(element));
  return observer;
}

// Parallax Effect
function createParallax(elements, speed = 0.5) {
  function updateParallax() {
    const scrolled = window.pageYOffset;
    
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight) {
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      }
    });
  }
  
  window.addEventListener('scroll', updateParallax);
  return updateParallax;
}

// Morph Animation
function morphShape(element, fromShape, toShape, duration = 1000) {
  element.style.transition = `all ${duration}ms ease-in-out`;
  
  setTimeout(() => {
    element.style.clipPath = toShape;
  }, 10);
}

// Loading Dots Animation
function createLoadingDots(container, count = 3) {
  const dots = [];
  
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-dot';
    container.appendChild(dot);
    dots.push(dot);
  }
  
  let currentIndex = 0;
  
  function animateDots() {
    dots.forEach((dot, index) => {
      dot.classList.remove('active');
    });
    
    dots[currentIndex].classList.add('active');
    currentIndex = (currentIndex + 1) % count;
  }
  
  setInterval(animateDots, 200);
  return dots;
}

// Progress Ring Animation
function createProgressRing(element, progress, duration = 1000) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;
  
  element.style.strokeDasharray = `${circumference} ${circumference}`;
  element.style.strokeDashoffset = offset;
  element.style.transition = `stroke-dashoffset ${duration}ms ease-in-out`;
  
  setTimeout(() => {
    element.style.strokeDashoffset = circumference;
  }, 10);
}

// Export for use in other modules
export {
  fadeIn,
  fadeOut,
  slideIn,
  slideOut,
  scaleIn,
  scaleOut,
  rotateIn,
  bounceIn,
  shake,
  pulse,
  typewriter,
  staggerAnimation,
  createScrollObserver,
  createParallax,
  morphShape,
  createLoadingDots,
  createProgressRing
};
