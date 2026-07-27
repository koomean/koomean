<div align="center">

# 🚀 KOO MEAN SITE V.2
### **The Ultimate Link Hub & Role-Based Portfolio Platform**

[![Version](https://img.shields.io/badge/Version-2.0.0-blueviolet?style=for-the-badge)]()
[![Frontend](https://img.shields.io/badge/Frontend-GitHub_Pages-blue?style=for-the-badge)]()
[![Proxy](https://img.shields.io/badge/Proxy-Cloudflare_Worker-orange?style=for-the-badge)]()
[![Backend](https://img.shields.io/badge/Backend-Google_Apps_Script-green?style=for-the-badge)]()
[![Auth](https://img.shields.io/badge/Auth-Google_Identity-white?style=for-the-badge)]()

</div>

---

# 🌟 OVERVIEW (ภาพรวมโปรเจกต์)

**Koo Mean SITE V.2** คือศูนย์รวมลิงก์และพอร์ตโฟลิโอส่วนตัวที่มีระบบหลังบ้านเต็มรูปแบบ ควบคุมการมองเห็นเนื้อหาตามสิทธิ์ของผู้ใช้ (Role-Based Access Control) บนดีไซน์ **Neon Dark Mode**

ทั้งเว็บอยู่ในไฟล์ `index.html` ไฟล์เดียว (HTML + CSS + JS รวมกัน) ไม่มี build step ไม่มี dependency ที่ต้องติดตั้ง — แก้เสร็จอัปขึ้น GitHub Pages ได้เลย

---

# 🏗️ ARCHITECTURE (สถาปัตยกรรม)

```
เบราว์เซอร์ (index.html)
        │
        │  POST / GET  (application/x-www-form-urlencoded)
        ▼
Cloudflare Worker  ── koomean-proxy.meanchannel52.workers.dev
        │           • ซ่อน URL จริงของ Apps Script ไว้ใน env var "UPSTREAM"
        │           • ใส่ CORS header
        │           • แคชคำตอบของ action ประเภทอ่านไว้ที่ edge (worker.js)
        ▼
Google Apps Script (doGet / doPost)
        │           • ตรวจ Google ID Token
        │           • Rate limit + Circuit breaker
        │           • CacheService (posts 5 นาที / meta 30 นาที)
        ▼
Google Sheets  ──  Profile · Links · Apps · Users · Log
```

> 🔒 หน้าเว็บ **ไม่เคยรู้ URL จริงของ Apps Script** — ถ้าใส่ตรงๆ จะมีคนยิงข้าม Cloudflare ได้

---

# ✨ KEY FEATURES (คุณสมบัติที่มีอยู่จริง)

### 🔒 Role-Based Access Control
- ลิงก์แต่ละอันกำหนด `Group` ได้ว่าใครเห็นบ้าง — **สิทธิ์เป็นข้อความอิสระ** ไม่ได้ล็อกไว้แค่ 4 ระดับ
  ตั้งชื่อ role อะไรก็ได้ในชีต `Users` แล้วใส่ชื่อเดียวกันในคอลัมน์ `Group` ของชีต `Links`
- ผู้ใช้ 1 คนมีได้หลาย role — คั่นด้วย `,` `;` หรือ `|` (เช่น `vip,student`)
- มีเพียง 2 คำที่มีความหมายพิเศษ: **`admin`** (เห็นทุกอย่าง + เข้าเมนูจัดการได้) และ **`public`** (ค่าเริ่มต้น)
- การกรองเกิดขึ้น **ฝั่งเซิร์ฟเวอร์** — ลิงก์ที่ไม่มีสิทธิ์จะไม่ถูกส่งมาที่เบราว์เซอร์เลย

### 🔑 Google Sign-In + Session
- ล็อกอินผ่าน Google Identity Services (GSI) ด้วย ID Token
- จำเซสชันไว้ใน `localStorage` (`koomean_session_v3`) และ**เช็ควันหมดอายุของ token ก่อนใช้ซ้ำ** — หมดอายุแล้วเคลียร์ทิ้งอัตโนมัติ
- ผู้ใช้ใหม่ต้องกรอกข้อความแนะนำตัวก่อน แล้วรอแอดมินปรับสิทธิ์ให้

### 🔐 Unlock by Access Code
- ลิงก์ที่ใส่ **Access Code** ไว้ในชีต จะไม่ส่ง URL มาที่หน้าเว็บเลยจนกว่าจะกรอกรหัสถูก
- กรอกรหัส 1 ครั้ง → ระบบแสดงรายการลิงก์ทั้งหมดที่รหัสนั้นปลดล็อกได้
- ฝั่ง backend มีระบบกัน brute-force (จำกัดจำนวนครั้งที่กรอกผิด ทั้งต่อเครื่องและทั้งระบบ)

### 🛠️ In-App Admin Dashboard
- เปลี่ยน role ของผู้ใช้ได้จากหน้าเว็บ
- แก้ URL ของลิงก์ และปัก/ถอนหมุด (⭐ Starred) ได้
- **View As** — จำลองมุมมองของ role อื่นเพื่อเช็คว่าคนทั่วไปเห็นอะไรบ้าง โดยไม่ต้องออกจากระบบ

### 🎨 UI / UX
- Neon Glow บนพื้น Dark Mode + orb เรืองแสงเคลื่อนไหวเป็นพื้นหลัง
- Global Loader ตอนเปิดเว็บ และ Skeleton ตอนสลับสถานะ
- **Real-time Search** กรองลิงก์ทันทีที่พิมพ์ (มี debounce)
- แถบแสดงความคืบหน้าการเลื่อนหน้า + ไฟสปอตไลต์วิ่งตามเมาส์บนการ์ด
- Fade-in ตอนเลื่อนถึง (IntersectionObserver)
- รองรับ `prefers-reduced-motion` — ปิดแอนิเมชันและเอฟเฟกต์เบลอให้ผู้ที่ตั้งค่าไว้

### 📊 System Health Monitor
- ไฟสถานะ API / Media บน navbar พร้อมนาฬิกาเวลาไทย
- เช็คซ้ำทุก 60 วินาที และ**ข้ามการเช็คเมื่อผู้ใช้ไม่ได้เปิดแท็บนี้อยู่**
- แจ้งเตือนเมื่อออฟไลน์ / กลับมาออนไลน์

### 🛡️ ความทนทาน
- ยิง API ใหม่อัตโนมัติเมื่อพลาด (retry 2 ครั้ง) + timeout 15 วินาที
- เจอ 429 จาก backend → พักการยิง 20 วินาที แล้วแจ้งผู้ใช้

---

# 🛠️ TECH STACK

| ส่วนงาน | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom Properties + Animation), Vanilla JavaScript (ES2020+) |
| **Proxy** | Cloudflare Workers |
| **Backend** | Google Apps Script (Web App) |
| **Database** | Google Sheets |
| **Auth** | Google Identity Services (GSI) |
| **Icons** | Font Awesome 6.5.0 (cdnjs) |
| **Fonts** | Noto Sans Thai (Google Fonts) + system font stack |

---

# 📂 DATABASE STRUCTURE (โครงสร้างชีต)

### `Profile` — ใช้แถวที่ 2 แถวเดียว
| A | B | C | D | E |
| :-- | :-- | :-- | :-- | :-- |
| Name | Bio | ImageUrl | VideoUrl | AboutText |

> คอลัมน์ F-K ของชีตเดียวกันใช้ร่วมกับเว็บ Blog (WebTitle, SpaceName, SpaceBio, SpaceImageUrl, CoverUrl, Handle)

### `Links`
| A | B | C | D | E | F |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Title | Url | Icon | Group | Starred | AccessCode |

- `Icon` = คลาสของ Font Awesome เช่น `fas fa-globe`
- `Group` = ว่างหรือ `public` คือทุกคนเห็น · ใส่ชื่อ role คั่นด้วย `,` เพื่อจำกัดสิทธิ์
- `AccessCode` = ใส่ไว้เมื่อไหร่ ลิงก์นั้นจะถูกซ่อน URL จนกว่าจะกรอกรหัสถูก

### `Apps`
| A | B |
| :-- | :-- |
| Name | Url |

### `Users`
| A | B | C | D | E | F | G |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Email | Name | Role | Last Login | Notes | Pic | Created |

### `Log`
บันทึกเหตุการณ์อัตโนมัติ (ล็อกอิน, สมัคร, ข้อผิดพลาด) — ระบบสร้างให้เองเมื่อใช้งานครั้งแรก

---

# 🔌 API ACTIONS ที่หน้านี้เรียกใช้

| Action | Method | ใช้ตอนไหน |
| :-- | :-- | :-- |
| `ping` | GET | เช็คสถานะระบบ (ไม่แตะ Sheet) |
| `bootstrap` | POST | โหลด Profile + Links + Apps + ข้อมูลผู้ใช้ ตอนเปิดเว็บ |
| `register` | POST | ผู้ใช้ใหม่สมัครเข้าระบบ |
| `unlockByCode` | POST | ปลดล็อกลิงก์ด้วยรหัสผ่าน |
| `updateLink` | POST | แอดมินแก้ URL / ปักหมุดลิงก์ |
| `updateRole` | POST | แอดมินเปลี่ยนสิทธิ์ผู้ใช้ |

> การอ่านข้อมูลส่งผ่าน **POST** เพื่อไม่ให้ `idToken` ติดไปกับ URL

---

# ⚙️ INSTALLATION (การตั้งค่า)

1. **Google Sheet** — สร้างชีตชื่อ `Profile`, `Links`, `Apps`, `Users` ตามโครงสร้างด้านบน
2. **Apps Script** — วางโค้ด `BackEnd.gs` แล้ว Deploy เป็น Web App
   (Execute as: *Me* · Who has access: *Anyone*) แล้วคัดลอก URL `/exec` เก็บไว้
3. **Google Cloud Console** — สร้าง OAuth Client ID (Web application)
   ใส่โดเมนของ GitHub Pages ใน *Authorized JavaScript origins*
   แล้วนำ Client ID ไปใส่ทั้งใน `index.html` (`data-client_id`) และใน `CONFIG.GOOGLE_CLIENT_ID` ของ Apps Script — **ต้องตรงกัน ไม่งั้นล็อกอินไม่ผ่าน**
4. **Cloudflare Worker** — วางโค้ด `worker.js` แล้วตั้ง Environment Variable
   `UPSTREAM` = URL `/exec` จากข้อ 2 · จากนั้นนำ URL ของ Worker ไปใส่ที่ตัวแปร `API_URL` ใน `index.html`
5. **Deploy** — อัป `index.html` ขึ้น GitHub แล้วเปิด GitHub Pages

---

# ⚡ PERFORMANCE NOTES

สิ่งที่ทำไปแล้วเพื่อให้หน้าเว็บเบาและคะแนน PageSpeed ดีขึ้น:

- **Google Sign-In โหลดแบบ on-demand** — ไม่ดาวน์โหลด 98 KB ให้คนที่แค่เข้ามาดูลิงก์เฉยๆ
  โหลดตอนผู้ใช้แตะ/เลื่อน/พิมพ์ครั้งแรก หรือตอนกดปุ่มล็อกอิน
- **`preconnect`** ไปยัง API, cdnjs และ Google Fonts ตั้งแต่บรรทัดแรกของ `<head>`
- **ตัดน้ำหนักฟอนต์ที่ไม่ได้ใช้** — Noto Sans Thai เหลือ 400/500/600/700 (เดิมมี 300 ที่ไม่ถูกเรียกใช้เลย)
- **`ping` ไม่อยู่บน critical path** — รอหน้าเว็บโหลดเสร็จและเบราว์เซอร์ว่างก่อนค่อยเช็คสถานะ
- **นาฬิกาและตัวเช็คสถานะหยุดทำงานเมื่อสลับแท็บ**
- **`<img>` ทุกตัวระบุ `width`/`height`** เพื่อไม่ให้หน้าเว็บกระตุกตอนโหลดรูป (CLS)
- **Edge cache ที่ Cloudflare Worker** — Apps Script มี latency พื้นฐาน 2-3 วินาทีต่อ request
  ที่ frontend แก้ไม่ได้ `worker.js` จึงแคชคำตอบของ action ประเภทอ่านไว้ที่ edge (แยกแคชตามสิทธิ์ผู้ใช้)

---

# 👨‍💻 AUTHOR
**koomean**
> "Coding with ChatGPT 5.6 Sol and Claude Fable 5, designing with vision."

**Personal Gear Setup:**
- 💻 **Macbook Air M5** (Primary Dev Machine)
- 📱 **iPhone 14 Pro** (Mobile Experience Testing)
- 🗄️ **Synology DS423+** (Private Cloud Storage)

---
<div align="center">
  <sub>Copyright © 2026 koomean. All rights reserved.</sub>
</div>
