import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace navbar logo
old_nav = '<a href="#" class="navbar-logo">Suruh<span>Ngoding</span></a>'
new_nav = '<a href="#" class="navbar-logo"><img src="assets/logo.jpg" alt="SuruhNgoding" style="height:32px;width:auto;vertical-align:middle"></a>'

html = html.replace(old_nav, new_nav)

# Replace footer logo
old_footer = '<span class="footer-logo">Suruh<span>Ngoding</span></span>'
new_footer = '<span class="footer-logo"><img src="assets/logo.jpg" alt="SuruhNgoding" style="height:28px;width:auto;vertical-align:middle"></span>'

html = html.replace(old_footer, new_footer)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Verify replacements
nav_count = html.count('assets/logo.jpg')
print(f"Logo references in HTML: {nav_count}")
print("Done!")
