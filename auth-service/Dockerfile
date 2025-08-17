FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
RUN apk add --no-cache openssl

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:24-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache curl
RUN apk add --no-cache openssl

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./

COPY --from=build /usr/src/app/prisma ./prisma

CMD [ "npm", "start" ]