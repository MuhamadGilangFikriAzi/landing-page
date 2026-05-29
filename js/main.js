/* SuruhNgoding — Lisensi SuruhKelola & SuruhLaundry */

/* ── Mobile Menu ─────────────────────────────────── */
function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  document.getElementById('menuIcon').className = menu.classList.contains('open')
    ? 'fas fa-times'
    : 'fas fa-bars';
}

/* ── Navbar scroll state ─────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
});

/* ── Pricing tab switcher ────────────────────────── */
function switchPricingTab(product, btn) {
  document.querySelectorAll('.pricing-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pricing-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + product).classList.add('active');
}

/* ── FAQ accordion ───────────────────────────────── */
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── Smooth close mobile menu on anchor click ────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mobile-menu a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('mobileMenu');
      menu.classList.remove('open');
      document.getElementById('menuIcon').className = 'fas fa-bars';
    });
  });
});
