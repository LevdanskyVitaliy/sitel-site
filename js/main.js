/**
 * Sitel — общий JavaScript для всех страниц MPA
 * Без тяжёлых эффектов: никаких IntersectionObserver, shimmer, pulse-glow
 */

// Header scroll shadow
(function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();

// Mobile menu
function closeMobile() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.remove('open');
}

// Dropdown for products
function toggleDropdown(id) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  dropdown.classList.toggle('open');
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  document.querySelectorAll('.dropdown.open').forEach(d => {
    if (!d.contains(e.target)) d.classList.remove('open');
  });
});

// Accordion
function toggleAccordion(btn) {
  const content = btn.nextElementSibling;
  const arrow = btn.querySelector('.arrow');
  if (!content || !arrow) return;

  const isOpen = content.classList.contains('open');

  // Close all on the same page (можно убрать, если нужно несколько открытых)
  document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));

  btn.setAttribute('aria-expanded', !isOpen);
  if (!isOpen) {
    content.classList.add('open');
    arrow.classList.add('open');
  }
}

// Modals
function openModal(type) {
  const modal = document.getElementById('modal-' + type);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(type) {
  const modal = document.getElementById('modal-' + type);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close modal on overlay click (делегирование)
document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ESC closes all modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// Contact form (прототип — подключить реальный бэкенд перед продакшеном)
function handleContactForm(e) {
  e.preventDefault();
  // TODO: POST на /api/lead или внешний сервис (SendPulse, Getform, Formspree)
  const success = document.getElementById('form-success');
  if (success) success.style.display = 'block';
  e.target.querySelectorAll('input,select,button[type=submit]').forEach(el => el.disabled = true);
}

// Smooth scroll для внутренних якорей
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || this.getAttribute('onclick')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - 80,
          behavior: 'smooth'
        });
        closeMobile();
      }
    });
  });
});
