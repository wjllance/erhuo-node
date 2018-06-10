FROM node:8.3.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

COPY . /home/erhuo

WORKDIR /home/erhuo
RUN npm install

EXPOSE 3500

CMD npm start