FROM node:18-alpine

RUN apk add --no-cache curl python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma 

RUN npm install

RUN npx prisma generate

COPY . .

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "dev"]