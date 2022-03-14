FROM node:14
MAINTAINER Wes Anderson

WORKDIR /server
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
