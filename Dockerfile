FROM node:20.16.0-alpine
WORKDIR /urs/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

ARG PORT=4000
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "dist/main"]