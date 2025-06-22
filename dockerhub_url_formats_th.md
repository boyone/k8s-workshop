
# 🔗 ทำความเข้าใจกับ URL ของ Docker Hub

Docker Hub มีหลายรูปแบบของ URL ที่ใช้งานต่างกัน มาดูกันว่าแต่ละแบบมีไว้ทำอะไรบ้าง:

---

## 1. `https://hub.docker.com/_/dockerhub_username`

### 🟢 Official Images

- `_` หมายถึง **Docker image ทางการ**
- ดูแลโดย Docker หรือแหล่งที่เชื่อถือได้
- เช่น `nginx`, `ubuntu`, `mysql` เป็นต้น
- เวลาใช้งานไม่ต้องระบุชื่อผู้ใช้

✅ **ตัวอย่าง**:
```
https://hub.docker.com/_/nginx
docker pull nginx
```

---

## 2. `https://hub.docker.com/u/dockerhub_username`

### 🧑‍💻 หน้าโปรไฟล์ผู้ใช้

- แสดง **โปรไฟล์สาธารณะ** ของผู้ใช้หรือองค์กรใน Docker Hub
- รวมถึง repository สาธารณะทั้งหมดของผู้ใช้นั้น

✅ **ตัวอย่าง**:
```
https://hub.docker.com/u/sckdev
```

---

## 3. `https://hub.docker.com/r/dockerhub_username`

### 📦 Repository ของผู้ใช้

- ชี้ไปที่ **repository ภาพเฉพาะ** ของผู้ใช้
- แสดงรายละเอียดต่างๆ เช่น tag, คำอธิบาย และวิธีการ pull

✅ **ตัวอย่าง**:
```
https://hub.docker.com/r/sckdev/myapp
docker pull sckdev/myapp:latest
```

---

## ✅ ตารางสรุป

| รูปแบบ URL                             | จุดประสงค์                             | วิธีใช้งานตัวอย่าง         |
|----------------------------------------|------------------------------------------|------------------------------|
| `https://hub.docker.com/_/nginx`       | Docker image ทางการ                     | `docker pull nginx`          |
| `https://hub.docker.com/u/sckdev`      | โปรไฟล์ของผู้ใช้บน Docker Hub          | ดูภาพทั้งหมดของผู้ใช้นั้น   |
| `https://hub.docker.com/r/sckdev/myapp`| Repository ภาพเฉพาะของผู้ใช้           | `docker pull sckdev/myapp`   |

---

[docker workshop: Share Docker Images](./docker_workshop.md#share-docker-imagesenth)
