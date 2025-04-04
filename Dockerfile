# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY . .

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine

# Create necessary directories with proper permissions
RUN mkdir -p /usr/share/nginx/html/images && \
    chown -R nginx:nginx /usr/share/nginx/html

# Copy files
COPY --from=builder /app/game.js /usr/share/nginx/html/
COPY --from=builder /app/style.css /usr/share/nginx/html/
COPY index.html /usr/share/nginx/html/
COPY --from=builder /app/images/landscape.png /usr/share/nginx/html/images/
COPY --from=builder /app/images/portrait.png /usr/share/nginx/html/images/

# Add nginx configuration for caching and compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 