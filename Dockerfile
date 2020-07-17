FROM node:alpine

WORKDIR /app

EXPOSE 27017

COPY ./package.json .

RUN npm install

COPY . .

CMD [ "npm", "run", "start" ]
