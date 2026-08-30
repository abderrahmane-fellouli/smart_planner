#!/bin/sh
set -e

if [ -n "$PORT" ]; then
    sed -i "s/80/$PORT/g" /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf
fi

if [ -n "$DB_SSL_CA_CONTENT" ]; then
    echo "$DB_SSL_CA_CONTENT" > /tmp/aiven-ca.pem
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link || true

apache2-foreground
