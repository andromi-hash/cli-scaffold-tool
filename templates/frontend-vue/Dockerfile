FROM node:20-alpine AS b
WORKDIR /a
COPY package.json .
RUN npm i
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=b /a/dist /usr/share/nginx/html
