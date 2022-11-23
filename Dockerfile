FROM node:16-alpine

ARG NODE_AUTH_TOKEN

WORKDIR /usr/src/app

COPY .npmrc .npmrc
COPY package.json package.json

RUN npm install

COPY . .

RUN npm install typescript
RUN npm run build

RUN rm -f .npmrc

CMD ["npm", "start"]