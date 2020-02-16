FROM node:12.2.0-alpine as api
WORKDIR /app
COPY . ./
RUN yarn
CMD [ "yarn", "prod" ]