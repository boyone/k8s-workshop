# คู่มือปฏิบัติ: Dockerfile แบบ Rootless

## ทำไม Container แบบ Rootless ถึงสำคัญ

การรัน container ด้วยสิทธิ์ root ทำให้เกิดความเสี่ยงด้านความปลอดภัย หากผู้โจมตีสามารถหลุดออกจาก container ได้ พวกเขาจะมีสิทธิ์ root บนระบบโฮสต์ Container แบบ rootless จะช่วยลดพื้นผิวการโจมตีโดยการรันโปรเซสด้วยผู้ใช้ที่ไม่มีสิทธิ์พิเศษ

## รูปแบบ Dockerfile Rootless พื้นฐาน

### ตัวอย่างที่ 1: แอปพลิเคชัน Node.js อย่างง่าย

```dockerfile
FROM node:18-alpine

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# กำหนด working directory
WORKDIR /app

# คัดลอกไฟล์ package
COPY package*.json ./

# ติดตั้ง dependencies ในฐานะ root (จำเป็นสำหรับ npm install)
RUN npm ci --only=production

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

# เปลี่ยนความเป็นเจ้าของให้ผู้ใช้ที่ไม่ใช่ root
RUN chown -R nextjs:nodejs /app

# สลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER nextjs

# เปิดพอร์ต
EXPOSE 3000

# เริ่มแอปพลิเคชัน
CMD ["node", "server.js"]
```

### ตัวอย่างที่ 2: แอปพลิเคชัน Python Flask

```dockerfile
FROM python:3.11-slim

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN groupadd -r flaskuser && useradd -r -g flaskuser flaskuser

# สร้าง app directory
WORKDIR /app

# ติดตั้ง system dependencies ในฐานะ root
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# คัดลอก requirements และติดตั้ง Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

# เปลี่ยนความเป็นเจ้าของให้ผู้ใช้ที่ไม่ใช่ root
RUN chown -R flaskuser:flaskuser /app

# สลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER flaskuser

# เปิดพอร์ต
EXPOSE 8000

# รันแอปพลิเคชัน
CMD ["python", "app.py"]
```

## รูปแบบ Rootless ขั้นสูง

### ตัวอย่างที่ 3: Multi-stage Build พร้อม Rootless

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /src

# คัดลอกไฟล์ go mod
COPY go.mod go.sum ./
RUN go mod download

# คัดลอกซอร์สโค้ด
COPY . .

# Build แอปพลิเคชัน
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Production stage
FROM alpine:3.18

# ติดตั้ง ca-certificates สำหรับ HTTPS
RUN apk --no-cache add ca-certificates

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# สร้าง app directory
WORKDIR /app

# คัดลอก binary จาก builder stage
COPY --from=builder /src/app .

# เปลี่ยนความเป็นเจ้าของ
RUN chown appuser:appgroup /app/app

# สลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER appuser

EXPOSE 8080

CMD ["./app"]
```

### ตัวอย่างที่ 4: Nginx พร้อมการกำหนดค่า Rootless

```dockerfile
FROM nginx:alpine

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# สร้าง directories ที่จำเป็นพร้อมสิทธิ์ที่เหมาะสม
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# คัดลอก nginx config ที่กำหนดเอง สำหรับ non-root
COPY nginx.conf /etc/nginx/nginx.conf

# สลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER nginx

# ใช้พอร์ตที่ไม่มีสิทธิ์พิเศษ
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf ที่สอดคล้องกันสำหรับ rootless:**

```nginx
events {
    worker_connections 1024;
}

http {
    # รันบนพอร์ตที่ไม่มีสิทธิ์พิเศษ
    server {
        listen 8080;
        
        # ใช้ /tmp สำหรับไฟล์ชั่วคราว (เขียนได้โดย non-root)
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

## แนวปฏิบัติที่ดีที่สุดสำหรับ Dockerfile Rootless

### 1. วิธีการสร้างผู้ใช้

**Alpine Linux:**
```dockerfile
RUN addgroup -g 1001 -S mygroup && \
    adduser -S myuser -u 1001 -G mygroup
```

**Debian/Ubuntu:**
```dockerfile
RUN groupadd -r mygroup && useradd -r -g mygroup myuser
```

**ใช้ผู้ใช้ที่มีอยู่แล้ว:**
```dockerfile
USER nobody
```

### 2. การกำหนดสิทธิ์ไฟล์

```dockerfile
# วิธีที่ 1: เปลี่ยนความเป็นเจ้าของหลังจากคัดลอก
COPY . .
RUN chown -R myuser:mygroup /app

# วิธีที่ 2: คัดลอกพร้อมความเป็นเจ้าของ (Docker 17.09+)
COPY --chown=myuser:mygroup . .
```

### 3. สิทธิ์ Directory

```dockerfile
# สร้าง directories พร้อมสิทธิ์ที่เหมาะสม
RUN mkdir -p /app/data /app/logs && \
    chown -R myuser:mygroup /app && \
    chmod -R 755 /app
```

## แบบฝึกหัดปฏิบัติ

### แบบฝึกหัดที่ 1: แปลง Root Container

ใช้ Dockerfile ที่รันด้วย root นี้:

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

**งานของคุณ:** แปลงให้รันแบบ rootless

**เฉลย:**

```dockerfile
FROM ubuntu:20.04

# สร้างผู้ใช้ที่ไม่ใช่ root
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# ติดตั้ง packages ในฐานะ root
RUN apt-get update && apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# คัดลอกและติดตั้ง requirements
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

# เปลี่ยนความเป็นเจ้าของให้ผู้ใช้ที่ไม่ใช่ root
RUN chown -R appuser:appuser /app

# สลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER appuser

EXPOSE 5000

CMD ["python3", "app.py"]
```

### แบบฝึกหัดที่ 2: Database Container

สร้างการตั้งค่าแบบ rootless เหมือน PostgreSQL:

```dockerfile
FROM postgres:15-alpine

# สร้างผู้ใช้ที่ไม่ใช่ root สำหรับฐานข้อมูล
RUN addgroup -g 999 -S postgres && \
    adduser -S postgres -u 999 -G postgres

# สร้าง data directory
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    chmod 700 /var/lib/postgresql/data

# สลับไปใช้ postgres user
USER postgres

# การ Initialize database จะอยู่ที่นี่
# COPY init-scripts/ /docker-entrypoint-initdb.d/

EXPOSE 5432

CMD ["postgres"]
```

## ข้อผิดพลาดทั่วไปและวิธีแก้ไข

### 1. ปัญหาการผูกพอร์ต

**ปัญหา:** ผู้ใช้ที่ไม่ใช่ root ไม่สามารถผูกกับพอร์ต < 1024

**วิธีแก้:**
```dockerfile
# ใช้พอร์ต >= 1024
EXPOSE 8080  # แทนที่จะเป็น 80
EXPOSE 8443  # แทนที่จะเป็น 443
```

### 2. สิทธิ์ File System

**ปัญหา:** แอปพลิเคชันไม่สามารถเขียนไปยัง directories บางตัว

**วิธีแก้:**
```dockerfile
# สร้าง directories ที่เขียนได้
RUN mkdir -p /app/uploads /app/logs && \
    chown -R myuser:mygroup /app/uploads /app/logs && \
    chmod 755 /app/uploads /app/logs
```

### 3. การติดตั้ง Package

**ปัญหา:** ต้องการ root สำหรับการติดตั้ง package แต่ต้องการรันแบบ non-root

**วิธีแก้:**
```dockerfile
# ติดตั้ง packages ในฐานะ root ก่อน
RUN apt-get update && apt-get install -y package-name

# จากนั้นสลับไปใช้ผู้ใช้ที่ไม่ใช่ root
USER myuser
```

## การทดสอบ Container Rootless ของคุณ

### คำสั่ง Build และ Test

```bash
# Build container
docker build -t myapp-rootless .

# ทดสอบว่ามันรันแบบ non-root
docker run --rm myapp-rootless whoami

# ตรวจสอบ user ID
docker run --rm myapp-rootless id

# รันด้วย security options
docker run --rm --security-opt=no-new-privileges myapp-rootless

# ทดสอบด้วย read-only filesystem
docker run --rm --read-only myapp-rootless
```

### การตรวจสอบความปลอดภัย

```bash
# ตรวจสอบ root processes
docker exec <container-id> ps aux

# ตรวจสอบ user context
docker exec <container-id> whoami

# ตรวจสอบสิทธิ์ไฟล์
docker exec <container-id> ls -la /app
```

## Dockerfile Security Checklist

- [ ] สร้างผู้ใช้ที่ไม่ใช่ root
- [ ] สลับไปใช้ผู้ใช้ที่ไม่ใช่ root ด้วย `USER`
- [ ] ใช้พอร์ตที่ไม่มีสิทธิ์พิเศษ (>1024)
- [ ] กำหนดความเป็นเจ้าของไฟล์ที่เหมาะสมด้วย `chown`
- [ ] ลบ packages และไฟล์ที่ไม่จำเป็น
- [ ] ใช้ `--no-cache` สำหรับ package managers
- [ ] ระบุเวอร์ชันที่แน่นอนสำหรับ base images
- [ ] หลีกเลี่ยงการรันเซอร์วิสในฐานะ root
- [ ] ใช้ `COPY` แทน `ADD` เมื่อเป็นไปได้
- [ ] กำหนดสิทธิ์ directory ที่เหมาะสม

## ข้อพิจารณาสำหรับ Production

### Resource Limits

```dockerfile
# ระบุการใช้ทรัพยากรที่คาดหวัง
LABEL resources.memory="512MB"
LABEL resources.cpu="0.5"
```

### Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1
```

### การสนับสนุน Multi-architecture

```dockerfile
# ใช้ base images แบบ multi-arch
FROM --platform=$BUILDPLATFORM node:18-alpine
```

คู่มือปฏิบัตินี้ให้ตัวอย่างจริงในการสร้าง Docker containers แบบ rootless ที่ปลอดภัย เริ่มต้นด้วยรูปแบบพื้นฐานและค่อยๆ รวมเทคนิคขั้นสูงเมื่อคุณคุ้นเคยกับการปฏิบัติ rootless container มากขึ้น