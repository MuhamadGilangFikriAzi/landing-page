FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY *.html /usr/share/nginx/html/
COPY design-system.css /usr/share/nginx/html/design-system.css
COPY js/ /usr/share/nginx/html/js/
COPY images/ /usr/share/nginx/html/images/
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY robots.txt /usr/share/nginx/html/robots.txt
EXPOSE 80
