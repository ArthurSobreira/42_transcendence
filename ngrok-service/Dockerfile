FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN apk add --no-cache curl
RUN npm run build --if-present


CMD [ "npm", "start" ]
