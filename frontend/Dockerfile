FROM node:16-alpine

RUN mkdir -p /home/chimera/frontend

WORKDIR /home/chimera/frontend
COPY package.json /home/chimera/frontend
RUN npm install

COPY . /home/chimera/frontend

CMD ["npm", "start"]
