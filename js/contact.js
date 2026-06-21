// ========== PAGE LOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 500);
  });

  // ========== SCROLL TO TOP ==========
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }
    
    // Header scroll effect
    const header = document.getElementById('header');
    if (window.pageYOffset > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ========== MOBILE MENU ==========
  function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
  }

  function closeMenu() {
    document.getElementById('navMenu').classList.remove('active');
  }

  // ========== LIGHTBOX ==========
  function openLightbox(element) {
    const img = element.querySelector('img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // ========== CONTACT FORM HANDLING ==========
  async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    // Get form data
    const formData = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value,
      message: form.message.value.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      showFormMessage('Please fill in all required fields.', 'error');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
    
    try {
      // Using FormSubmit.co (Free service - no signup required)
      const response = await fetch('https://formsubmit.co/ajax/info@arinolaglobal.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          subject: `Website Inquiry: ${formData.subject}`,
          message: `${formData.message}\n\n---\nSubmitted from: Arinola Website\nDate: ${new Date().toLocaleString()}`
        })
      });
      
      if (response.ok) {
        showFormMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Fallback: Open email client
      const subject = encodeURIComponent(`Website Inquiry: ${formData.subject}`);
      const body = encodeURIComponent(
        `Name: ${formData.firstName} ${formData.lastName}\n` +
        `Email: ${formData.email}\n` +
        `Phone: ${formData.phone}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\nSubmitted from: Arinola Website\nDate: ${new Date().toLocaleString()}`
      );
      
      window.location.href = `mailto:htolajide@yahoo.com?subject=${subject}&body=${body}`;
      
      showFormMessage('Opening your email client... Please send the email to complete your inquiry.', 'success');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Send Message</span>';
      
      setTimeout(() => {
        formMessage.className = 'form-message';
        formMessage.textContent = '';
      }, 10000);
    }
  }

  function showFormMessage(message, type) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ========== SMOOTH SCROLLING FOR ANCHOR LINKS ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ========== UPDATE YEAR ==========
  document.getElementById('year').textContent = new Date().getFullYear();

  // ========== ANIMATION ON SCROLL ==========
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.product-card, .why-card, .testimonial-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // ========== PHONE NUMBER FORMATTING ==========
  document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Format as Nigerian phone number
    if (value.length >= 4) {
      value = `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7, 11)}`;
    } else if (value.length >= 2) {
      value = `${value.slice(0, 4)} ${value.slice(4)}`;
    }
    
    e.target.value = value;
  });

  // ========== CONSOLE MESSAGE ==========
  console.log('%c🏗️ Arinola Multipurpose Global Limited', 'color: #f39c12; font-size: 20px; font-weight: bold;');
  console.log('%cBuilding Dreams with Quality Materials', 'color: #1a2b3c; font-size: 14px;');
  console.log('%c📞 Contact: 0805 883 1399 | 0803 727 7489', 'color: #7f8c8d; font-size: 12px;');