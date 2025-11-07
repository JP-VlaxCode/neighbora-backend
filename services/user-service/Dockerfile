# User service Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install

COPY . .
RUN npm run build

EXPOSE 4001
CMD ["npm","run","start"]
