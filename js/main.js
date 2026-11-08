/**
 * RG Infotech Solutions — Executive Corporate JavaScript System
 * Core logic for theme switching, mobile drawer navigation,
 * portfolio filtering, form math verification, and animations.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. Current Year Auto-Update
  document.querySelectorAll('.current-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // 2. Theme Toggle Controller
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      try {
        localStorage.setItem('rg_theme', newTheme);
      } catch (e) {
        console.warn('LocalStorage not available for theme persistence.', e);
      }
    });
  }

  // 3. Mobile Navigation Drawer Controller
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');

  function toggleMobileMenu(forceState) {
    const isCurrentlyOpen = document.body.classList.contains('menu-open');
    const willOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    document.body.classList.toggle('menu-open', willOpen);
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }
    if (mobileNavDrawer) {
      mobileNavDrawer.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
    }
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', function () {
      toggleMobileMenu(false);
    });
  }

  // Close mobile drawer when any link inside it is clicked
  document.querySelectorAll('.mobile-nav-link, .mobile-drawer-contact a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMobileMenu(false);
    });
  });

  // Close mobile drawer on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
      toggleMobileMenu(false);
    }
  });

  // Reset drawer if window resized above mobile threshold
  window.addEventListener('resize', function () {
    if (window.innerWidth > 992 && document.body.classList.contains('menu-open')) {
      toggleMobileMenu(false);
    }
  });

  // 4. Portfolio Filter Tabs Controller
  const filterTabs = document.querySelectorAll('.filter-tab');
  const portfolioCards = document.querySelectorAll('.portfolio-grid .app-card');

  if (filterTabs.length && portfolioCards.length) {
    filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        filterTabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        const filterValue = tab.getAttribute('data-filter') || 'all';

        portfolioCards.forEach(function (card) {
          const categories = (card.getAttribute('data-category') || '').split(' ');
          if (filterValue === 'all' || categories.includes(filterValue)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. Anti-Spam Security Math Challenge for Contact Form
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswerInput = document.getElementById('captchaAnswer');
  const contactForm = document.getElementById('contactForm');

  let captchaResult = 0;

  function generateCaptcha() {
    if (!captchaQuestion) return;
    const num1 = Math.floor(Math.random() * 9) + 2;
    const num2 = Math.floor(Math.random() * 9) + 2;
    captchaResult = num1 + num2;
    captchaQuestion.textContent = `${num1} + ${num2} = ?`;
    if (captchaAnswerInput) captchaAnswerInput.value = '';
  }

  generateCaptcha();

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      if (!captchaAnswerInput) return;
      const userAnswer = parseInt(captchaAnswerInput.value.trim(), 10);
      if (userAnswer !== captchaResult) {
        e.preventDefault();
        alert('Security verification failed. Please enter the correct math sum.');
        generateCaptcha();
        captchaAnswerInput.focus();
      }
    });
  }

  // 6. Smooth Scrolling for on-page hash anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 78;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});

