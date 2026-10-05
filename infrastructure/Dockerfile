FROM php:8.2-apache

# Install SQLite and PDO extensions
RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    libpng-dev \
    libjpeg-dev \
    curl \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql gd

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Copy application files
COPY . /var/www/html/

# Copy Apache virtualhost config
COPY infrastructure/nginx/default.conf /etc/apache2/sites-available/000-default.conf

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/backend/data \
    && chmod -R 775 /var/www/html/public/uploads

EXPOSE 80

CMD ["apache2-foreground"]
