const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\mgfa9\\Project\\landing-page';

// Get clean file from git HEAD
const cleanHtml = execSync('git show HEAD:index.html', { cwd: dir, encoding: 'utf8' });

// Write with explicit UTF-8
fs.writeFileSync(path.join(dir, 'index.html'), cleanHtml, { encoding: 'utf8' });

// Verify
const reread = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const titleMatch = reread.match(/<title>(.+?)<\/title>/);
console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
console.log('Bytes:', fs.statSync(path.join(dir, 'index.html')).size);
console.log('Has portfolio:', reread.includes('id="portfolio"') ? 'YES' : 'NO');

const pricingIdx = reread.indexOf('id="pricing"');
const produkIdx = reread.indexOf('id="produk-app"');
const portfolioIdx = reread.indexOf('id="portfolio"');

console.log('Portfolio pos:', portfolioIdx);
console.log('Produk pos:', produkIdx);
console.log('Pricing pos:', pricingIdx);
console.log('Order correct (portfolio < produk < pricing):', portfolioIdx < produkIdx && produkIdx < pricingIdx ? 'YES' : 'NO');
