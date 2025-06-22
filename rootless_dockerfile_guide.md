# Hands-On: Rootless Dockerfile Guide

## Why Rootless Containers Matter

Running containers as root poses security risks. If an attacker escapes the container, they have root privileges on the host system. Rootless containers limit this attack surface by running processes with non-privileged users.

## Basic Rootless Dockerfile Pattern

### Example 1: Simple Node.js Application

```dockerfile
FROM node:18-alpine

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies as root (needed for npm install)
RUN npm ci --only=production

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
```

### Example 2: Python Flask Application

```dockerfile
FROM python:3.11-slim

# Create non-root user
RUN groupadd -r flaskuser && useradd -r -g flaskuser flaskuser

# Create app directory
WORKDIR /app

# Install system dependencies as root
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R flaskuser:flaskuser /app

# Switch to non-root user
USER flaskuser

# Expose port
EXPOSE 8000

# Run application
CMD ["python", "app.py"]
```

## Advanced Rootless Patterns

### Example 3: Multi-stage Build with Rootless

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /src

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Production stage
FROM alpine:3.18

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Create app directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /src/app .

# Change ownership
RUN chown appuser:appgroup /app/app

# Switch to non-root user
USER appuser

EXPOSE 8080

CMD ["./app"]
```

### Example 4: Nginx with Rootless Configuration

```dockerfile
FROM nginx:alpine

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Copy custom nginx config for non-root
COPY nginx.conf /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx

# Use non-privileged port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**Corresponding nginx.conf for rootless:**

```nginx
events {
    worker_connections 1024;
}

http {
    # Run on non-privileged port
    server {
        listen 8080;
        
        # Use /tmp for temporary files (writable by non-root)
        client_body_temp_path /tmp/client_temp;
        proxy_temp_path /tmp/proxy_temp;
        fastcgi_temp_path /tmp/fastcgi_temp;
        uwsgi_temp_path /tmp/uwsgi_temp;
        scgi_temp_path /tmp/scgi_temp;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
```

## Best Practices for Rootless Dockerfiles

### 1. User Creation Methods

**Alpine Linux:**
```dockerfile
RUN addgroup -g 1001 -S mygroup && \
    adduser -S myuser -u 1001 -G mygroup
```

**Debian/Ubuntu:**
```dockerfile
RUN groupadd -r mygroup && useradd -r -g mygroup myuser
```

**Using existing user:**
```dockerfile
USER nobody
```

### 2. File Permissions

```dockerfile
# Method 1: Change ownership after copying
COPY . .
RUN chown -R myuser:mygroup /app

# Method 2: Copy with ownership (Docker 17.09+)
COPY --chown=myuser:mygroup . .
```

### 3. Directory Permissions

```dockerfile
# Create directories with proper permissions
RUN mkdir -p /app/data /app/logs && \
    chown -R myuser:mygroup /app && \
    chmod -R 755 /app
```

## Hands-On Exercise

### Exercise 1: Convert a Root Container

Take this root-running Dockerfile:

```dockerfile
FROM ubuntu:20.04

WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python3", "app.py"]
```

**Your task:** Convert it to run rootless.

**Solution:**

```dockerfile
FROM ubuntu:20.04

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install packages as root
RUN apt-get update && apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 5000

CMD ["python3", "app.py"]
```

### Exercise 2: Database Container

Create a rootless PostgreSQL-like setup:

```dockerfile
FROM postgres:15-alpine

# Create non-root user for database
RUN addgroup -g 999 -S postgres && \
    adduser -S postgres -u 999 -G postgres

# Create data directory
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    chmod 700 /var/lib/postgresql/data

# Switch to postgres user
USER postgres

# Initialize database would go here
# COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 5432

CMD ["postgres"]
```

## Common Pitfalls and Solutions

### 1. Port Binding Issues

**Problem:** Non-root users can't bind to ports < 1024

**Solution:**
```dockerfile
# Use ports >= 1024
EXPOSE 8080  # Instead of 80
EXPOSE 8443  # Instead of 443
```

### 2. File System Permissions

**Problem:** Application can't write to certain directories

**Solution:**
```dockerfile
# Create writable directories
RUN mkdir -p /app/uploads /app/logs && \
    chown -R myuser:mygroup /app/uploads /app/logs && \
    chmod 755 /app/uploads /app/logs
```

### 3. Package Installation

**Problem:** Need root for package installation but want to run as non-root

**Solution:**
```dockerfile
# Install packages as root first
RUN apt-get update && apt-get install -y package-name

# Then switch to non-root user
USER myuser
```

## Testing Your Rootless Container

### Build and Test Commands

```bash
# Build the container
docker build -t myapp-rootless .

# Test that it's running as non-root
docker run --rm myapp-rootless whoami

# Check the user ID
docker run --rm myapp-rootless id

# Run with security options
docker run --rm --security-opt=no-new-privileges myapp-rootless

# Test with read-only filesystem
docker run --rm --read-only myapp-rootless
```

### Security Verification

```bash
# Check for root processes
docker exec <container-id> ps aux

# Verify user context
docker exec <container-id> whoami

# Check file permissions
docker exec <container-id> ls -la /app
```

## Dockerfile Security Checklist

- [ ] Created non-root user
- [ ] Switched to non-root user with `USER`
- [ ] Used non-privileged ports (>1024)
- [ ] Set proper file ownership with `chown`
- [ ] Removed unnecessary packages and files
- [ ] Used `--no-cache` for package managers
- [ ] Specified exact versions for base images
- [ ] Avoided running services as root
- [ ] Used `COPY` instead of `ADD` when possible
- [ ] Set proper directory permissions

## Production Considerations

### Resource Limits

```dockerfile
# Document expected resource usage
LABEL resources.memory="512MB"
LABEL resources.cpu="0.5"
```

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
```

### Multi-architecture Support

```dockerfile
# Use multi-arch base images
FROM --platform=$BUILDPLATFORM node:18-alpine
```

This hands-on guide provides practical examples for creating secure, rootless Docker containers. Start with the basic patterns and gradually incorporate the advanced techniques as you become more comfortable with rootless container practices.