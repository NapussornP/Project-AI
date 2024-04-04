FROM node:18-alpine
# ENV NODE_EVN=production

WORKDIR /admin/server

# COPY ["package.json", "package-lock.json*", "./"]
COPY package*.json ./ 

RUN npm install

COPY . .

EXPOSE 8081

CMD [ "npm", "start" ]