FROM node:8.3.0-alpine

COPY . /home/erhuo

WORKDIR /home/erhuo

EXPOSE 3500

CMD npm start