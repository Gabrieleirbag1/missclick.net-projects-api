FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p src/public/uploads

WORKDIR /app/src

EXPOSE 3100

CMD ["node", "server.js"]