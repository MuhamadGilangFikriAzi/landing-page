/* SuruhNgoding — main.js */

const LANG = {
  current: localStorage.getItem('sn_lang') || 'id',

  t: {
    id: {
      // Hero
      heroBadge:    'Bisa bantu bisnis Anda naik level',
      heroTitle:    'Bikin Website<br><span class="highlight">Yang Beneran Dipake</span>',
      heroDesc:     'Landing page, company profile, toko online, undangan digital — dikerjain langsung sama developer, bukan template instan. Hasil real yang bikin bisnis kamu keliatan profesional.',
      heroCta:      '<i class="fab fa-whatsapp"></i> Konsultasi Gratis',
      heroPorto:    'Lihat Portofolio',
      // Stats
      statProjects: 'Project Selesai',
      statYears:    'Tahun Pengalaman',
      statOntime:   'Tepat Waktu',
      statResponse: 'Respon Cepat',
      // Portfolio
      portoTitle:   'Project Terbaru',
      portoSub:     'Beberapa website yang udah saya kerjakan — dari landing page sampe sistem POS.',
      // Pricing
      priceTitle:   'Paket Sederhana, Transparan',
      priceSub:     'Domain .suruhngoding.com gratis 1 tahun. Yang keliatan mahal, yang bayar gak bikin sakit.',
      promoLabel:   'Promo Harian',
      promoTitle:   'Diskon 30% Semua Layanan!',
      promoReset:   '&#9881; Reset setiap pukul 00:00 WIB',
      // AI
      aiTitle:       'Balas Chat Pelanggan Pake AI',
      aiSub:         'Pelanggan chatting, AI jawab — lo tinggal pantau. 24 jam, gak libur, gak lembur.',
      aiBen1Title:   'Balas Cepat 24 Jam',
      aiBen1Desc:    'Setiap chat langsung dibalas dalam hitungan detik. Gak ada lagi pelanggan nunggu berjam-jam.',
      aiBen2Title:   'Chat Seperti Admin Asli',
      aiBen2Desc:    'Pelanggan gak bakal sadar mereka chat sama AI — responnya natural, ramah, dan personal.',
      aiBen3Title:   'Hemat Waktu & Fokus',
      aiBen3Desc:    'AI handle pertanyaan umum, kamu fokus ke bisnis utama.',
      aiStep1:       'Hubungin nomor WhatsApp bisnis kamu',
      aiStep2:       'Setel gaya chat sesuai bisnis kamu',
      aiStep3:       'AI siap balas otomatis & natural',
      aiStep4:       'Pantau chat & evaluasi dari dashboard',
      aiDesc1:       'AI ini dirancang biar pelanggan gak sadar lagi chatting sama AI. Responsif, ramah, natural — bukan robot kaku yang jawab "Baik, akan saya bantu."',
      aiDesc2:       'Cocok buat bisnis yang sering kewalahan balas chat, atau lo yang mau tetap responsif meskipun lagi sibuk.',
      aiCta:         'Konsultasi Gratis',
      aiPricingTitle:'Pilih Paket AI',
      aiPricingSub:  'Mulai dari yang sederhana sampai yang paling pintar — ada semua.',
      aiNote:        '💡 AI ini dirancang agar pelanggan tetap merasa seperti chatting dengan admin manusia. Responsif, ramah, dan natural — bukan robot kaku. Cocok untuk bisnis yang sering kewalahan membalas chat WhatsApp pelanggan, atau kamu yang ingin tetap responsif meskipun lagi sibuk.',
      // Contact
      contactTitle:  'Diskusikan Project Kamu',
      contactSub:    'Konsultasi Gratis dulu. Saya bantu tentukan konsep yang pas. Gak ada kewajiban lanjut.',
      // Footer & Nav
      footerRights:  'Hak Cipta &copy; 2026 SuruhNgoding. Dibikin dengan <i class="fas fa-heart" style="color:var(--accent)"></i> di Indonesia.',
      navConsult:    '<i class="fab fa-whatsapp"></i> Konsultasi',
      navConsultM:   '<i class="fab fa-whatsapp"></i> Konsultasi Gratis',
    },
    en: {
      // Hero
      heroBadge:    'Helping your business level up',
      heroTitle:    'Build Websites<br><span class="highlight">That Actually Work</span>',
      heroDesc:     'Landing pages, company profiles, online stores, digital invites — built by a real developer, not templates. Results that make your business look professional.',
      heroCta:      '<i class="fab fa-whatsapp"></i> Free Consultation',
      heroPorto:    'View Portfolio',
      // Stats
      statProjects: 'Projects Done',
      statYears:    'Years Experience',
      statOntime:   'On Time',
      statResponse: 'Fast Response',
      // Portfolio
      portoTitle:   'Latest Projects',
      portoSub:     'Some websites I built — from landing pages to POS systems.',
      // Pricing
      priceTitle:   'Simple, Transparent Pricing',
      priceSub:     'FREE hosting & domain included. Looks premium, pays affordable.',
      promoLabel:   'Daily Promo',
      promoTitle:   '30% Off All Services!',
      promoReset:   '&#9881; Resets daily at 00:00 WIB',
      // AI
      aiTitle:       'Reply Customer Chats with AI',
      aiSub:         'Customer chats, AI replies — you just monitor. 24/7, no off days, no overtime.',
      aiBen1Title:   'Instant 24/7 Replies',
      aiBen1Desc:    'Every chat gets replied in seconds. No more customers waiting for hours.',
      aiBen2Title:   'Feels Like a Real Admin',
      aiBen2Desc:    "Customers won't realize they're chatting with AI — responses are natural, friendly, and personal.",
      aiBen3Title:   'Save Time & Focus',
      aiBen3Desc:    'AI handles common questions so you can focus on what matters most.',
      aiStep1:       'Connect your business WhatsApp number',
      aiStep2:       'Set the chat style to match your brand',
      aiStep3:       'AI replies automatically & naturally',
      aiStep4:       'Monitor chats & evaluate from dashboard',
      aiDesc1:       "Designed so customers don't realize they're chatting with AI. Responsive, friendly, natural — not a stiff robot saying \"I'll be happy to help.\"",
      aiDesc2:       'Perfect for businesses overwhelmed with chats, or when you want to stay responsive while busy.',
      aiCta:         'Free Consultation',
      aiPricingTitle:'Choose Your AI Package',
      aiPricingSub:  'From simple to most advanced — we have everything.',
      aiNote:        "💡 Designed so customers feel like they're chatting with a real human admin. Responsive, friendly, and natural — not a stiff robot. Perfect for businesses overwhelmed with WhatsApp messages.",
      // Contact
      contactTitle:  'Discuss Your Project',
      contactSub:    'Free consultation first. No strings attached, no obligation.',
      // Footer & Nav
      footerRights:  'Copyright &copy; 2026 SuruhNgoding. Made with <i class="fas fa-heart" style="color:var(--accent)"></i> in Indonesia.',
      navConsult:    '<i class="fab fa-whatsapp"></i> Consult',
      navConsultM:   '<i class="fab fa-whatsapp"></i> Free Consultation',
    }
  },

  apply() {
    const t = this.t[this.current];
    if (!t) return;
    const isEn = this.current === 'en';

    const textFields = [
      'heroDesc', 'heroPorto',
      'statProjects', 'statYears', 'statOntime', 'statResponse',
      'portoTitle', 'portoSub',
      'priceTitle', 'priceSub', 'promoLabel', 'promoTitle',
      'aiTitle', 'aiSub',
      'aiBen1Title', 'aiBen1Desc', 'aiBen2Title', 'aiBen2Desc', 'aiBen3Title', 'aiBen3Desc',
      'aiStep1', 'aiStep2', 'aiStep3', 'aiStep4',
      'aiDesc1', 'aiDesc2', 'aiCta',
      'aiPricingTitle', 'aiPricingSub', 'aiNote',
      'contactTitle', 'contactSub',
    ];
    textFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && t[id] !== undefined) el.textContent = t[id];
    });

    const htmlFields = [
      'heroBadge', 'heroTitle', 'heroCta',
      'promoReset', 'footerRights',
      'navConsult', 'navConsultM',
    ];
    htmlFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && t[id] !== undefined) el.innerHTML = t[id];
    });

    document.querySelectorAll('.lang-toggle').forEach(el => {
      el.classList.toggle('is-en', isEn);
      const lbl = el.querySelector('.lang-toggle-label');
      if (lbl) lbl.textContent = isEn ? 'EN' : 'ID';
    });
    document.documentElement.lang = this.current;
  },

  switch() {
    this.current = this.current === 'id' ? 'en' : 'id';
    localStorage.setItem('sn_lang', this.current);
    this.apply();
  }
};

function toggleLang() { LANG.switch(); }

function toggleMobile() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
  document.getElementById('menuIcon').className = menu.classList.contains('open')
    ? 'fas fa-times'
    : 'fas fa-bars';
}

function startCountdown() {
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const diff = end - now;
    if (diff <= 0) {
      ['cdHours', 'cdMinutes', 'cdSeconds'].forEach(id => {
        document.getElementById(id).textContent = '00';
      });
      return;
    }
    document.getElementById('cdHours').textContent   = pad(Math.floor(diff / 3600000));
    document.getElementById('cdMinutes').textContent = pad(Math.floor((diff % 3600000) / 60000));
    document.getElementById('cdSeconds').textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
});

document.addEventListener('DOMContentLoaded', () => {
  LANG.apply();
  startCountdown();
});
