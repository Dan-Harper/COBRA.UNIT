FROM node:22.9.0-bullseye
RUN mkdir /app
COPY . /app/
WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "run", "start-dev"]
