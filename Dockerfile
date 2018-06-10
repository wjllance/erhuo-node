FROM node:8.3.0-alpine

COPY . /home/node

WORKDIR /home/node

EXPOSE 3500

CMD npm start