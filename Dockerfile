FROM node:21-bullseye-slim
RUN apt-get update && apt-get install -y openssl
WORKDIR /var/www/vhost/
ADD . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000