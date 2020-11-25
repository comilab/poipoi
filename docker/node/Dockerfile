FROM node:slim

WORKDIR /var/www/client

ENV HOST 0.0.0.0
EXPOSE 3000

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY ./client/package.json ./client/yarn.lock ./

RUN yarn install && yarn cache clean
