const fs = require('fs');
const path = require('path');
const dir = 'C:\\Users\\mgfa9\\Project\\landing-page';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// 1. Hero: replace mockup lines with img
const mockupBar = '<div class="mockup-bar">\n          <span class="mockup-dot" style="background:#ff5f57"></span>\n          <span class="mockup-dot" style="background:#febc2e"></span>\n          <span class="mockup-dot" style="background:#28c840"></span>\n        </div>\n        <div class="mockup-line w80"></div>\n        <div class="mockup-line w60"></div>\n        <div class="mockup-line w80" style="margin-bottom:1.5rem"></div>\n        <div class="mockup-line w40" style="height:80px;border-radius:8px;"></div>\n        <div class="mockup-line w80" style="margin-top:0.8rem"></div>\n        <div class="mockup-line w60"></div>\n        <div class="mockup-line w80"></div>\n      </div>';
const newMockup = '<div class="mockup-bar">\n          <span class="mockup-dot" style="background:#ff5f57"></span>\n          <span class="mockup-dot" style="background:#febc2e"></span>\n          <span class="mockup-dot" style="background:#28c840"></span>\n        </div>\n        <img src="images/mockup-app.png" alt="Screenshot Aplikasi SuruhLaundry - Dashboard" style="width:100%;border-radius:8px;display:block;">\n      </div>';

if (html.includes(mockupBar + '\n        <div class="mockup-line')) {
    html = html.replace(mockupBar + '\n        <div class="mockup-line w80"></div>\n        <div class="mockup-line w60"></div>\n        <div class="mockup-line w80" style="margin-bottom:1.5rem"></div>\n        <div class="mockup-line w40" style="height:80px;border-radius:8px;"></div>\n        <div class="mockup-line w80" style="margin-top:0.8rem"></div>\n        <div class="mockup-line w60"></div>\n        <div class="mockup-line w80"></div>\n      </div>', newMockup);
    console.log('1. Hero screenshot: replaced');
} else {
    console.log('1. Hero screenshot: checking existing...');
    if (html.includes('mockup-app.png')) console.log('   Already has screenshot');
    else console.log('   WARNING: mockup-app.png not found');
}

// 2. Promo text
if (html.includes('Reset setiap pukul 00:00 WIB')) {
    html = html.replace('Reset setiap pukul 00:00 WIB', 'Promo terbatas - buruan sebelum kehabisan!');
    console.log('2. Promo text: replaced');
} else if (html.includes('Promo terbatas')) {
    console.log('2. Promo text: already updated');
} else {
    console.log('2. Promo text: pattern not found');
}

// 3. Product card visuals
// SuruhKelola
const skPattern = '<div class="product-card fade-up">\n        <div class="product-card-icon sk-bg">';
const skReplacement = '<div class="product-card fade-up">\n        <div class="product-card-visual">\n          <img src="images/mockup-kelola.png" alt="Preview SuruhKelola - Aplikasi Kasir" style="width:100%;display:block;border-radius:8px;">\n        </div>\n        <div class="product-card-icon sk-bg">';
if (html.includes(skPattern)) {
    html = html.replace(skPattern, skReplacement);
    console.log('3a. SuruhKelola visual: added');
} else {
    console.log('3a. SuruhKelola visual: ' + (html.includes('product-card-visual') ? 'already has visual' : 'pattern not found'));
}

// SuruhLaundry
const slPattern = '<div class="product-card fade-up fade-up-d1">\n        <div class="product-card-icon sl-bg">';
const slReplacement = '<div class="product-card fade-up fade-up-d1">\n        <div class="product-card-visual">\n          <img src="images/mockup-laundry.png" alt="Preview SuruhLaundry - Dashboard Laundry" style="width:100%;display:block;border-radius:8px;">\n        </div>\n        <div class="product-card-icon sl-bg">';
if (html.includes(slPattern)) {
    html = html.replace(slPattern, slReplacement);
    console.log('3b. SuruhLaundry visual: added');
} else {
    console.log('3b. SuruhLaundry visual: ' + (html.includes('product-card-visual') ? 'already has visual' : 'pattern not found'));
}

// 4. Enterprise pricing
if (html.includes('pricing-enterprise')) {
    console.log('4. Enterprise pricing: already exists');
} else {
    // Add after Pro card in SuruhKelola pricing
    const skMarker = 'Beli Sekarang</a>\n        </div>\n\n      </div>\n    </div>\n\n    <!-- SuruhLaundry Pricing -->';
    const enterprise = `
        <div class="pricing-card pricing-enterprise">
          <div class="pricing-card-badge">Terlaris</div>
          <div class="pricing-name">Enterprise</div>
          <div class="pricing-devices"><i class="fas fa-infinity"></i> Unlimited Device</div>
          <div class="pricing-price">Rp 2.500.000</div>
          <div class="pricing-period">bayar sekali, selamanya</div>
          <ul class="pricing-feature-list">
            <li><i class="fas fa-check"></i> Semua fitur Pro</li>
            <li><i class="fas fa-check"></i> Unlimited device & cabang</li>
            <li><i class="fas fa-check"></i> Dedicated WhatsApp support</li>
            <li><i class="fas fa-check"></i> Prioritas update fitur</li>
            <li><i class="fas fa-check"></i> Konsultasi gratis 30 menit</li>
            <li><i class="fas fa-check"></i> Garansi kepuasan 30 hari</li>
          </ul>
          <a href="beli.html?produk=suruhkelola&paket=enterprise" class="pricing-cta">Hubungi Kami</a>
        </div>`;
    
    if (html.includes(skMarker)) {
        html = html.replace(skMarker, enterprise + '\n\n      </div>\n    </div>\n\n    <!-- SuruhLaundry Pricing -->');
        console.log('4a. Enterprise SK: added');
    }

    // Add after Pro card in SuruhLaundry pricing
    const slMarker = 'Beli Sekarang</a>\n        </div>\n\n      </div>\n    </div>\n\n    <div class="pricing-footer">';
    const enterprise2 = enterprise.replace('suruhkelola', 'suruhlaundry');
    if (html.includes(slMarker)) {
        html = html.replace(slMarker, enterprise2 + '\n\n      </div>\n    </div>\n\n    <div class="pricing-footer">');
        console.log('4b. Enterprise SL: added');
    } else {
        // Try alternate marker
        const slMarker2 = 'Beli Sekarang</a>\n        </div>\n\n      </div>\n    </div>\n\n    <div class="pricing-footer';
        if (html.includes(slMarker2)) {
            html = html.replace(slMarker2, enterprise2 + '\n\n      </div>\n    </div>\n\n    <div class="pricing-footer');
            console.log('4b. Enterprise SL: added (alt marker)');
        } else {
            console.log('4b. Enterprise SL: marker not found, checking structure...');
            const idx = html.indexOf('<!-- SuruhLaundry Pricing -->');
            if (idx > 0) {
                console.log('   Found SuruhLaundry section at', idx);
                const afterSection = html.substring(idx + '<!-- SuruhLaundry Pricing -->'.length);
                const proBtnIdx = afterSection.lastIndexOf('Beli Sekarang</a>');
                console.log('   Last Beli Sekarang at', proBtnIdx, 'in section');
                const afterPro = afterSection.substring(proBtnIdx + 18);
                const gridEnd = afterPro.indexOf('</div>');
                console.log('   grid end at', gridEnd, 'content:', afterPro.substring(0, gridEnd + 6));
            }
        }
    }
}

fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
console.log('\nAll changes applied successfully!');
