import os

os.chdir(r'C:\Users\mgfa9\Project\landing-page')

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Count occurrences
jpg_count = html.count('assets/logo.jpg')
print(f"assets/logo.jpg occurrences: {jpg_count}")

png_count = html.count('assets/logo.png')
print(f"assets/logo.png already: {png_count}")

# Replace first occurrence (navbar) with logo.png
html = html.replace('assets/logo.jpg', 'assets/logo.png', 1)

# Replace second occurrence (footer) with logo-white.png
html = html.replace('assets/logo.jpg', 'assets/logo-white.png', 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Verify
print(f"assets/logo.jpg remaining: {html.count('assets/logo.jpg')}")
print(f"assets/logo.png: {html.count('assets/logo.png')}")
print(f"assets/logo-white.png: {html.count('assets/logo-white.png')}")
print("Done!")
