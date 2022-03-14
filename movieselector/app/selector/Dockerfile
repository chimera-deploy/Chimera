FROM node:14
MAINTAINER Wes Anderson

WORKDIR /selector
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
