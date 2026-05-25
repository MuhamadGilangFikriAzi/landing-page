FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY design-system.css /usr/share/nginx/html/design-system.css
COPY promo.html /usr/share/nginx/html/promo.html
COPY js/ /usr/share/nginx/html/js/
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY robots.txt /usr/share/nginx/html/robots.txt
EXPOSE 80
