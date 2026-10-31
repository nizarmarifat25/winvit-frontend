# PANDUAN THUMBNAIL TEMA UNDANGAN (MOCKUP DEVICE)

Folder ini khusus menyimpan screenshot / thumbnail tiap tema untuk ditampilkan di dalam frame **HP (Smartphone)**, **Tablet (Tab)**, dan **Desktop (Laptop)** pada kartu tema di halaman utama (`index.html`).

---

## 📁 Struktur Folder

Setiap tema memiliki foldernya masing-masing sesuai ID tema:

```
asset/img/thumbnails/
├── [id-tema]/
│   ├── mobile.jpg        <-- Screenshot layar HP 1 (Cover / Pembuka) [WAJIB/UTAMA]
│   ├── mobile-2.jpg      <-- Screenshot layar HP 2 (Hero / Countdown) [Opsional untuk mode 3-HP]
│   ├── mobile-3.jpg      <-- Screenshot layar HP 3 (Acara / Lokasi / Galeri) [Opsional untuk mode 3-HP]
│   ├── tablet.jpg        <-- Screenshot layar Tablet / iPad
│   └── desktop.jpg       <-- Screenshot layar Laptop / Desktop
```

### Daftar Folder Tema:
1. `sunda-siger/`
2. `melati-prada/`
3. `kraton/`
4. `aurora/`
5. `emerald/`
6. `botanica/`
7. `classic-rose/`
8. `ungu-senja/`
9. `pantai-frangipani/`
10. `batik/`
11. `tideline-bento/`
12. `golden-hour/`
13. `obsidian-smoke/`
14. `midnight-celestial/`
15. `indigo-bloom/`
16. `black-diamond/`
17. `blue-water/`
18. `blush-bloom/`
19. `golden-regeria/`
20. `midnight-sapphire/`
21. `sage-green/`

---

## 📐 Rekomendasi Resolusi Screenshot

| Tipe Frame | Nama File | Rasio Aspek | Resolusi Rekomendasi |
| :--- | :--- | :--- | :--- |
| **HP (Smartphone)** | `mobile.jpg` / `mobile-2.jpg` / `mobile-3.jpg` | **9 : 19.5** atau **9 : 16** | `1080 x 2340 px` atau `1170 x 2532 px` (Full HD HP) |
| **Tablet (iPad/Tab)** | `tablet.jpg` | **3 : 4** atau **4 : 3** | `1620 x 2160 px` atau `1200 x 1600 px` |
| **Desktop (Laptop)** | `desktop.jpg` | **16 : 10** atau **16 : 9** | `1920 x 1080 px` atau `1600 x 1000 px` |

> [!TIP]
> **Format yang didukung**: `.jpg`, `.jpeg`, `.png`, atau `.webp`.
> Anda bisa melakukan screenshot langsung dari HP, browser developer tools (Ctrl+Shift+M), lalu menyimpannya ke folder tema masing-masing.

---

## ⚡ Sistem Fallback Otomatis
Jika Anda belum sempat memasukkan screenshot ke dalam folder tema, website secara otomatis menggunakan foto galeri prewedding tema tersebut dengan posisi crop yang presisi dan estetis. Jadi website tidak akan pernah rusak / broken image!
