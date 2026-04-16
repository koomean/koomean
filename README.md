# 🚀 Koo Mean SITE V.2

เว็บไซต์ศูนย์รวมลิงก์ (Link Hub) และพอร์ตโฟลิโอส่วนตัวเวอร์ชัน 2 ที่ได้รับการอัปเกรดระบบใหม่ทั้งหมด มาพร้อมกับระบบล็อกอินและจัดการสิทธิ์การเข้าถึง (Role-Based Access Control) โดยใช้ Google Sheets และ Google Apps Script เป็นฐานข้อมูลหลัก (Backend) จัดเต็มด้วย UI/UX สไตล์ Dark Mode พร้อมเอฟเฟกต์ Neon Glow สุดล้ำ

## ✨ ฟีเจอร์เด่น (Key Features)

* **🔒 Role-Based Access Control:** ระบบแยกการมองเห็นลิงก์ตามสิทธิ์ผู้ใช้งาน (Public, VIP, Student และ Admin)
* **🔑 Google Authentication:** ล็อกอินเข้าสู่ระบบอย่างปลอดภัยด้วยบัญชี Google (Google Sign-In)
* **🛠️ Admin Dashboard (In-App):** แผงควบคุมสำหรับแอดมิน จัดการสิทธิ์ผู้ใช้, แก้ไขกลุ่มลิงก์ และปักหมุดลิงก์ (⭐ Pinned) ได้โดยตรงจากหน้าเว็บ
* **🎨 Sleek UI/UX:** ดีไซน์ Dark Mode ทันสมัย พร้อมแอนิเมชัน Smooth Fade-in, Splash Screen Loader ตอนเข้าเว็บ และเอฟเฟกต์เรืองแสง (Glow)
* **📊 System Status:** ระบบเช็คสถานะการเชื่อมต่อ API และ Media แบบ Real-time
* **🔍 Smart Search:** ค้นหาลิงก์ที่ต้องการได้ทันทีแบบไม่ต้องรอโหลดหน้าใหม่ (Real-time Filtering)
* **📱 Fully Responsive:** แสดงผลได้สวยงามและสมบูรณ์แบบทั้งบนสมาร์ทโฟน แท็บเล็ต และคอมพิวเตอร์

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

* **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
* **Backend & Database:** Google Apps Script (GAS) & Google Sheets
* **Authentication:** Google Identity Services (GSI)
* **Icons:** FontAwesome (Free)

## 🚦 ระบบสิทธิ์การเข้าถึง (Role System)

1.  **Public:** สิทธิ์เริ่มต้นสำหรับผู้เยี่ยมชมทุกคน (เห็นเฉพาะลิงก์ทั่วไป)
2.  **Special Roles (e.g., VIP, Student):** ผู้ใช้ที่ลงทะเบียนและได้รับการปลดล็อคสิทธิ์จากแอดมิน จะเห็นลิงก์พิเศษตามกลุ่มของตนเอง
3.  **Admin:** เห็นทุกลิงก์ในระบบ และสามารถเข้าถึงเมนู **Manage System** เพื่อจัดการผู้ใช้และลิงก์ได้

## ⚙️ การติดตั้งและใช้งานเบื้องต้น (Setup)

1. ฝั่ง Backend: ตั้งค่า Google Sheets และ Deploy Google Apps Script (Web App) เพื่อทำ API
2. นำ URL API ที่ได้จากการ Deploy มาแทนที่ในตัวแปร `API_URL` ในไฟล์ `index.html`
3. ฝั่ง Authentication: ไปที่ Google Cloud Console เพื่อสร้าง OAuth Client ID และนำมาใส่ใน `data-client_id`
4. อัปโหลดโค้ดขึ้นโฮสติ้งที่ต้องการ (เช่น GitHub Pages, Vercel หรือเซิร์ฟเวอร์ส่วนตัว)

---
*Developed with Gemini and ☕ by koomean*
