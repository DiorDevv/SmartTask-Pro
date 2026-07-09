# Reja — Serverga qo'yish qo'llanmasi

## Talablar

- Docker va Docker Compose (tavsiya qilinadi)
- Yoki: Node.js 20+, PostgreSQL 16

## 1. Docker bilan (tavsiya qilinadi)

```bash
# 1. .env faylini yaratish
cp .env.example .env
# .env faylini ochib NEXTAUTH_SECRET, NEXTAUTH_URL va DB_PASSWORD ni sozlang

# 2. NEXTAUTH_SECRET yaratish
openssl rand -base64 32

# 3. Build va ishga tushirish
docker compose build
docker compose up -d

# 4. Migratsiya va seed (faqat birinchi marta)
docker compose exec app npx prisma db push
docker compose exec app npx tsx prisma/seed.ts

# 5. Loglarni ko'rish
docker compose logs -f
```

### Yangi versiya qo'yish
```bash
git pull
docker compose build
docker compose up -d --force-recreate
```

## 2. Docker'siz (to'g'ridan-to'g'ri)

### PostgreSQL o'rnatish
```bash
# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createuser --superuser reja
sudo -u postgres createdb reja
sudo -u postgres psql -c "ALTER USER reja WITH PASSWORD 'reja123';"
```

### Loyihani ishga tushirish
```bash
# 1. Bog'liqliklarni o'rnatish
npm ci

# 2. .env faylini sozlash
cp .env.example .env
# DATABASE_URL ni local PostgreSQL ga moslang

# 3. Prisma generatsiya va migratsiya
npx prisma generate
npx prisma db push

# 4. Ma'lumotlarni to'ldirish (ixtiyoriy)
npm run db:seed

# 5. Build
npm run build

# 6. Ishga tushirish
npm start
# Yoki PM2 bilan:
# npm i -g pm2
# pm2 start npm --name reja -- start
```

## Muhim sozlamalar

| O'zgaruvchi | Tavsif | Misol |
|---|---|---|
| `DATABASE_URL` | PostgreSQL ulanish string | `postgresql://reja:pass@postgres:5432/reja` |
| `NEXTAUTH_SECRET` | NextAuth shifrlash kaliti | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Saytning to'liq URL'i | `https://reja.example.com` |
| `AUTH_TRUST_HOST` | Proxy orqasida bo'lsa `true` | `true` |
| `DB_PASSWORD` | PostgreSQL paroli (Docker) | `reja123` |

## Tekshirish

```bash
curl http://localhost:3000
curl http://localhost:3000/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!"}'
```

## Xavfsizlik eslatmalari

- `.env` faylini hech qachon git ga qo'ymang (.gitignore da bor)
- `NEXTAUTH_SECRET` ni kuchli va noyob qilib oling
- Productionda `AUTH_TRUST_HOST=true` ni faqat proxy orqasida ishlatsangiz qo'ying
- PostgreSQL parolini kuchli qilib o'zgartiring
- SSL sertifikat qo'ying (Let's Encrypt)