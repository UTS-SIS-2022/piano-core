FROM node:16-alpine

WORKDIR /usr/src/app

COPY package.json package.json

RUN --mount=type=secret,id=MONGO_CONNECTION_URI \
    export MONGO_CONNECTION_URI=$(cat /run/secrets/MONGO_CONNECTION_URI) 

RUN npm install

COPY . ./

RUN npm install typescript

RUN rm -f .npmrc

CMD ["npm", "start"]