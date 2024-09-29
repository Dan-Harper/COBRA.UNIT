FROM node:22.9.0-bullseye
ARG REACT_APP_BACKEND_API
ENV REACT_APP_BACKEND_API=$REACT_APP_BACKEND_API
RUN apt-get update && apt-get install -y net-tools
RUN mkdir /app
COPY . /app/
WORKDIR /app
RUN npm install
RUN npm run build
CMD ["npm", "run", "start-dev"]
