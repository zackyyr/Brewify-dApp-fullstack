# Brewify - Blockchain Coffee Marketplace

**Brewify** adalah platform marketplace kopi berbasis blockchain untuk menghubungkan farmer, buyer, dan logistic provider. Setiap batch kopi dapat dimint sebagai NFT dengan metadata dan QR code untuk tracking.

---

## Fitur Utama
1. **Mint Batch NFT**
   - Farmer dapat membuat batch kopi baru, upload gambar, dan mint NFT.
   - Metadata dan gambar tersimpan di IPFS (Pinata).
   - QR code otomatis dibuat untuk setiap batch.

2. **Marketplace / Dashboard**
   - Buyer dapat melihat semua batch NFT, filter berdasarkan tipe kopi, proses, dan harga.
   - Farmer dapat memonitor batch NFT miliknya.
   - Logistics dapat melihat batch yang harus dikirim.

3. **Wallet Integration**
   - Koneksi dengan MetaMask.
   - Login role-based (Buyer, Farmer, Logistics).

---

## Alasan Menggunakan Database

Meskipun blockchain menyimpan NFT dan metadata, **database relasional** seperti PostgreSQL tetap sangat penting dalam sistem Brewify karena beberapa alasan:

1. **Query Cepat & Filtering**
   - Blockchain tidak dirancang untuk query kompleks seperti filter batch berdasarkan proses, harga, atau owner. PostgreSQL memungkinkan query cepat dengan indeks dan filter.

2. **Integrasi dengan UI**
   - Data yang tersimpan di blockchain sulit diakses langsung oleh UI untuk listing produk, search, atau dashboard. Database menyediakan layer yang mudah diakses oleh frontend.

3. **Data Historis & Logging**
   - Database menyimpan detail batch, timeline, dan jumlah stok yang bisa diupdate, sehingga memudahkan monitoring tanpa memanggil blockchain terus-menerus.

4. **Reliabilitas & Konsistensi**
   - Blockchain ideal untuk ownership & provenance, tapi mutable data (misal stock, status pengiriman) lebih efisien dikelola di database.

Dengan kombinasi **Blockchain + Database**, Brewify memanfaatkan keunggulan masing-masing:
- **Blockchain:** transparansi, keamanan, ownership NFT.
- **Database:** query cepat, mutabilitas, UI-friendly, analytics.

---
## Tech Stack
- **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion
- **Blockchain:** Ethers.js, Hardhat / Ganache
- **Storage:** IPFS (via Pinata)
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** Wallet-based (MetaMask)

---

## Setup & Install

### 1. Clone Repo
```bash
git clone https://github.com/zackyyr/Brewify-dApp-fullstack.git
cd brewify
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env` dengan isi:
```env
PINATA_JWT=
NEXT_PUBLIC_GATEWAY_URL=
NEXT_PUBLIC_RPC_URL=
PRIVATE_KEY=
NEXT_PUBLIC_USERPROFILE_ADDRESS=
NEXT_PUBLIC_BATCHNFT_ADDRESS=
DATABASE_URL="postgresql://namauser@localhost:5432/brewify"

```

### 4. Database
Gunakan PostgreSQL lokal atau cloud. Setelah itu generate Prisma client:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Akses di: http://localhost:3000

---

## Prisma Schema (Database)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Product {
  id           Int      @id @default(autoincrement())
  tokenId      Int      @unique
  name         String
  description  String
  imageCid     String
  metadataCid  String
  priceEth     Float
  origin       String
  process      String
  quantity     Int
  harvested    DateTime
  roasted      DateTime
  packed       DateTime
  slug         String   @unique
  owner        String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model User {
  id        Int      @id @default(autoincrement())
  address   String   @unique
  username  String
  role      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Cara Pakai
1. Jalankan server dev.
2. Farmer login dengan wallet → mint batch baru.
3. Metadata dan gambar otomatis ke IPFS.
4. QR code muncul setelah mint, bisa didownload.
5. Buyer bisa melihat marketplace dan filter batch.
6. Logistics bisa pantau batch untuk pengiriman.

---

## Notes
- Pastikan wallet MetaMask sudah terhubung ke network yang sama dengan kontrak.
- QR code akan otomatis menunjuk ke URL `NEXT_PUBLIC_APP_URL/product/<slug>`.
- Semua data blockchain tersimpan sebagai NFT + metadata di IPFS, sementara detail batch disimpan di database PostgreSQL.

