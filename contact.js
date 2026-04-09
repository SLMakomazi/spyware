// Contact Module - Contact Form and WhatsApp Functionality

// Contact Form Handling
function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  
  if (!contactForm || !formMessage) return;
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
      // Simulate form submission (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      formMessage.className = 'form-message success';
      formMessage.textContent = 'Message sent successfully! I\'ll get back to you soon.';
      formMessage.style.display = 'block';
      
      // Reset form
      contactForm.reset();
    } catch (error) {
      // Show error message
      formMessage.className = 'form-message error';
      formMessage.textContent = 'Oops! Something went wrong. Please try again.';
      formMessage.style.display = 'block';
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Hide message after 5 seconds
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  });
}

// WhatsApp Status Sharing Helper
function shareToWhatsAppStatus() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent("Siseko Makomazi - DevOps Engineer & Full Stack Developer");
  const description = encodeURIComponent("Check out my portfolio! Junior DevOps Engineer specializing in cloud technologies, CI/CD, and automation.");
  
  // WhatsApp status sharing format
  const whatsappUrl = `https://wa.me/?text=${title}%0A${description}%0A${url}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
}

// Add WhatsApp share button to contact section
function addWhatsAppShareButton() {
  const contactSection = document.querySelector('.contact-content');
  if (!contactSection) return;
  
  const whatsappShare = document.createElement('div');
  whatsappShare.className = 'whatsapp-share';
  whatsappShare.innerHTML = `
    <button onclick="shareToWhatsAppStatus()" class="btn btn-whatsapp">
      <i class="fab fa-whatsapp"></i>
      Share on WhatsApp Status
    </button>
  `;
  contactSection.appendChild(whatsappShare);
}

// WhatsApp preview optimization
function optimizeWhatsAppPreview() {
  // Ensure image is properly sized for WhatsApp
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = 'https://slmakomazi.github.io/MyOfficialPortfolio/professionalImage.jpeg';
}

// Initialize contact functionality
function initContact() {
  setupContactForm();
  addWhatsAppShareButton();
  optimizeWhatsAppPreview();
}

// Export for use in other modules
export {
  setupContactForm,
  shareToWhatsAppStatus,
  addWhatsAppShareButton,
  optimizeWhatsAppPreview,
  initContact
};
