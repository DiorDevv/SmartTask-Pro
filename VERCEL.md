# Reja — Vercelga qo'yish

## 1. PostgreSQL bazasini yaratish

[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) yoki [Neon](https://neon.tech) dan foydalaning:

```bash
# Vercel Postgres orqali
vercel env add DATABASE_URL
# Yoki Neon console dan olingan URL
```

## 2. Environment o'zgaruvchilari

Vercel dashboard → Settings → Environment Variables:

| O'zgaruvchi | Qiymat |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_CLIENT_ID` | (ixtiyoriy) |
| `GOOGLE_CLIENT_SECRET` | (ixtiyoriy) |

## 3. Prisma migratsiya

```bash
npx prisma db push
# yoki
npx prisma migrate deploy
```

## 4. Deploy

```bash
# Vercel CLI orqali
vercel --prod

# Yoki GitHub repo ni Vercelga ulang:
# 1. Vercel dashboard → Add New Project
# 2. GitHub repozitoryni tanlang
# 3. Environment variables ni kiriting
# 4. Deploy
```

## 5. Muhim eslatmalar

- **Fayl yuklash**: Vercel serverless da fayl yuklash 4.5 MB bilan cheklangan. Excel import uchun fayl hajmi kichik bo'lsa ishlaydi. Katta fayllar uchun Vercel Blob yoki AWS S3 kerak.
- **public/uploads/**: Vercelda fayllar saqlanmaydi. Avatar va attachment uchun tashqi saqlash (Vercel Blob, Uploadthing, Cloudinary) ishlatish tavsiya qilinadi.
- **Rate limiting**: IP-based rate limit Vercel edge da ishlashi uchun qo'shimcha sozlash talab qilishi mumkin.
