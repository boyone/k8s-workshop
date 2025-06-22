# -------------- The build image --------------
FROM node:22.16-alpine3.22 AS build
RUN apk add --no-cache dumb-init
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm ci --only=production

# -------------- The production image --------------
FROM node:22.16-alpine3.22

ENV NODE_ENV=production
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node . /usr/src/app
CMD ["dumb-init", "node", "index.js"]