// Modern Futuristic Portfolio JavaScript

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// ============ MODULE INITIALIZATION ============
// Import and initialize analytics module (only once)
import('./analytics.js').then(module => {
  const SecurityAnalytics = module.default || module;
  
  // Prevent multiple instances
  if (!window.analytics) {
    window.analytics = new SecurityAnalytics();
    console.log('Analytics instance created');
  } else {
    console.log('Analytics instance already exists, skipping initialization');
  }
}).catch(error => {
  console.error('Failed to load analytics module:', error);
});

// Import and initialize UI module
import('./ui.js').then(module => {
  const ui = module.default || module;
  ui.initUI();
}).catch(error => {
  console.error('Failed to load UI module:', error);
});

// Import and initialize navigation module
import('./navigation.js').then(module => {
  const navigation = module.default || module;
  navigation.initNavigation();
}).catch(error => {
  console.error('Failed to load navigation module:', error);
});

// Import and initialize contact module
import('./contact.js').then(module => {
  const contact = module.default || module;
  contact.initContact();
}).catch(error => {
  console.error('Failed to load contact module:', error);
});

// Import and initialize mobile module
import('./mobile.js').then(module => {
  const mobile = module.default || module;
  mobile.initMobile();
}).catch(error => {
  console.error('Failed to load mobile module:', error);
});

// Import and initialize components module
import('./components.js').then(module => {
  const components = module.default || module;
  // Components are available as needed
}).catch(error => {
  console.error('Failed to load components module:', error);
});

// Import and initialize animations module
import('./animations.js').then(module => {
  const animations = module.default || module;
  // Animation utilities are available as needed
}).catch(error => {
  console.error('Failed to load animations module:', error);
});
