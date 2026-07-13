# ShadyCard 🛒

> منصة متجر رقمي متكاملة — بطاقات رقمية وخدمات شحن وألعاب
> تعمل بـ **Telegram Mini App** وكذلك **Website مستقل**

[![Node](https://img.shields.io/badge/Node-24-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange)](https://pnpm.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## 📋 نظرة عامة

**ShadyCard** منصة متجر رقمي متكاملة تتيح للمستخدمين شراء بطاقات رقمية وخدمات الشحن والألعاب مباشرةً، إما داخل تطبيق تيليجرام (Telegram Mini App) أو عبر موقع ويب مستقل مع تسجيل دخول تقليدي.

### المميزات الرئيسية
- 🌐 **وضعان**: Telegram Mini App + Website مستقل (تسجيل/دخول بالبريد وكلمة المرور)
- 💾 **MySQL 8.0+** كقاعدة بيانات (Drizzle ORM)
- 💳 **نظام دفع متعدد**: شام كاش (يدوي + تلقائي عبر SAM API)، Binance Pay، USDT، MTN Cash، Syriatel Cash
- 🔗 **تكامل مزودين خارجيين**: Mersal API + adapter pattern قابل للتوسعة
- 🎨 **ثيم ديناميكي**: تخصيص الألوان والخط من لوحة الإدارة
- 🛠️ **لوحة إدارة كاملة**: 32 صفحة لإدارة كل جوانب المتجر
- 🔔 **إشعارات تيليجرام فورية**: للمستخدمين والمشرفين
- 🔒 **وضع الصيانة**: تفعيل/إيقاف من لوحة الإدارة مع صفحة عربية مخصصة
- 📊 **تقارير مبيعات وأرباح**: 30 يوم + سجل تغييرات الأسعار

---

## 🏗️ هيكل المشروع

```
shadycard-main/
├── artifacts/
│   ├── api-server/          ← Backend (Express 5 + MySQL)
│   ├── shady-store/         ← Store Frontend (Vite + React + Wouter)
│   ├── shady-admin/         ← Admin Panel (Vite + React + React Router)
│   └── mockup-sandbox/      ← UI component playground
├── lib/
│   ├── db/                  ← Drizzle ORM schema + migrations (MySQL)
│   ├── api-spec/            ← OpenAPI spec (YAML)
│   ├── api-zod/             ← Generated Zod validators
│   └── api-client-react/    ← Generated React Query hooks
├── package.json
├── pnpm-workspace.yaml
└── SHADYCARD_FINAL_DOCS.md  ← 📖 التوثيق الكامل
```

---

## 🚀 التشغيل السريع

### المتطلبات
- Node.js 22+ (يُفضَّل 24)
- pnpm 9+
- MySQL 8.0+

### التركيب

```bash
# 1) استنساخ المستودع
git clone https://github.com/USERNAME/shadycard.git
cd shadycard

# 2) تثبيت الحزم
pnpm install

# 3) إنشاء قاعدة البيانات
mysql -u root -p -e "CREATE DATABASE shadycard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4) استيراد الـ Schema
mysql -u root -p shadycard < lib/db/drizzle/0000_shadycard_initial_mysql.sql

# 5) نسخ ملفات البيئة وتعديلها
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/shady-store/.env.example artifacts/shady-store/.env
cp artifacts/shady-admin/.env.example artifacts/shady-admin/.env

# عدّل DATABASE_URL و SESSION_SECRET و TELEGRAM_* في artifacts/api-server/.env

# 6) تشغيل الخدمات (في 3 terminals منفصلة)
cd artifacts/api-server && pnpm run dev   # http://localhost:3000
cd artifacts/shady-store && pnpm run dev  # http://localhost:5173
cd artifacts/shady-admin && pnpm run dev  # http://localhost:5174
```

### إنشاء أول مشرف

```bash
# توليد bcrypt hash
node -e "import('bcryptjs').then(b => console.log(b.default.hashSync('YourPassword123', 12)))"

# إدراج المشرف في قاعدة البيانات
mysql -u root -p shadycard -e "
INSERT INTO admins (username, password, full_name, role, active)
VALUES ('admin', '\$2a\$12\$YOUR_HASH_HERE', 'المشرف الرئيسي', 'superadmin', 1);
"
```

ثم افتح `http://localhost:5174` وسجّل الدخول.

---

## 📚 التوثيق الكامل

كل التفاصيل (التركيب، النشر، التكامل، استكشاف الأخطاء) موجودة في:

📖 **[SHADYCARD_FINAL_DOCS.md](./SHADYCARD_FINAL_DOCS.md)**

---

## 🌐 النشر على الإنتاج

| المكوّن | المنصة | الدليل |
|---|---|---|
| API Server | [Render.com](https://render.com) | `artifacts/api-server` + `pnpm run build` + `node ./dist/index.mjs` |
| Store Frontend | [Vercel](https://vercel.com) | `artifacts/shady-store` + Output: `dist/public` |
| Admin Panel | [Vercel](https://vercel.com) | `artifacts/shady-admin` + Output: `dist` |
| Database | PlanetScale / Railway / Aiven | MySQL 8.0+ |

---

## 🔐 الأمان

- ⚠️ **لا ترفع ملفات `.env` إلى GitHub** — ملفات `.env.example` فقط هي المتاحة
- استخدم `SESSION_SECRET` قوي (64+ chars عشوائي)
- فعّل `NODE_ENV=production` في الإنتاج
- استخدم HTTPS دائماً مع `secure: true` للـ cookies

---

## 📜 الترخيص

MIT License — راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 🤝 المساهمة

1. Fork المستودع
2. أنشئ فرع جديد: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'Add amazing feature'`
4. Push للفرع: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📞 الدعم

- 📧 البريد: support@shadycard.com
- 💬 تيليجرام: [@ShadyCardSupport](https://t.me/ShadyCardSupport)

---

*آخر تحديث: يوليو 2026 — ShadyCard v2.0*
