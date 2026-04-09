// Components Module - Reusable UI Components

// Modal Component
function createModal(title, content, options = {}) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    if (options.onClose) options.onClose();
  });
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      if (options.onClose) options.onClose();
    }
  });
  
  // Prevent content click from closing
  modal.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  document.body.appendChild(modal);
  return modal;
}

// Toast Notification Component
function createToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
  
  return toast;
}

// Loading Spinner Component
function createSpinner(size = 'medium') {
  const spinner = document.createElement('div');
  spinner.className = `spinner spinner-${size}`;
  spinner.innerHTML = `
    <div class="spinner-circle"></div>
    <div class="spinner-text">Loading...</div>
  `;
  
  document.body.appendChild(spinner);
  return spinner;
}

// Progress Bar Component
function createProgressBar(current, total, label = '') {
  const container = document.createElement('div');
  container.className = 'progress-container';
  
  const percentage = Math.round((current / total) * 100);
  
  container.innerHTML = `
    <div class="progress-label">${label}</div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percentage}%"></div>
      <div class="progress-text">${current}/${total}</div>
    </div>
  `;
  
  return container;
}

// Tab Component
function createTabContainer(tabs) {
  const container = document.createElement('div');
  container.className = 'tab-container';
  
  const tabHeaders = document.createElement('div');
  tabHeaders.className = 'tab-headers';
  
  const tabContent = document.createElement('div');
  tabContent.className = 'tab-content';
  
  tabs.forEach((tab, index) => {
    const header = document.createElement('button');
    header.className = `tab-header ${index === 0 ? 'active' : ''}`;
    header.textContent = tab.label;
    header.addEventListener('click', () => {
      // Update active states
      tabHeaders.querySelectorAll('.tab-header').forEach(h => h.classList.remove('active'));
      header.classList.add('active');
      
      // Update content visibility
      tabContent.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
      tabContent.children[index].classList.add('active');
    });
    tabHeaders.appendChild(header);
    
    const pane = document.createElement('div');
    pane.className = `tab-pane ${index === 0 ? 'active' : ''}`;
    pane.innerHTML = tab.content;
    tabContent.appendChild(pane);
  });
  
  container.appendChild(tabHeaders);
  container.appendChild(tabContent);
  
  return container;
}

// Accordion Component
function createAccordion(items) {
  const container = document.createElement('div');
  container.className = 'accordion';
  
  items.forEach((item, index) => {
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.innerHTML = `
      <h4>${item.title}</h4>
      <span class="accordion-icon">+</span>
    `;
    
    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.innerHTML = item.content;
    
    header.addEventListener('click', () => {
      const isActive = accordionItem.classList.contains('active');
      
      // Close all other items
      container.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-icon').textContent = '+';
      });
      
      // Toggle current item
      if (!isActive) {
        accordionItem.classList.add('active');
        header.querySelector('.accordion-icon').textContent = '-';
      }
    });
    
    accordionItem.appendChild(header);
    accordionItem.appendChild(content);
    container.appendChild(accordionItem);
  });
  
  return container;
}

// Form Validation Component
function createFormValidator(formId) {
  const form = document.getElementById(formId);
  if (!form) return null;
  
  const validators = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => /^[\d\s\-\(\)]+$/.test(value),
    minLength: (value, min) => value.length >= min,
    maxLength: (value, max) => value.length <= max
  };
  
  return {
    validate: (rules) => {
      const errors = {};
      
      Object.keys(rules).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const value = field ? field.value : '';
        const fieldRules = rules[fieldName];
        
        errors[fieldName] = [];
        
        fieldRules.forEach(rule => {
          const [ruleName, ruleValue] = rule.split(':');
          
          if (ruleName === 'required' && !validators.required(value)) {
            errors[fieldName].push('This field is required');
          }
          
          if (ruleName === 'email' && !validators.email(value)) {
            errors[fieldName].push('Please enter a valid email address');
          }
          
          if (ruleName === 'minLength' && !validators.minLength(value, parseInt(ruleValue))) {
            errors[fieldName].push(`Minimum ${ruleValue} characters required`);
          }
          
          if (ruleName === 'maxLength' && !validators.maxLength(value, parseInt(ruleValue))) {
            errors[fieldName].push(`Maximum ${ruleValue} characters allowed`);
          }
        });
      });
      
      return errors;
    },
    
    showErrors: (errors) => {
      // Clear previous errors
      form.querySelectorAll('.error-message').forEach(msg => msg.remove());
      
      Object.keys(errors).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (errors[fieldName].length > 0 && field) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = errors[fieldName][0];
          field.parentNode.appendChild(errorDiv);
        }
      });
    },
    
    clearErrors: () => {
      form.querySelectorAll('.error-message').forEach(msg => msg.remove());
    }
  };
}

// Lazy Load Component
function createLazyLoad(selector, callback) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll(selector).forEach(element => {
    observer.observe(element);
  });
  
  return observer;
}

// Export for use in other modules
export {
  createModal,
  createToast,
  createSpinner,
  createProgressBar,
  createTabContainer,
  createAccordion,
  createFormValidator,
  createLazyLoad
};
