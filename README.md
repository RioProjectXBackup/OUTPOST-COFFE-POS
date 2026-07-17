# POS Outpost Coffee - Point of Sales System

Aplikasi Kasir (Point of Sales) modern berbasis web yang dirancang khusus untuk **Outpost Coffee**. Sistem ini didesain agar sangat intuitif, cepat, dan handal dengan dukungan sinkronisasi cloud real-time serta fitur Progressive Web App (PWA) agar dapat diinstal di berbagai perangkat.

Aplikasi ini dikembangkan dan dipelihara secara profesional oleh **RioProjectX**.

---

## ☕ Tentang Outpost Coffee
* **Alamat:** Jl. Harmonika Baru, Titi Rantai, Kec. Medan Baru, Kota Medan, Sumatera Utara 20132
* **No. HP / WhatsApp:** +62 852-6122-0186
* **Tagline:** *Seni Rasa & Ruang Temu*

---

## ✨ Fitur Utama POS Outpost

1. **Kasir Mandiri & Cepat**
   * Antarmuka grid menu yang responsif, visual, dan ramah sentuhan.
   * Kustomisasi item menu (opsi tambahan ukuran, tipe susu, tingkat kemanisan, es batu, espresso shot).
   * Keranjang belanja dinamis dengan sistem penghitungan otomatis, opsi diskon, dan metode pembayaran lengkap (Tunai, QRIS/E-Wallet, Debit/Kredit).

2. **Real-time Cloud Sync (Firebase Firestore)**
   * Sinkronisasi data omzet harian, transaksi, antrean, dan stok menu secara instan ke semua perangkat operasional.
   * Mode offline pintar menggunakan penyimpanan lokal perangkat apabila koneksi terputus.

3. **Manajemen Antrean & Waiting Room**
   * Pemantauan status pesanan (*Pending*, *Preparing*, *Ready*, *Completed*) secara langsung.
   * Halaman khusus *Waiting Room* yang dapat ditampilkan pada monitor eksterior untuk memudahkan pelanggan memantau nomor antrean mereka.

4. **Laporan & Analisis Penjualan**
   * Dasbor visual interaktif yang menyajikan ringkasan omzet harian, jumlah transaksi, dan rata-rata belanja per pelanggan.
   * Grafik tren penjualan harian serta analisis produk terlaris (Best-Selling Items).

5. **Aplikasi Dapat Diunduh (Progressive Web App - PWA)**
   * Mendukung instalasi langsung pada layar utama handphone (Android/iOS) maupun laptop/komputer tanpa perlu mengunduh dari App Store atau Play Store.

---

## 🛠️ Teknologi yang Digunakan
Sistem POS ini dibangun dengan menggunakan stack teknologi modern untuk menjamin performa terbaik:
* **Frontend Library:** React 18+ (TypeScript)
* **Build Tool:** Vite
* **Styling Framework:** Tailwind CSS
* **Ikonografi:** Lucide React
* **State & Cloud Storage:** Firebase Firestore (Real-time DB) & LocalStorage (Offline Fallback)
* **Animasi:** Motion / Framer Motion

---

## 🚀 Cara Menjalankan Proyek secara Lokal

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di perangkat Anda.

### Langkah-Langkah:
1. **Clone repositori ini:**
   ```bash
   git clone <url-repository>
   cd outpost-pos
   ```

2. **Instal seluruh dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

4. **Kompilasi produksi (Build):**
   ```bash
   npm run build
   ```

---

*Dikembangkan dengan penuh dedikasi dan komitmen kualitas oleh **RioProjectX**.*
