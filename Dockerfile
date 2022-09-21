FROM node:16

COPY ./ /app
WORKDIR /app
RUN yarn install
RUN npm install -g

ENTRYPOINT [ "firestore-poker" ]