FROM node:22.9.0-bullseye
#FROM node:18.20.4-bookworm
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
RUN apt-get update && apt-get install -y net-tools
RUN mkdir /app
COPY . /app/
WORKDIR /app
RUN npm install --include=dev
RUN cp env.$NODE_ENV .env
RUN npm run build
CMD ["npm", "run", "start-dev"]
