
# 🧠 12 Factor App – อธิบายสำหรับมือใหม่

**12 Factor App** คือแนวปฏิบัติที่ดีที่สุดสำหรับการสร้าง **แอปพลิเคชันเว็บสมัยใหม่** ที่ **ปรับใช้ได้ง่าย ขยายระบบได้ และดูแลรักษาง่าย** โดยเฉพาะเมื่อรันในระบบ **คลาวด์**

---

## 1. 📦 Codebase  
**“หนึ่งโค้ดเบส หลายการดีพลอย”**

- ควรมี **ที่เก็บโค้ด (repository)** เดียวต่อแอป
- นำไปดีพลอยในหลาย environment เช่น staging, production ด้วยโค้ดเดียวกัน

🛠 ตัวอย่าง: ใช้ Git repo เดียวสำหรับ backend แล้วนำไปดีพลอยได้ทั้ง staging และ production

---

## 2. 📚 Dependencies  
**“ระบุและแยก dependencies อย่างชัดเจน”**

- ใช้เครื่องมือเช่น `npm`, `pip` เพื่อระบุไลบรารีที่ต้องใช้
- อย่าพึ่งพาไลบรารีที่ติดตั้งไว้ในเครื่องเซิร์ฟเวอร์

🛠 ตัวอย่าง: ใช้ `package.json` ใน Node.js

---

## 3. ⚙️ Config  
**“เก็บ config ไว้ใน environment”**

- ค่าคอนฟิก เช่น API key, DB URL ควรเก็บใน environment variable ไม่ใช่ในโค้ด

🛠 ตัวอย่าง: ใช้ `.env` หรือ `docker run -e` เพื่อกำหนดค่าพวกนี้

---

## 4. 🔌 Backing Services  
**“บริการเสริมควรเชื่อมต่อผ่าน config”**

- บริการภายนอก เช่น database, email server ควรสลับเปลี่ยนได้ง่าย

🛠 ตัวอย่าง: เปลี่ยนจาก MySQL เป็น PostgreSQL ได้โดยแก้ config

---

## 5. 🔨 Build, Release, Run  
**“แยกเป็นขั้นตอน: สร้าง → ปล่อย → รัน”**

- **Build**: สร้าง artifact ของแอป
- **Release**: รวม artifact กับ config
- **Run**: เริ่มรันแอป

🛠 ตัวอย่าง: ไม่ควรแก้โค้ดหลังจาก release แล้ว

---

## 6. ⚙️ Processes  
**“รันแอปเป็น process ที่ไม่เก็บ state”**

- อย่าเก็บข้อมูลใน memory หรือ disk ภายในแอป

🛠 ตัวอย่าง: เก็บไฟล์ใน S3 หรือ database แทนการเก็บใน local disk

---

## 7. 🔉 Port Binding  
**“แอปรับการเชื่อมต่อผ่านพอร์ตของตัวเอง”**

- แอปควรรันแบบ self-contained และเปิดพอร์ตเพื่อรับคำสั่ง

🛠 ตัวอย่าง: `express` ใน Node.js รันที่ `process.env.PORT`

---

## 8. 📈 Concurrency  
**“รองรับการรันแบบหลาย process”**

- ควรสามารถขยายระบบโดยเพิ่มจำนวน instance ได้

🛠 ตัวอย่าง: ใช้ Docker หรือ Kubernetes เพื่อ scale

---

## 9. 💥 Disposability  
**“เริ่มต้นไว ปิดตัวได้อย่างปลอดภัย”**

- ควรเริ่มต้นได้รวดเร็วและหยุดทำงานได้โดยไม่เสียข้อมูล

🛠 ตัวอย่าง: จัดการ SIGTERM ใน Node.js เพื่อปิด DB connection อย่างปลอดภัย

---

## 10. 🌍 Dev/Prod Parity  
**“ให้ dev, staging และ production เหมือนกันมากที่สุด”**

- ลดปัญหา “ใช้ได้บนเครื่องผม แต่ใช้ไม่ได้ใน production”

🛠 ตัวอย่าง: ใช้ Docker เพื่อให้ทุก environment เหมือนกัน

---

## 11. 📜 Logs  
**“บันทึก log เป็น stream”**

- log ควรถูกเขียนไปที่ stdout/stderr และให้ระบบอื่นจัดการต่อ

🛠 ตัวอย่าง: ใช้เครื่องมือ logging ของ cloud หรือ Docker log driver

---

## 12. 🛠 Admin Processes  
**“งานดูแลระบบควรแยกจากแอปหลัก”**

- งานชั่วคราว เช่น migration ควรรันเป็น process แยก

🛠 ตัวอย่าง: ใช้คำสั่งเช่น `npm run migrate` หรือ `flask shell`

---

## ✅ สรุปในตาราง

| หลักการ             | ประโยชน์                         |
|----------------------|-----------------------------------|
| Stateless            | ขยายระบบได้ง่าย                |
| Config-driven        | ดีพลอยสะดวก                    |
| Dependency mgmt      | ลดปัญหา “ใช้ได้แค่บนเครื่องผม” |
| Process-based        | ระบบมีความยืดหยุ่น              |

---

[docker workshop: The 12 Factor App](./docker_workshop.md#the-12-factor-appenth)
