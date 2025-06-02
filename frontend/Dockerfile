FROM node:24-alpine

# Update Alpine packages to latest security patches
RUN apk update && apk upgrade --no-cache

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"] 