FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
RUN npm install

RUN npm install express dotenv

COPY . .
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]
