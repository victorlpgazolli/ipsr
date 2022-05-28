FROM node:16-alpine

RUN \
    apk update && \
    apk upgrade;

COPY ["package*.json", "./"]

RUN npm ci;

WORKDIR /api

CMD [ "npm","start" ]