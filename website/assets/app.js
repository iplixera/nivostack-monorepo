/* NivoStack Marketing Website - JavaScript */

(function() {
  'use strict';

  // ========================================
  // Theme Toggle
  // ========================================
  function initTheme() {
    const toggle = document.querySelector('[data-theme-toggle]');
    const label = document.querySelector('[data-theme-label]');
    const html = document.documentElement;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    if (label) label.textContent = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);

    if (toggle) {
      toggle.addEventListener('click', function() {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        if (label) label.textContent = next.charAt(0).toUpperCase() + next.slice(1);
      });
    }
  }

  // ========================================
  // Navigation Active State
  // ========================================
  function initNavActive() {
    const links = document.querySelectorAll('[data-nav]');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
      }
    });
  }

  // ========================================
  // Docs Search Filter
  // ========================================
  function initDocsSearch() {
    const searchInput = document.querySelector('[data-doc-search]');
    const items = document.querySelectorAll('[data-doc-item]');

    if (!searchInput || items.length === 0) return;

    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();

      items.forEach(function(item) {
        const searchText = (item.getAttribute('data-search') || '').toLowerCase();
        const text = item.textContent.toLowerCase();
        const matches = query === '' || searchText.includes(query) || text.includes(query);
        item.style.display = matches ? '' : 'none';
      });
    });

    // Keyboard shortcut: / to focus search
    document.addEventListener('keydown', function(e) {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========================================
  // Form Validation (Mock)
  // ========================================
  function initForms() {
    const forms = document.querySelectorAll('.form');

    forms.forEach(function(form) {
      const submitBtn = form.querySelector('button[type="button"]');
      if (!submitBtn) return;

      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Simple validation
        const inputs = form.querySelectorAll('input, textarea, select');
        let valid = true;

        inputs.forEach(function(input) {
          if (input.hasAttribute('required') && !input.value.trim()) {
            valid = false;
            input.style.borderColor = 'var(--error)';
          } else {
            input.style.borderColor = '';
          }
        });

        if (valid) {
          // Mock success
          submitBtn.textContent = 'Sent!';
          submitBtn.disabled = true;
          setTimeout(function() {
            submitBtn.textContent = 'Send (mock)';
            submitBtn.disabled = false;
          }, 2000);
        }
      });
    });
  }

  // ========================================
  // Intersection Observer for Animations
  // ========================================
  function initAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .section').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ========================================
  // Mobile Menu Toggle
  // ========================================
  function initMobileMenu() {
    // Placeholder for mobile menu functionality
    // Can be extended with hamburger menu implementation
  }

  // ========================================
  // Initialize
  // ========================================
  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initNavActive();
    initDocsSearch();
    initSmoothScroll();
    initForms();
    initAnimations();
    initMobileMenu();
  });

})();
