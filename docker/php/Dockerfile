FROM php:7.4-fpm
# install composer
RUN cd /usr/bin && curl -s https://getcomposer.org/installer | php && ln -s /usr/bin/composer.phar /usr/bin/composer
RUN apt-get update \
    && apt-get install -y \
    git \
    zip \
    unzip \
    vim
RUN apt-get update \
    && apt-get install -y libpq-dev \
    sqlite3 libsqlite3-dev \
    libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
    && docker-php-ext-install pdo_mysql pdo_pgsql \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y yarn
WORKDIR /var/www/php
