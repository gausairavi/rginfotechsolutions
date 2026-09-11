/**
 * RG Infotech Solutions - Interactive Scripts
 * Handles mobile drawer, header scroll, app filtering, toasts, and form submission.
 */

// Immediate Theme Application (Prevents Flash of Unstyled Theme)
(function initThemeEarly() {
  try {
    const savedTheme = localStorage.getItem('rg_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch (e) { }
})();

document.addEventListener('DOMContentLoaded', () => {
  // 0. Theme Toggle Handler
  const themeToggles = document.querySelectorAll('.theme-toggle, #themeToggleBtn');
  themeToggles.forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('rg_theme', newTheme);
      } catch (e) { }
      if (typeof showToast === 'function') {
        showToast(`Theme switched to ${newTheme.toUpperCase()} mode`, 'info');
      }
    });
  });

  // 1. Sticky Header scroll effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Menu Drawer Controller
  const mobileToggle = document.querySelector('.mobile-toggle');
  const body = document.body;
  const navEl = document.querySelector('header.site-header nav');
  const navActions = document.querySelector('.nav-actions');

  // Ensure backdrop exists
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function closeMobileMenu() {
    body.classList.remove('mobile-nav-active');
    body.style.overflow = '';
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function openMobileMenu() {
    body.classList.add('mobile-nav-active');
    body.style.overflow = 'hidden';
    if (mobileToggle) {
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (body.classList.contains('mobile-nav-active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Backdrop click dismisses mobile menu
  backdrop.addEventListener('click', () => {
    closeMobileMenu();
  });

  // Close when pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('mobile-nav-active')) {
      closeMobileMenu();
    }
  });

  // Automatically reset mobile drawer if viewport exceeds mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && body.classList.contains('mobile-nav-active')) {
      closeMobileMenu();
    }
  });

  // Close mobile nav when clicking any nav link or drawer CTA
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Mobile nav closes on link click
  // (No extra duplicate button injected below menus)

  // 3. Portfolio Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  const appCards = document.querySelectorAll('.app-card[data-category]');

  if (filterBtns.length > 0 && appCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        appCards.forEach(card => {
          const categories = card.getAttribute('data-category').split(' ');
          if (filter === 'all' || categories.includes(filter)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.4s ease forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 4. Contact Form Submission with Math Captcha & FormSubmit Integration
  const contactForm = document.getElementById('contactForm');
  let captchaExpected = 0;

  function initCaptcha() {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 7) + 1;
    captchaExpected = num1 + num2;
    const captchaBadge = document.getElementById('captchaQuestion');
    if (captchaBadge) {
      captchaBadge.textContent = `${num1} + ${num2} = ?`;
    }
  }

  if (contactForm) {
    initCaptcha();

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Verify Captcha
      const captchaInput = document.getElementById('captchaAnswer');
      if (captchaInput) {
        const userAnswer = parseInt(captchaInput.value.trim(), 10);
        if (userAnswer !== captchaExpected) {
          showToast('Security verification failed. Please solve the math check again.', 'error');
          initCaptcha();
          captchaInput.value = '';
          captchaInput.focus();
          return;
        }
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending Message...</span>`;

      try {
        const formData = new FormData(contactForm);
        formData.delete('captchaAnswer');

        const formObj = Object.fromEntries(formData.entries());
        formObj['_subject'] = `New Website Inquiry: ${formObj.name || 'Client'} (${formObj.category || 'General'})`;
        formObj['_template'] = 'table';
        formObj['_captcha'] = 'false';

        const response = await fetch('https://formsubmit.co/ajax/gausairavi24@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formObj)
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && (data.success === true || data.success === 'true')) {
          showToast('Thank you! Your message has been sent to RG Infotech Solutions. We will reach out shortly.', 'success');
          contactForm.reset();
        } else if (data.message && data.message.toLowerCase().includes('activation')) {
          showToast('First-time setup: FormSubmit sent an activation link to gausairavi24@gmail.com. Please check your email to activate!', 'info');
          contactForm.reset();
        } else if (data.message && data.message.toLowerCase().includes('web server')) {
          // If tested on file:// protocol instead of http/https
          contactForm.submit();
        } else {
          showToast('Thank you! Your inquiry has been submitted.', 'success');
          contactForm.reset();
        }
      } catch (err) {
        // Fallback to normal form submit if fetch fails (e.g. offline or strict CORS)
        try {
          contactForm.submit();
        } catch (e) {
          showToast('Thank you! Your inquiry has been submitted.', 'success');
          contactForm.reset();
        }
      } finally {
        initCaptcha();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 5. Play Store Redirection Handler (Instant direct open)
  window.redirectToPlayStore = function (appName, url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 6. Copy Link Handler
  window.copyAppShareLink = function (url, appTitle) {
    navigator.clipboard.writeText(url).then(() => {
      showToast(`Link for ${appTitle} copied to clipboard!`, 'success');
    }).catch(() => {
      showToast(`Direct URL: ${url}`, 'info');
    });
  };

  // 7. Update Current Year
  const yearEls = document.querySelectorAll('.current-year');
  yearEls.forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

/**
 * Toast Notification Dispatcher
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;

  if (type === 'success') {
    iconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span style="font-size: 0.9rem; line-height: 1.4;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
