FROM node:alpine

WORKDIR /var/www/client

ENV HOST 0.0.0.0
EXPOSE 3000

RUN apk update \
    && apk upgrade \
    && apk add make gcc g++ python

#CMD ["yarn", "run", "dev"]
