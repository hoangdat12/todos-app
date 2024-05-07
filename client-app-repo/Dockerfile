# Fetching the latest node image on alpine linux
FROM node:18-alpine AS development

# Declaring env
ENV REACT_APP_SERVER_URL=http://localhost:5000

# Setting up the work directory
WORKDIR /react-app

# Installing dependencies
COPY ./package*.json /react-app

RUN npm install

# Copying all the files in our project
COPY . .

EXPOSE 3000

# Starting our application
CMD ["npm","start"]