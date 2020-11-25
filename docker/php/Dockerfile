FROM node:slim as node

FROM php:7.4-fpm

WORKDIR /var/www/php

COPY --from=composer /usr/bin/composer /usr/bin/composer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    git \
    zip \
    unzip \
    sqlite3 libsqlite3-dev \
    libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
    && docker-php-ext-install pdo_mysql \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules/ /usr/local/lib/node_modules/
COPY --from=node /opt/yarn-* /opt/yarn
RUN ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn \
    && ln -s /opt/yarn/bin/yarn /usr/local/bin/yarnpkg

COPY ./php/composer.* ./php/package.json ./php/yarn.lock ./

RUN composer install --no-scripts && composer clear-cache
RUN yarn install && yarn cache clean

COPY ./php .

RUN composer run-script post-autoload-dump \
    && touch database/database.sqlite \
    && chmod 0666 database/database.sqlite \
    && chmod -R 0777 storage
