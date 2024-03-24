FROM node:18.15.0
ENV NODE_EVN=production

WORKDIR /admin/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

EXPOSE 8081

CMD [ "npm", "start" ]