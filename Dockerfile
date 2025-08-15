FROM node:24.3.0-alpine3.21 AS builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build


FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf


COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf


COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]