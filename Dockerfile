FROM node:22.9.0-bullseye
RUN apt-get update && apt-get install -y net-tools
RUN mkdir /app
COPY . /app/
WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "run", "start-dev"]
