const fs = require('fs');
const path = require('path');
const filePath = path.join('C:', 'Users', 'mgfa9', 'Project', 'landing-page', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// ====== BUILD PORTFOLIO SECTION ======
// Portfolio doesn't exist yet, create it
const portfolioSection = `<!-- ============ PORTOFOLIO ============ -->
<section class="section" id="portfolio">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-label">Portofolio</div>
      <h2 class="section-title">Beberapa Project Terbaru</h2>
      <p class="section-sub">Lihat sendiri kualitas hasil kerja kami — dari landing page sampai aplikasi full-stack.</p>
    </div>
    <div class="portfolio-filters fade-up">
      <button class="portfolio-filter active" data-filter="all">Semua</button>
      <button class="portfolio-filter" data-filter="web">Website</button>
      <button class="portfolio-filter" data-filter="app">Aplikasi</button>
    </div>
    <div class="portfolio-grid">
      <div class="portfolio-card fade-up">
        <div class="portfolio-img">
          <img src="images/porto-desadigital.jpg" alt="Desa Digital - Website Profile Desa" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Website</span>
          <h3>Desa Digital</h3>
          <p>Website profil desa dengan fitur berita, layanan, dan data demografi.</p>
        </div>
      </div>
      <div class="portfolio-card fade-up fade-up-d1">
        <div class="portfolio-img">
          <img src="images/porto-pos.jpg" alt="POS System - Aplikasi Kasir" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Aplikasi</span>
          <h3>POS System</h3>
          <p>Sistem kasir lengkap dengan manajemen stok, multi-outlet, dan laporan keuangan.</p>
        </div>
      </div>
      <div class="portfolio-card fade-up fade-up-d2">
        <div class="portfolio-img">
          <img src="images/porto-undangan.jpg" alt="Undangan Digital" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Website</span>
          <h3>Undangan Digital</h3>
          <p>25 template undangan pernikahan premium dengan RSVP dan music latar.</p>
        </div>
      </div>
      <div class="portfolio-card fade-up fade-up-d3">
        <div class="portfolio-img">
          <img src="images/porto-laundry.jpg" alt="SuruhLaundry - Aplikasi Manajemen Laundry" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Aplikasi</span>
          <h3>SuruhLaundry</h3>
          <p>Aplikasi manajemen laundry dengan tracking order, antar jemput, notifikasi WA.</p>
        </div>
      </div>
      <div class="portfolio-card fade-up">
        <div class="portfolio-img">
          <img src="images/porto-sweetbake.jpg" alt="Sweet Bake - Toko Kue Online" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Website</span>
          <h3>Sweet Bake</h3>
          <p>Toko kue online dengan katalog produk, sistem pre-order, dan payment gateway.</p>
        </div>
      </div>
      <div class="portfolio-card fade-up fade-up-d1">
        <div class="portfolio-img">
          <img src="images/porto-kelola.jpg" alt="SuruhKelola - Aplikasi Kasir UMKM" onerror="this.style.display='none'">
        </div>
        <div class="portfolio-info">
          <span class="portfolio-tag">Aplikasi</span>
          <h3>SuruhKelola</h3>
          <p>Aplikasi kasir & manajemen bisnis UMKM. Multi-platform Android & Windows.</p>
        </div>
      </div>
    </div>
    <div class="portfolio-cta fade-up" style="text-align:center;margin-top:2.5rem;">
      <a href="https://wa.me/62881080608167?text=Halo%20SuruhNgoding%2C%20saya%20mau%20lihat%20portofolio%20lebih%20lengkap" target="_blank" class="btn btn-primary" style="justify-content:center;">
        <i class="fab fa-whatsapp"></i> Mau project kayak gini? Chat aja
      </a>
    </div>
  </div>
</section>
`;

// ====== LOCATE ALL SECTION BOUNDARIES ======
const heroEndIdx = html.indexOf('<section class="section" style="background:var(--gray-100)" id="pricing">');
const produkStartIdx = html.indexOf('<section class="section" id="produk-app">');
const lisensiStartIdx = html.indexOf('<section class="section" style="background:var(--gray-100)" id="lisensi">');
const caraBeliStartIdx = html.indexOf('<section class="section" id="cara-beli">');
const aiStartIdx = html.indexOf('<section class="section ai-section" id="ai">');
const faqStartIdx = html.indexOf('<section class="section" id="faq">');
const contactStartIdx = html.indexOf('<section class="section contact-section" id="contact">');
const footerStartIdx = html.indexOf('<footer class="footer">');

// ====== EXTRACT SECTIONS ======
// Everything from header/hero (before pricing) stays at top
const headerHero = html.substring(0, heroEndIdx);

// Extract each section
const pricingSection = html.substring(heroEndIdx, produkStartIdx);
const produkSection = html.substring(produkStartIdx, lisensiStartIdx);
const lisensiSection = html.substring(lisensiStartIdx, caraBeliStartIdx);
const caraBeliSection = html.substring(caraBeliStartIdx, aiStartIdx);
const aiSection = html.substring(aiStartIdx, faqStartIdx);
const faqSection = html.substring(faqStartIdx, contactStartIdx);
const contactSection = html.substring(contactStartIdx, footerStartIdx);
const footerSection = html.substring(footerStartIdx);

// From contact section, extract the section-header + grid content
// (remove the FAQ + Contact HTML that's duplicated from faqSection)

console.log('=== Section lengths ===');
console.log('header+hero:', heroEndIdx);
console.log('pricing    :', pricingSection.length);
console.log('produk     :', produkSection.length);
console.log('lisensi    :', lisensiSection.length);
console.log('caraBeli   :', caraBeliSection.length);
console.log('ai         :', aiSection.length);
console.log('faq        :', faqSection.length);
console.log('contact    :', contactSection.length);
console.log('footer     :', footerSection.length);

// ====== REORDER ======
const reordered = headerHero + '\n\n' +
  portfolioSection + '\n\n' +
  produkSection + '\n\n' +
  pricingSection + '\n\n' +
  lisensiSection + '\n\n' +
  caraBeliSection + '\n\n' +
  aiSection + '\n\n' +
  faqSection + '\n\n' +
  contactSection + '\n\n' +
  footerSection;

// ====== FIX NAVBAR ANCHORS ======
// Change pricing link if needed (portfolio should come first)
// Actually, navbar links should point to correct IDs - they already do

console.log('\n=== Reordered length:', reordered.length, '=== Original length:', html.length);

fs.writeFileSync(filePath, reordered, 'utf8');
console.log('File written successfully!');
