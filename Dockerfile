FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p src/public/uploads

EXPOSE 3000

CMD ["node", "src/server.js"]