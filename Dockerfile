FROM node:22.9.0-bullseye AS base
#FROM node:18.20.4-bookworm
ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV
RUN apt-get update && apt-get install -y net-tools vim ripgrep python3-pip
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
COPY app/betaFilter/requirements.txt ./reqs-beta.txt 
RUN pip install -r reqs-beta.txt
RUN npm install --include=dev
COPY . .


FROM base as builder
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app
FROM base AS builder
RUN cp env.$NODE_ENV .env || true
RUN npm run build
CMD ["npm", "run", "start-dev"]
