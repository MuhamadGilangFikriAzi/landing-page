import os

os.chdir(r'C:\Users\mgfa9\Project\landing-page')

with open('js/cek-lisensi.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the cekByLicenseKey function
old_func = """function cekByLicenseKey() {
  const val = document.getElementById('inputLicenseKey').value.trim();
  if (!val) { showToast('Masukkan license key terlebih dahulu'); return; }

  showLoading();

  setTimeout(() => {
    if (DEMO_MODE) {
      const found = MOCK_LICENSES.find(l => l.key.toUpperCase() === val.toUpperCase());
      found ? renderLisensiResult(found) : renderNotFound('license_key', val);
    }
    // Supabase hook: await supabase.from('licenses').select('*').eq('key', val)
  }, 500);
}"""

new_func = """function cekByLicenseKey() {
  const val = document.getElementById('inputLicenseKey').value.trim();
  if (!val) { showToast('Masukkan license key terlebih dahulu'); return; }

  showLoading();

  var licenseKey = val.toUpperCase();

  fetch('/api/license/' + encodeURIComponent(licenseKey))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.valid) {
        var lic = {
          key: licenseKey,
          status: data.status,
          product: data.app === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry',
          package: data.package,
          customerName: data.customer_name,
          activatedDevices: data.activated_devices,
          maxDevices: data.max_devices
        };
        renderLisensiResult(lic);
      } else {
        renderNotFound('license_key', val);
      }
    })
    .catch(function() {
      if (DEMO_MODE) {
        var found = MOCK_LICENSES.find(function(l) { return l.key.toUpperCase() === val.toUpperCase(); });
        found ? renderLisensiResult(found) : renderNotFound('license_key', val);
      }
    });
}"""

count = content.count(old_func)
print(f"Found {count} occurrences of old cekByLicenseKey")
content = content.replace(old_func, new_func)

# Replace cekByEmail function
old_email = """function cekByEmail() {
  const val = document.getElementById('inputEmailSearch').value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
  if (!val || !emailRx.test(val)) { showToast('Masukkan email yang valid'); return; }

  showLoading();

  setTimeout(() => {
    if (DEMO_MODE) {
      const found = MOCK_LICENSES.filter(l => l.email.toLowerCase() === val.toLowerCase());
      found.length > 0 ? renderLisensiList(found) : renderNotFound('email', val);
    }
  }, 500);
}"""

new_email = """function cekByEmail() {
  const val = document.getElementById('inputEmailSearch').value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
  if (!val || !emailRx.test(val)) { showToast('Masukkan email yang valid'); return; }

  showLoading();

  fetch('/api/licenses')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var found = data.licenses.filter(function(l) { return l.customer_email.toLowerCase() === val.toLowerCase(); });
      found = found.map(function(l) {
        return {
          key: l.license_key,
          status: l.status,
          product: l.app === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry',
          package: l.package,
          customerName: l.customer_name,
          activatedDevices: l.activated_devices.length,
          maxDevices: l.max_devices
        };
      });
      found.length > 0 ? renderLisensiList(found) : renderNotFound('email', val);
    })
    .catch(function() {
      if (DEMO_MODE) {
        var found = MOCK_LICENSES.filter(function(l) { return l.email.toLowerCase() === val.toLowerCase(); });
        found.length > 0 ? renderLisensiList(found) : renderNotFound('email', val);
      }
    });
}"""

email_count = content.count(old_email)
print(f"Found {email_count} occurrences of old cekByEmail")
content = content.replace(old_email, new_email)

with open('js/cek-lisensi.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated cek-lisensi.js")
print(f"Has fetch: {'fetch(' in content}")
print(f"Has DEMO_MODE fallback: {'DEMO_MODE' in content}")
