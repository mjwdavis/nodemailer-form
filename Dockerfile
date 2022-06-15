FROM node:18-alpine3.15

WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
CMD [ "npm", "run", "start" ]