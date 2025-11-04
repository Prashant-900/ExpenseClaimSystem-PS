# -------------------------
# Stage 1: Build the frontend
# -------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Copy only frontend files
COPY package*.json ./
RUN npm install

COPY . .

# Build the project (Vite/React)
RUN npm run build

# -------------------------
# Stage 2: Serve with Nginx
# -------------------------
FROM nginx:alpine

# Copy build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for public access
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
