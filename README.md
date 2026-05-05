# Landing Page

Landing page layanan pembuatan website profesional dengan desain modern, pricing section, dan integrasi WhatsApp.

🌐 **Live:** [landing.novasistem.cloud](https://landing.novasistem.cloud)

## Fitur

- Hero section dengan CTA
- Layanan cards
- Pricing table
- Portfolio showcase
- Contact form & WhatsApp link
- Responsive mobile-friendly
- Smooth scroll navigation

## Teknologi

- HTML5 + CSS3
- Tailwind CSS (CDN)
- Alpine.js (CDN)
- Docker (Nginx)

## Instalasi

```bash
git clone https://github.com/MuhamadGilangFikriAzi/landing-page.git
cd landing-page

docker build -t landing-page .
docker run -d -p 8082:80 landing-page
```

## Struktur

```
landing-page/
├── index.html     # Halaman utama
├── Dockerfile
└── nginx.conf
```
