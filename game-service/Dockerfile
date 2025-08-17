FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --registry https://registry.npmjs.org/ --no-optional
RUN apk add --no-cache curl
COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:24-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/entrypoint.sh ./

COPY --from=build /usr/src/app/prisma ./prisma
RUN apk add --no-cache curl
ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "dev"]

