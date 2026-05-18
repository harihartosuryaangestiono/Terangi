# 📘 Dokumentasi Pembuatan Aplikasi Web Terangi

> Dokumen ini menjelaskan proses pembuatan aplikasi web **Terangi** dari awal hingga siap deploy, mencakup teknologi yang digunakan, struktur proyek, dan penjelasan setiap fitur.

---

## 🌟 Tentang Terangi

**Terangi** adalah aplikasi web layanan sosial berbasis AI yang dirancang untuk membantu masyarakat yang membutuhkan bantuan psikologis dan sosial. Nama "Terangi" mencerminkan misi aplikasi: *membawa cahaya* di tengah permasalahan sosial.

### Tujuan Aplikasi
- Menyediakan asisten AI yang bisa mendengarkan keluhan pengguna
- Membantu pengguna menjadwalkan sesi konsultasi dengan konselor
- Menampilkan lokasi fasilitas kesehatan dan sosial terdekat
- Menyediakan akses cepat ke nomor darurat nasional

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| **React 19** | Library utama untuk membangun antarmuka pengguna |
| **Vite** | Build tool modern yang sangat cepat |
| **Tailwind CSS v4** | Framework CSS untuk styling komponen |
| **React Router DOM v7** | Navigasi antar halaman (SPA) |
| **Firebase (Auth + Firestore)** | Autentikasi pengguna & penyimpanan data chat/booking |
| **Google Maps API** | Menampilkan peta interaktif di halaman Lokasi |
| **Overpass API (OpenStreetMap)** | Mengambil data rumah sakit & klinik terdekat (gratis) |
| **Nominatim API** | Autocomplete pencarian lokasi/kota (gratis) |
| **Lucide React** | Library ikon modern |
| **Vercel** | Platform deployment |

---

## 📁 Struktur Proyek

```
Terangi/
├── public/
│   ├── favicon.svg          # Ikon aplikasi
│   └── icons.svg
├── src/
│   ├── assets/              # Gambar & aset statis
│   ├── components/
│   │   ├── Button.jsx       # Komponen tombol reusable
│   │   └── Card.jsx         # Komponen card reusable
│   ├── contexts/
│   │   └── AuthContext.jsx  # State management autentikasi global
│   ├── layouts/
│   │   └── MainLayout.jsx   # Layout utama + navigasi bawah
│   ├── lib/
│   │   └── utils.js         # Fungsi utilitas (class merging)
│   ├── pages/
│   │   ├── HomePage.jsx     # Halaman beranda
│   │   ├── ChatPage.jsx     # Halaman chat dengan AI
│   │   ├── BookingPage.jsx  # Halaman penjadwalan sesi
│   │   ├── LocationsPage.jsx # Halaman peta & lokasi layanan
│   │   ├── EmergencyPage.jsx # Halaman kontak darurat
│   │   └── LoginPage.jsx    # Halaman login/register
│   ├── services/
│   │   └── firebase.js      # Konfigurasi & inisialisasi Firebase
│   ├── App.jsx              # Root komponen + routing
│   ├── main.jsx             # Entry point React
│   └── index.css            # Global CSS + Tailwind
├── .env.local               # Environment variables (tidak di-upload ke Git)
├── vercel.json              # Konfigurasi routing untuk Vercel
├── package.json             # Daftar dependency
└── vite.config.js           # Konfigurasi Vite
```

---

## 🚀 Tahapan Pembuatan — Step by Step

### Langkah 1 — Inisialisasi Proyek

Proyek dibuat menggunakan template resmi **React + Vite**:

```bash
npm create vite@latest terangi -- --template react
cd terangi
npm install
```

### Langkah 2 — Instalasi Dependency

Semua library yang dibutuhkan diinstal sekaligus:

```bash
npm install react-router-dom firebase @react-google-maps/api lucide-react tailwind-merge clsx date-fns
npm install -D tailwindcss @tailwindcss/vite autoprefixer postcss
```

### Langkah 3 — Konfigurasi Tailwind CSS

Tailwind CSS v4 dikonfigurasi melalui `vite.config.js` dengan plugin `@tailwindcss/vite`, sehingga tidak memerlukan file `tailwind.config.js` terpisah. Custom color `primary` (oranye) didefinisikan di `index.css`.

### Langkah 4 — Setup Firebase

1. Buat proyek baru di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** (Email/Password)
3. Aktifkan **Firestore Database**
4. Salin konfigurasi ke file `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

5. Buat `src/services/firebase.js` untuk menginisialisasi koneksi Firebase.

> **Mode Mock:** Aplikasi memiliki mode simulasi — jika Firebase tidak dikonfigurasi, semua fitur tetap berjalan menggunakan data lokal tanpa koneksi ke server.

### Langkah 5 — Sistem Autentikasi

Dibuat `AuthContext.jsx` menggunakan React Context API untuk:
- Menyimpan state pengguna yang sedang login secara global
- Menyediakan fungsi `login()`, `signup()`, `logout()`
- Membungkus seluruh aplikasi agar semua halaman bisa mengakses data user

### Langkah 6 — Layout & Navigasi

`MainLayout.jsx` dibuat sebagai layout utama yang berisi:
- **Header** di bagian atas (nama aplikasi + tombol logout)
- **Konten halaman** di tengah (area utama yang berganti-ganti)
- **Navigasi bawah** (bottom navigation) dengan 5 ikon: Beranda, Chat, Jadwal, Lokasi, Darurat

Desain mengikuti pola **mobile-first** menyerupai tampilan aplikasi mobile.

### Langkah 7 — Routing Antar Halaman

Di `App.jsx`, semua halaman didaftarkan menggunakan `react-router-dom`:

```
/          → HomePage
/chat      → ChatPage
/booking   → BookingPage
/locations → LocationsPage
/emergency → EmergencyPage
/login     → LoginPage
```

### Langkah 8 — Halaman Beranda (HomePage)

Halaman utama berisi:
- **Hero section** dengan gradient oranye dan tombol "Bantuan Darurat Sekarang"
- **Grid kartu fitur** (Chat, Jadwal, Lokasi) yang bisa diklik untuk navigasi
- **Seksi "Mengapa Terangi?"** sebagai penjelasan singkat aplikasi

### Langkah 9 — Fitur Chat AI (ChatPage)

Ini adalah fitur utama Terangi. Cara kerjanya:

1. **Deteksi Krisis:** Setiap pesan yang dikirim pengguna dicek menggunakan daftar kata kunci krisis (`bunuh diri`, `mau mati`, `dipukul`, dll). Jika terdeteksi, bot langsung merespons dengan arahan ke Kontak Darurat.

2. **Klasifikasi Intent:** Jika bukan krisis, pesan dikategorikan ke 5 intent:
   - `family_issues` → masalah keluarga
   - `violence_abuse` → kekerasan/pelecehan
   - `mental_health` → stres, depresi, sedih
   - `economy` → masalah keuangan
   - `general_greeting` → sapaan biasa

3. **Respons Bot:** Berdasarkan kategori, bot memberikan respons empatik yang relevan.

4. **Penyimpanan:** Semua pesan tersimpan di Firestore collection `chats` dengan filter per `userId`.

5. **Bersihkan Chat:** Tombol 🗑️ di header memungkinkan pengguna menghapus seluruh riwayat percakapan.

### Langkah 10 — Fitur Penjadwalan Sesi (BookingPage)

Form booking dengan field:
- Nama lengkap
- Tanggal (date picker)
- Waktu (time picker)
- Jenis sesi: **Online (Zoom)** atau **Offline (Tatap Muka)**

Setelah submit, data tersimpan ke Firestore collection `bookings` dan muncul halaman konfirmasi.

### Langkah 11 — Fitur Lokasi Layanan (LocationsPage)

Halaman peta interaktif yang menggunakan 3 API berbeda:

1. **Google Maps API** — Menampilkan peta visual interaktif dengan marker lokasi
2. **Browser Geolocation API** — Mendeteksi posisi pengguna secara otomatis
3. **Overpass API (OpenStreetMap)** — Mengambil data rumah sakit dan klinik dalam radius 5km secara real-time (gratis)
4. **Nominatim API** — Autocomplete pencarian nama kota/daerah dengan debounce 600ms

Fitur tambahan:
- Floating search bar di atas peta
- Bottom sheet yang bisa di-scroll berisi daftar fasilitas terdekat
- Tombol "kembali ke lokasi saya"
- Fallback data simulasi jika API sedang sibuk

### Langkah 12 — Halaman Kontak Darurat (EmergencyPage)

Menampilkan 4 nomor darurat nasional Indonesia yang bisa langsung diklik untuk menelepon:
- **110** — Polisi
- **118** — Ambulans / Medis
- **129** — Layanan SAPA (Sahabat Perempuan dan Anak)
- **171** — Kemensos Command Center

### Langkah 13 — Setup Google Maps API

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Aktifkan **Maps JavaScript API**
3. Buat API Key dan tambahkan ke `.env.local`:
```env
VITE_GOOGLE_MAPS_API_KEY=...
```

### Langkah 14 — Persiapan & Deploy ke Vercel

1. **Push ke GitHub:**
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/terangi.git
git push -u origin main
```

2. **Tambah `vercel.json`** untuk memastikan routing React tidak error 404 saat refresh:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

3. **Import repo di Vercel** → tambahkan semua `VITE_*` environment variables → klik Deploy.

---

## 🗄️ Struktur Database Firebase

### Collection: `chats`
| Field | Tipe | Keterangan |
|---|---|---|
| `text` | string | Isi pesan |
| `sender` | string | `"user"` atau `"admin"` (bot) |
| `userId` | string | UID pengguna dari Firebase Auth |
| `createdAt` | timestamp | Waktu pesan dibuat |

### Collection: `bookings`
| Field | Tipe | Keterangan |
|---|---|---|
| `name` | string | Nama lengkap pengguna |
| `date` | string | Tanggal sesi |
| `time` | string | Waktu sesi |
| `type` | string | `"online"` atau `"offline"` |
| `userId` | string | UID pengguna |
| `createdAt` | timestamp | Waktu booking dibuat |

---

## 🔑 Environment Variables

| Variable | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain autentikasi Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID proyek Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket storage Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase |
| `VITE_FIREBASE_APP_ID` | App ID Firebase |
| `VITE_GOOGLE_MAPS_API_KEY` | API Key Google Maps |

> Semua variabel harus diawali `VITE_` agar bisa diakses oleh Vite di sisi client.

---

## 🏗️ Arsitektur Sistem

```
Pengguna (Browser)
       │
       ▼
  React + Vite (Frontend)
       │
  ┌────┴────────────────────────────────┐
  │                                      │
  ▼                                      ▼
Firebase                         External APIs
  ├─ Authentication (Login)        ├─ Google Maps (Peta)
  └─ Firestore (Chat & Booking)    ├─ Overpass (Fasilitas OSM)
                                   └─ Nominatim (Pencarian Lokasi)
```

---

## 📱 Tampilan Aplikasi

Aplikasi dirancang dengan pendekatan **Mobile-First** — tampil seperti aplikasi mobile di HP, namun tetap responsif di desktop (muncul sebagai "card" di tengah layar).

---

*Dokumentasi ini dibuat untuk keperluan presentasi proyek Terangi.*
