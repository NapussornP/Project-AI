# FROM node:18.15.0

# WORKDIR /admin/frontend

# COPY package*.json ./ 

# RUN  npm install

# COPY . .

# RUN npm run build

# CMD [ "npm", "run", "dev" ]

# CMD ["npx", "serve", "dist"]

FROM nginx
COPY build /usr/share/nginx/html

# FROM nginx

# # Copy the built React app to Nginx's web server directory
# COPY --from=build /app/build /usr/share/nginx/html

# # Expose port 80 for the Nginx server

# # Start Nginx when the container runs
# CMD ["nginx", "-g", "daemon off;"]