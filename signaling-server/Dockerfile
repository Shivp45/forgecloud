FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY server.js .
COPY .env* ./

EXPOSE 8091

CMD ["npm", "start"]
