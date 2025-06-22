# Docker Swarm Hands-On Guide

## Prerequisites

Before starting, ensure you have:
- Docker installed on all machines (version 1.12 or later)
- At least 2-3 machines (can be VMs, cloud instances, or physical servers)
- Network connectivity between all machines
- Administrative/sudo access on all machines

## Lab Setup

For this tutorial, we'll assume you have 3 machines:
- **manager1**: 192.168.1.10 (Swarm Manager)
- **worker1**: 192.168.1.11 (Worker Node)
- **worker2**: 192.168.1.12 (Worker Node)

Replace these IPs with your actual machine IPs.

## Step 1: Initialize Docker Swarm

### 1.1 Create the Swarm Manager

On your manager node (manager1):

```bash
# Initialize Docker Swarm
docker swarm init --advertise-addr 192.168.1.10

# You'll see output similar to:
# Swarm initialized: current node (xyz123) is now a manager.
# To add a worker to this swarm, run the following command:
# docker swarm join --token SWMTKN-1-abcdef... 192.168.1.10:2377
```

**Important**: Save the join token that appears in the output. You'll need it to add worker nodes.

### 1.2 Verify Swarm Status

```bash
# Check swarm status
docker info | grep -A 10 "Swarm:"

# List nodes in the swarm
docker node ls
```

## Step 2: Add Worker Nodes

### 2.1 Join Workers to the Swarm

On each worker node (worker1 and worker2), run the join command from Step 1.1:

```bash
# On worker1 and worker2
docker swarm join --token SWMTKN-1-your-token-here 192.168.1.10:2377
```

### 2.2 Verify All Nodes

Back on the manager node:

```bash
# List all nodes
docker node ls

# You should see something like:
# ID                    HOSTNAME   STATUS  AVAILABILITY  MANAGER STATUS
# abc123 *              manager1   Ready   Active        Leader
# def456                worker1    Ready   Active        
# ghi789                worker2    Ready   Active
```

## Step 3: Deploy Your First Service

### 3.1 Create a Simple Web Service

```bash
# Create a simple nginx service with 3 replicas
docker service create \
  --name web-server \
  --replicas 3 \
  --publish 8080:80 \
  nginx:alpine

# Check service status
docker service ls

# See which nodes are running the service
docker service ps web-server
```

### 3.2 Test the Service

```bash
# Test from any node
curl http://192.168.1.10:8080
curl http://192.168.1.11:8080
curl http://192.168.1.12:8080

# All should return the nginx welcome page
```

## Step 4: Scaling Services

### 4.1 Scale Up the Service

```bash
# Scale to 5 replicas
docker service scale web-server=5

# Check the scaling
docker service ps web-server

# You should see 5 running containers distributed across nodes
```

### 4.2 Scale Down the Service

```bash
# Scale back to 2 replicas
docker service scale web-server=2

# Verify scaling
docker service ps web-server
```

## Step 5: Service Updates and Rolling Updates

### 5.1 Update the Service Image

```bash
# Update nginx version with zero-downtime rolling update
docker service update \
  --image nginx:latest \
  web-server

# Monitor the update process
docker service ps web-server

# Check update status
docker service inspect web-server --pretty
```

### 5.2 Rollback a Service

```bash
# Rollback to previous version
docker service rollback web-server

# Verify rollback
docker service ps web-server
```

## Step 6: Working with Networks

### 6.1 Create an Overlay Network

```bash
# Create a custom overlay network
docker network create \
  --driver overlay \
  --subnet 10.0.0.0/24 \
  my-network

# List networks
docker network ls
```

### 6.2 Deploy Service on Custom Network

```bash
# Create a service on the custom network
docker service create \
  --name app-server \
  --network my-network \
  --replicas 2 \
  httpd:alpine

# Verify network connectivity
docker service ps app-server
```

## Step 7: Service Discovery and Load Balancing

### 7.1 Create Multiple Services

```bash
# Create a backend service
docker service create \
  --name backend \
  --network my-network \
  --replicas 3 \
  nginx:alpine

# Create a frontend service that can communicate with backend
docker service create \
  --name frontend \
  --network my-network \
  --publish 8081:80 \
  --replicas 2 \
  nginx:alpine
```

### 7.2 Test Service Discovery

```bash
# Enter a running container to test internal communication
docker exec -it $(docker ps -q --filter "label=com.docker.swarm.service.name=frontend" | head -1) sh

# Inside the container, test service discovery
# nslookup backend
# ping backend
# exit
```

## Step 8: Managing Secrets

### 8.1 Create a Secret

```bash
# Create a secret from command line
echo "my-secret-password" | docker secret create db-password -

# Create a secret from file
echo "database-config-data" > db-config.txt
docker secret create db-config db-config.txt

# List secrets
docker secret ls
```

### 8.2 Use Secrets in Services

```bash
# Create a service that uses secrets
docker service create \
  --name db-service \
  --secret db-password \
  --secret db-config \
  alpine:latest \
  sleep 3600

# Verify secrets are mounted
docker service ps db-service
```

## Step 9: Health Checks and Constraints

### 9.1 Service with Health Check

```bash
# Create service with health check
docker service create \
  --name web-with-health \
  --replicas 2 \
  --publish 8082:80 \
  --health-cmd "curl -f http://localhost/ || exit 1" \
  --health-interval 30s \
  --health-retries 3 \
  --health-timeout 10s \
  nginx:alpine
```

### 9.2 Add Node Constraints

```bash
# Label a node
docker node update --label-add environment=production worker1

# Create service with placement constraint
docker service create \
  --name prod-service \
  --constraint 'node.labels.environment==production' \
  --replicas 1 \
  nginx:alpine

# Verify placement
docker service ps prod-service
```

## Step 10: Monitoring and Troubleshooting

### 10.1 Service Logs

```bash
# View service logs
docker service logs web-server

# Follow logs in real-time
docker service logs -f web-server

# View logs for specific task
docker service logs web-server.1
```

### 10.2 Inspect Services and Nodes

```bash
# Detailed service information
docker service inspect web-server --pretty

# Node information
docker node inspect manager1 --pretty

# System-wide information
docker system df
docker system events
```

## Step 11: Backup and Restore

### 11.1 Backup Swarm State

```bash
# On manager node, backup swarm certificates and configuration
sudo tar -czf swarm-backup.tar.gz -C /var/lib/docker/swarm .

# Store this backup securely
```

### 11.2 Node Maintenance

```bash
# Drain a node for maintenance
docker node update --availability drain worker1

# Verify services moved to other nodes
docker service ps web-server

# Return node to active state
docker node update --availability active worker1
```

## Step 12: Stack Deployment with Docker Compose

### 12.1 Create a Stack File

Create a file named `docker-stack.yml`:

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8083:80"
    networks:
      - webnet
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      placement:
        constraints: [node.role == worker]

  redis:
    image: redis:alpine
    networks:
      - webnet
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

networks:
  webnet:
    driver: overlay
```

### 12.2 Deploy the Stack

```bash
# Deploy the stack
docker stack deploy -c docker-stack.yml my-app

# List stacks
docker stack ls

# List services in the stack
docker stack services my-app

# List tasks in the stack
docker stack ps my-app
```

## Step 13: Clean Up

### 13.1 Remove Services and Stacks

```bash
# Remove individual services
docker service rm web-server backend frontend

# Remove stack
docker stack rm my-app

# Remove secrets
docker secret rm db-password db-config

# Remove networks
docker network rm my-network
```

### 13.2 Leave the Swarm

```bash
# On worker nodes
docker swarm leave

# On manager node (force if it's the last manager)
docker swarm leave --force
```

## Common Commands Reference

### Service Management
```bash
# Create service
docker service create [OPTIONS] IMAGE [COMMAND] [ARG...]

# List services
docker service ls

# Scale service
docker service scale SERVICE=REPLICAS

# Update service
docker service update [OPTIONS] SERVICE

# Remove service
docker service rm SERVICE

# View service logs
docker service logs SERVICE
```

### Node Management
```bash
# List nodes
docker node ls

# Inspect node
docker node inspect NODE

# Update node
docker node update [OPTIONS] NODE

# Remove node
docker node rm NODE
```

### Stack Management
```bash
# Deploy stack
docker stack deploy -c COMPOSE_FILE STACK_NAME

# List stacks
docker stack ls

# Remove stack
docker stack rm STACK_NAME

# View stack services
docker stack services STACK_NAME
```

## Troubleshooting Tips

1. **Services not starting**: Check `docker service ps SERVICE_NAME` for error messages
2. **Network connectivity issues**: Verify overlay networks and firewall rules
3. **Port conflicts**: Ensure published ports are not already in use
4. **Resource constraints**: Check available CPU/memory on nodes
5. **Docker daemon issues**: Restart Docker service if nodes become unresponsive

## Security Best Practices

1. Use TLS certificates for production swarms
2. Rotate join tokens regularly
3. Use secrets for sensitive data
4. Implement proper network segmentation
5. Keep Docker versions updated across all nodes
6. Monitor and audit swarm activities

This hands-on guide covers the essential aspects of Docker Swarm. Practice these steps in a test environment before implementing in production!