FROM node:16-alpine

RUN \
    apk update && \
    apk upgrade;

COPY ["package*.json", "./"]

RUN npm ci;

WORKDIR /indexer

CMD [ "npm","start" ]