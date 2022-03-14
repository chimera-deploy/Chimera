FROM node:14 as build
MAINTAINER Wes Anderson

WORKDIR /usr/app/movieui
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /usr/app/movieui/build /usr/share/nginx/html
CMD ["sh", "-c", "cd /usr/share/nginx/html/ && nginx -g 'daemon off;'"]
