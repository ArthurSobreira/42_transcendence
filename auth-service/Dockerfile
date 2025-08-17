FROM node:20 AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=build /usr/src/app/prisma/migrations ./prisma/migrations

# COPY --from=build /usr/src/app/prisma ./prisma

CMD [ "npm", "start" ]