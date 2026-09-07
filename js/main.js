/**
 * RG Infotech Solutions - Interactive Scripts
 * Handles mobile drawer, header scroll, app filtering, toasts, and form submission.
 */

// Immediate Theme Application (Prevents Flash of Unstyled Theme)
(function initThemeEarly() {
  try {
    const savedTheme = localStorage.getItem('rg_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  } catch (e) {}
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
      } catch (e) {}
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

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const body = document.body;
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      body.classList.toggle('mobile-nav-active');
      const isExpanded = body.classList.contains('mobile-nav-active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Close mobile nav when clicking any nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('mobile-nav-active');
    });
  });

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

  // 4. Contact Form Simulated Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Sending Message...</span>`;

      setTimeout(() => {
        showToast('Thank you! Your inquiry has been sent to Ravi Gausai & team. We will get back to you shortly.', 'success');
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1200);
    });
  }

  // 5. Play Store Redirection Handler with Feedback
  window.redirectToPlayStore = function(appName, url) {
    showToast(`Redirecting to Google Play Store for ${appName}...`, 'info');
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 600);
  };

  // 6. Copy Link Handler
  window.copyAppShareLink = function(url, appTitle) {
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
