FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package.json
COPY index.html index.html
COPY vite.config.js vite.config.js
COPY src src
RUN npm install && npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
