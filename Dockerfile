# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy optimized files
COPY --from=builder /app/game.min.js /usr/share/nginx/html/game.js
COPY --from=builder /app/style.min.css /usr/share/nginx/html/style.css
COPY index.html /usr/share/nginx/html/

# Add nginx configuration for caching and compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 