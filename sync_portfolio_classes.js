const fs = require('fs');
const path = require('path');
const fp = path.join('C:', 'Users', 'mgfa9', 'Project', 'landing-page', 'index.html');
let html = fs.readFileSync(fp, 'utf8');

// Fix portfolio HTML classes to match CSS
html = html.replace('<div class="portfolio-img">', '<div class="portfolio-card-img">');
html = html.replace('<div class="portfolio-info">', '<div class="portfolio-card-body">');
html = html.replace('<span class="portfolio-tag">', '<span class="portfolio-card-tag">');

// Fix h3 titles -> add class
const titles = ['Desa Digital', 'POS System', 'Undangan Digital', 'SuruhLaundry', 'Sweet Bake', 'SuruhKelola'];
for (const t of titles) {
  html = html.replace('<h3>' + t + '</h3>', '<h3 class="portfolio-card-title">' + t + '</h3>');
}

// Fix descriptions -> add class
html = html.replace('<p>Website profil desa', '<p class="portfolio-card-desc">Website profil desa');
html = html.replace('<p>Sistem kasir lengkap', '<p class="portfolio-card-desc">Sistem kasir lengkap');
html = html.replace('<p>25 template undangan', '<p class="portfolio-card-desc">25 template undangan');
html = html.replace('<p>Aplikasi manajemen laundry', '<p class="portfolio-card-desc">Aplikasi manajemen laundry');
html = html.replace('<p>Toko kue online', '<p class="portfolio-card-desc">Toko kue online');
html = html.replace('<p>Aplikasi kasir & manajemen', '<p class="portfolio-card-desc">Aplikasi kasir & manajemen');

console.log('Portfolio classes synced!');
console.log('Total length:', html.length);
fs.writeFileSync(fp, html, 'utf8');
