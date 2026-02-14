mkdir -p /mnt
mount /dev/sda1 /mnt
chmod -R 755 /mnt/var/www/auto-shop
rm -f /mnt/etc/nginx/sites-enabled/*
cat > /mnt/etc/nginx/sites-available/auto-shop <<'EOF'
server {
    listen 80;
    server_name mato-automobile.de www.mato-automobile.de;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name mato-automobile.de www.mato-automobile.de;

    ssl_certificate /etc/letsencrypt/live/mato-automobile.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mato-automobile.de/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /_next/static {
        alias /var/www/auto-shop/.next/static;
        expires max;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public {
        alias /var/www/auto-shop/public;
        expires max;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf ../sites-available/auto-shop /mnt/etc/nginx/sites-enabled/auto-shop
umount /mnt
