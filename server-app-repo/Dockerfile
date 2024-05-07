FROM node:18-alpine

ENV MONGODB_URI=mongodb://localhost:27017/

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
