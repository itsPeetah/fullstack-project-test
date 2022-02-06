FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn

# Bundle app source
COPY . .

# COPY THE PRODUCTION ENV TO .ENV, THE (e.g Dokku) VPS IS GOING TO WRITE THE THE OTHER ENV VARS
COPY .env.production .env

RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node