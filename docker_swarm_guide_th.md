# คู่มือปฏิบัติการ Docker Swarm แบบ Step-by-Step

## ข้อกำหนดเบื้องต้น

ก่อนเริ่มต้น ให้แน่ใจว่าคุณมี:
- Docker ติดตั้งในเครื่องทุกเครื่อง (เวอร์ชัน 1.12 ขึ้นไป)
- เครื่อง 2-3 เครื่องขึ้นไป (อาจเป็น VM, cloud instances, หรือเซิร์ฟเวอร์จริง)
- การเชื่อมต่อเครือข่ายระหว่างเครื่องทั้งหมด
- สิทธิ์ Administrator/sudo ในเครื่องทุกเครื่อง

## การตั้งค่า Lab

สำหรับบทเรียนนี้ เราจะสมมติว่าคุณมีเครื่อง 3 เครื่อง:
- **manager1**: 192.168.1.10 (Swarm Manager)
- **worker1**: 192.168.1.11 (Worker Node)
- **worker2**: 192.168.1.12 (Worker Node)

แทนที่ IP เหล่านี้ด้วย IP จริงของเครื่องคุณ

## ขั้นตอนที่ 1: เริ่มต้น Docker Swarm

### 1.1 สร้าง Swarm Manager

บนโหนด manager ของคุณ (manager1):

```bash
# เริ่มต้น Docker Swarm
docker swarm init --advertise-addr 192.168.1.10

# คุณจะเห็นผลลัพธ์คล้ายกับ:
# Swarm initialized: current node (xyz123) is now a manager.
# To add a worker to this swarm, run the following command:
# docker swarm join --token SWMTKN-1-abcdef... 192.168.1.10:2377
```

**สำคัญ**: เก็บ join token ที่ปรากฏในผลลัพธ์ไว้ คุณจะต้องใช้เพื่อเพิ่ม worker nodes

### 1.2 ตรวจสอบสถานะ Swarm

```bash
# ตรวจสอบสถานะ swarm
docker info | grep -A 10 "Swarm:"

# แสดงรายการโหนดใน swarm
docker node ls
```

## ขั้นตอนที่ 2: เพิ่ม Worker Nodes

### 2.1 เพิ่ม Workers เข้าไปใน Swarm

บนแต่ละ worker node (worker1 และ worker2) รันคำสั่ง join จากขั้นตอนที่ 1.1:

```bash
# บน worker1 และ worker2
docker swarm join --token SWMTKN-1-your-token-here 192.168.1.10:2377
```

### 2.2 ตรวจสอบโหนดทั้งหมด

กลับไปที่ manager node:

```bash
# แสดงรายการโหนดทั้งหมด
docker node ls

# คุณควรเห็นผลลัพธ์คล้ายกับ:
# ID                    HOSTNAME   STATUS  AVAILABILITY  MANAGER STATUS
# abc123 *              manager1   Ready   Active        Leader
# def456                worker1    Ready   Active        
# ghi789                worker2    Ready   Active
```

## ขั้นตอนที่ 3: Deploy Service แรกของคุณ

### 3.1 สร้าง Web Service อย่างง่าย

```bash
# สร้าง nginx service อย่างง่ายโดยมี 3 replicas
docker service create \
  --name web-server \
  --replicas 3 \
  --publish 8080:80 \
  nginx:alpine

# ตรวจสอบสถานะ service
docker service ls

# ดูว่าโหนดไหนกำลังรัน service นี้
docker service ps web-server
```

### 3.2 ทดสอบ Service

```bash
# ทดสอบจากโหนดไหนก็ได้
curl http://192.168.1.10:8080
curl http://192.168.1.11:8080
curl http://192.168.1.12:8080

# ทั้งหมดควรส่งคืนหน้า nginx welcome page
```

## ขั้นตอนที่ 4: การ Scale Services

### 4.1 Scale Up Service

```bash
# Scale เป็น 5 replicas
docker service scale web-server=5

# ตรวจสอบการ scaling
docker service ps web-server

# คุณควรเห็น container 5 ตัวกระจายไปตามโหนดต่างๆ
```

### 4.2 Scale Down Service

```bash
# Scale กลับเป็น 2 replicas
docker service scale web-server=2

# ตรวจสอบการ scaling
docker service ps web-server
```

## ขั้นตอนที่ 5: การอัปเดต Service และ Rolling Updates

### 5.1 อัปเดต Service Image

```bash
# อัปเดต nginx version โดยไม่มี downtime
docker service update \
  --image nginx:latest \
  web-server

# ติดตามกระบวนการอัปเดต
docker service ps web-server

# ตรวจสอบสถานะการอัปเดต
docker service inspect web-server --pretty
```

### 5.2 Rollback Service

```bash
# Rollback ไปเวอร์ชันก่อนหน้า
docker service rollback web-server

# ตรวจสอบการ rollback
docker service ps web-server
```

## ขั้นตอนที่ 6: การทำงานกับ Networks

### 6.1 สร้าง Overlay Network

```bash
# สร้าง custom overlay network
docker network create \
  --driver overlay \
  --subnet 10.0.0.0/24 \
  my-network

# แสดงรายการ networks
docker network ls
```

### 6.2 Deploy Service บน Custom Network

```bash
# สร้าง service บน custom network
docker service create \
  --name app-server \
  --network my-network \
  --replicas 2 \
  httpd:alpine

# ตรวจสอบการเชื่อมต่อ network
docker service ps app-server
```

## ขั้นตอนที่ 7: Service Discovery และ Load Balancing

### 7.1 สร้าง Services หลายตัว

```bash
# สร้าง backend service
docker service create \
  --name backend \
  --network my-network \
  --replicas 3 \
  nginx:alpine

# สร้าง frontend service ที่สามารถสื่อสารกับ backend ได้
docker service create \
  --name frontend \
  --network my-network \
  --publish 8081:80 \
  --replicas 2 \
  nginx:alpine
```

### 7.2 ทดสอบ Service Discovery

```bash
# เข้าไปใน container ที่กำลังรันเพื่อทดสอบการสื่อสารภายใน
docker exec -it $(docker ps -q --filter "label=com.docker.swarm.service.name=frontend" | head -1) sh

# ในcontainer ทดสอบ service discovery
# nslookup backend
# ping backend
# exit
```

## ขั้นตอนที่ 8: การจัดการ Secrets

### 8.1 สร้าง Secret

```bash
# สร้าง secret จาก command line
echo "my-secret-password" | docker secret create db-password -

# สร้าง secret จากไฟล์
echo "database-config-data" > db-config.txt
docker secret create db-config db-config.txt

# แสดงรายการ secrets
docker secret ls
```

### 8.2 ใช้ Secrets ใน Services

```bash
# สร้าง service ที่ใช้ secrets
docker service create \
  --name db-service \
  --secret db-password \
  --secret db-config \
  alpine:latest \
  sleep 3600

# ตรวจสอบว่า secrets ถูก mount แล้ว
docker service ps db-service
```

## ขั้นตอนที่ 9: Health Checks และ Constraints

### 9.1 Service พร้อม Health Check

```bash
# สร้าง service พร้อม health check
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

### 9.2 เพิ่ม Node Constraints

```bash
# ติด label ให้กับ node
docker node update --label-add environment=production worker1

# สร้าง service พร้อม placement constraint
docker service create \
  --name prod-service \
  --constraint 'node.labels.environment==production' \
  --replicas 1 \
  nginx:alpine

# ตรวจสอบการวางตำแหน่ง
docker service ps prod-service
```

## ขั้นตอนที่ 10: การติดตามและการแก้ปัญหา

### 10.1 Service Logs

```bash
# ดู service logs
docker service logs web-server

# ติดตาม logs แบบ real-time
docker service logs -f web-server

# ดู logs สำหรับ task เฉพาะ
docker service logs web-server.1
```

### 10.2 ตรวจสอบ Services และ Nodes

```bash
# ข้อมูลละเอียดของ service
docker service inspect web-server --pretty

# ข้อมูล node
docker node inspect manager1 --pretty

# ข้อมูลระดับระบบ
docker system df
docker system events
```

## ขั้นตอนที่ 11: การ Backup และ Restore

### 11.1 Backup สถานะ Swarm

```bash
# บน manager node ทำการ backup certificates และ configuration ของ swarm
sudo tar -czf swarm-backup.tar.gz -C /var/lib/docker/swarm .

# เก็บ backup นี้ไว้ในที่ปลอดภัย
```

### 11.2 การบำรุงรักษา Node

```bash
# Drain node เพื่อบำรุงรักษา
docker node update --availability drain worker1

# ตรวจสอบว่า services ย้ายไปโหนดอื่นแล้ว
docker service ps web-server

# คืนสถานะ node กลับเป็น active
docker node update --availability active worker1
```

## ขั้นตอนที่ 12: การ Deploy Stack ด้วย Docker Compose

### 12.1 สร้างไฟล์ Stack

สร้างไฟล์ชื่อ `docker-stack.yml`:

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

### 12.2 Deploy Stack

```bash
# Deploy stack
docker stack deploy -c docker-stack.yml my-app

# แสดงรายการ stacks
docker stack ls

# แสดงรายการ services ใน stack
docker stack services my-app

# แสดงรายการ tasks ใน stack
docker stack ps my-app
```

## ขั้นตอนที่ 13: การล้างข้อมูล

### 13.1 ลบ Services และ Stacks

```bash
# ลบ services แต่ละตัว
docker service rm web-server backend frontend

# ลบ stack
docker stack rm my-app

# ลบ secrets
docker secret rm db-password db-config

# ลบ networks
docker network rm my-network
```

### 13.2 ออกจาก Swarm

```bash
# บน worker nodes
docker swarm leave

# บน manager node (บังคับถ้าเป็น manager สุดท้าย)
docker swarm leave --force
```

## อ้างอิงคำสั่งที่ใช้บ่อย

### การจัดการ Service
```bash
# สร้าง service
docker service create [OPTIONS] IMAGE [COMMAND] [ARG...]

# แสดงรายการ services
docker service ls

# Scale service
docker service scale SERVICE=REPLICAS

# อัปเดต service
docker service update [OPTIONS] SERVICE

# ลบ service
docker service rm SERVICE

# ดู service logs
docker service logs SERVICE
```

### การจัดการ Node
```bash
# แสดงรายการ nodes
docker node ls

# ตรวจสอบ node
docker node inspect NODE

# อัปเดต node
docker node update [OPTIONS] NODE

# ลบ node
docker node rm NODE
```

### การจัดการ Stack
```bash
# Deploy stack
docker stack deploy -c COMPOSE_FILE STACK_NAME

# แสดงรายการ stacks
docker stack ls

# ลบ stack
docker stack rm STACK_NAME

# ดู stack services
docker stack services STACK_NAME
```

## เคล็ดลับการแก้ปัญหา

1. **Services ไม่เริ่มต้น**: ตรวจสอบ `docker service ps SERVICE_NAME` เพื่อดูข้อความ error
2. **ปัญหาการเชื่อมต่อเครือข่าย**: ตรวจสอบ overlay networks และ firewall rules
3. **Port conflicts**: ตรวจสอบว่า published ports ไม่ได้ถูกใช้งานอยู่แล้ว
4. **Resource constraints**: ตรวจสอบ CPU/memory ที่มีอยู่ในโหนด
5. **ปัญหา Docker daemon**: รีสตาร์ท Docker service หากโหนดไม่ตอบสนอง

## แนวทางปฏิบัติด้านความปลอดภัย

1. ใช้ TLS certificates สำหรับ production swarms
2. หมุนเวียน join tokens เป็นประจำ
3. ใช้ secrets สำหรับข้อมูลที่ละเอียดอ่อน
4. ใช้การแบ่งส่วนเครือข่ายที่เหมาะสม
5. อัปเดต Docker versions ในโหนดทั้งหมดให้เป็นปัจจุบัน
6. ติดตามและตรวจสอบกิจกรรมของ swarm

คู่มือปฏิบัติการนี้ครอบคลุมแง่มุมสำคัญของ Docker Swarm ฝึกปฏิบัติขั้นตอนเหล่านี้ในสภาพแวดล้อมทดสอบก่อนนำไปใช้ใน production!