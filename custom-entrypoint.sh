#!/bin/sh
# custom-entrypoint.sh

# Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Execute the original entrypoint
exec docker-entrypoint.sh apache2-foreground