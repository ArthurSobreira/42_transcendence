FROM node:20-alpine AS build-stage
WORKDIR /app

ARG GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY frontend/package.json frontend/yarn.lock* frontend/package-lock.json* ./
RUN npm install

COPY frontend/. .
RUN npm run build

FROM nginx:1.27-alpine
RUN rm /etc/nginx/conf.d/default.conf

COPY devops/nginx/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443