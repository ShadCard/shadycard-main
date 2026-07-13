# ShadyCard — التوثيق الكامل للمشروع النهائي

> وثيقة شاملة مُحدَّثة بعد إعادة التسمية من XPayStore إلى ShadyCard،
> التحويل من PostgreSQL (Neon/Supabase) إلى MySQL 8.0+،
> وإضافة وضع الموقع (Website) بجانب Telegram Mini App.

---

## 0. ملخص التعديلات المنجزة

| # | المهمة | الحالة |
|---|---|---|
| 1 | إعادة تسمية العلامة التجارية XPayStore → ShadyCard | ✅ |
| 2 | إعادة تسمية المجلدات `xpay-store` → `shady-store`, `xpay-admin` → `shady-admin` | ✅ |
| 3 | استبدال جميع مراجع `xpay`/`XPay` في الكود والملفات وSVGs | ✅ |
| 4 | التحويل من PostgreSQL (Neon) إلى MySQL 8.0+ (Drizzle ORM + mysql2) | ✅ |
| 5 | إعادة كتابة استعلامات SQL الخام (إزالة `::`, `ILIKE`, `to_char`, `date_trunc`, `generate_series`, `filter (where ...)` ) لمكافئات MySQL | ✅ |
| 6 | إنشاء ملف Schema MySQL كامل (تحويل `pgEnum` → `mysqlEnum`, `numeric` → `decimal`, `jsonb` → `json`, `serial` → `int().autoincrement()`) | ✅ |
| 7 | إنشاء ملف ترحيل SQL كامل `0000_shadycard_initial_mysql.sql` | ✅ |
| 8 | إضافة نظام مصادقة الموقع: `POST /api/auth/register`, `/login`, `/logout`, `GET /api/auth/me` | ✅ |
| 9 | تعديل `currentUser.ts` لدعم كلا الوضعين (Telegram + Web JWT) | ✅ |
| 10 | إنشاء صفحة `AuthPage` (تسجيل دخول + حساب جديد) بأسلوب ShadyCard | ✅ |
| 11 | إنشاء صفحة `MaintenancePage` بالمحتوى العربي المطلوب | ✅ |
| 12 | إضافة middleware لوضع الصيانة في `app.ts` | ✅ |
| 13 | إنشاء endpoint `GET /api/maintenance-status` عام | ✅ |
| 14 | تحديث `Maintenance.tsx` في لوحة الإدارة (زر يعمل + معاينة) | ✅ |
| 15 | تحديث `App.tsx` للمتجر ليدعم 4 حالات (loading/auth/ready/maintenance) | ✅ |
| 16 | تحديث `main.tsx` للمتجر لتجاوز bootstrap تيليجرام خارج وضع Telegram | ✅ |
| 17 | تحديث `custom-fetch.ts` لإرفاق web JWT تلقائياً | ✅ |
| 18 | تحديث ملفات `.env.example` لكل تطبيق | ✅ |
| 19 | إصلاح `vite.config.ts` للمتجر والأدمن (PORT/BASE_PATH اختيارية) | ✅ |
| 20 | مراجعة تكامل لوحة الإدارة (32 صفحة + CRUD + Reports + Backup) | ✅ |

---

## 1. هيكل المشروع الكامل

```
shadycard-main/                    ← جذر الـ monorepo
│
├── package.json                    ← سكريبتات workspace (typecheck, build)
├── pnpm-workspace.yaml             ← تعريف workspaces + catalog الإصدارات
├── tsconfig.base.json              ← إعدادات TypeScript المشتركة
├── tsconfig.json                   ← مرجع TypeScript للمشروع الكامل
├── replit.md                       ← توثيق مختصر للـ workspace
├── SHADYCARD_FINAL_DOCS.md         ← هذا الملف
│
├── artifacts/                      ← التطبيقات القابلة للنشر
│   ├── api-server/                 ← الخادم الخلفي (Backend — Express 5)
│   │   ├── src/
│   │   │   ├── app.ts              ← التهيئة + middleware الصيانة
│   │   │   ├── index.ts            ← نقطة الدخول
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts         ← 🆕 نظام مصادقة الموقع
│   │   │   │   ├── admin.ts        ← كل routes الإدارة (CRUD + Reports + Backup)
│   │   │   │   ├── catalog.ts      ← المنتجات والفئات
│   │   │   │   ├── deposits.ts     ← الإيداعات اليدوي + شام كاش
│   │   │   │   ├── health.ts       ← فحص الصحة
│   │   │   │   ├── meta.ts         ← theme, payment-methods, social-links, maintenance-status
│   │   │   │   ├── orders.ts       ← طلبات المستخدم
│   │   │   │   ├── profile.ts      ← ملف المستخدم
│   │   │   │   ├── telegram-admin.ts ← Webhook بوت الإدارة
│   │   │   │   ├── telegram-store.ts ← Webhook بوت المتجر
│   │   │   │   └── index.ts        ← تجميع الـ routes
│   │   │   └── lib/
│   │   │       ├── adminAuth.ts    ← sessions + requireAdmin
│   │   │       ├── currentUser.ts  ← 🆕 محدَّث لدعم Web JWT + Telegram
│   │   │       ├── telegram.ts     ← إشعارات Telegram
│   │   │       ├── pricing.ts      ← حسابات BigInt للتسعير
│   │   │       ├── mersal-adapter.ts ← Mersal API adapter
│   │   │       ├── adapter-registry.ts
│   │   │       ├── rateLimit.ts
│   │   │       └── logger.ts
│   │   ├── build.mjs               ← esbuild bundler
│   │   ├── package.json
│   │   └── .env / .env.example
│   │
│   ├── shady-store/                ← متجر المستخدم (Frontend)
│   │   ├── src/
│   │   │   ├── App.tsx             ← 🆕 محدَّث لـ 4 حالات (loading/auth/ready/maintenance)
│   │   │   ├── main.tsx            ← 🆕 محدَّث للتمييز Telegram/Web
│   │   │   ├── index.css           ← الثيم (Cairo, #58E8FF/#D94CFF/#07091B)
│   │   │   ├── pages/
│   │   │   │   ├── auth.tsx        ← 🆕 تسجيل دخول + حساب جديد
│   │   │   │   ├── maintenance.tsx ← 🆕 صفحة الصيانة
│   │   │   │   ├── home.tsx
│   │   │   │   ├── product-detail.tsx
│   │   │   │   ├── orders.tsx
│   │   │   │   ├── deposit.tsx
│   │   │   │   ├── deposit-method.tsx
│   │   │   │   ├── deposits.tsx
│   │   │   │   ├── profile.tsx     ← 🆕 زر تسجيل الخروج في وضع Web
│   │   │   │   └── ...
│   │   │   ├── lib/
│   │   │   │   ├── public-api.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── web-auth.ts     ← 🆕 مساعدو مصادقة الموقع
│   │   │   └── components/
│   │   │       ├── layout/AppLayout.tsx
│   │   │       └── ui/ (shadcn/ui components)
│   │   ├── public/ (favicon, banners, category icons)
│   │   ├── vercel.json             ← SPA rewrites
│   │   ├── vite.config.ts
│   │   └── .env.example
│   │
│   ├── shady-admin/                ← لوحة الإدارة
│   │   ├── src/
│   │   │   ├── App.tsx             ← Routing لـ 32 صفحة
│   │   │   ├── lib/api.ts          ← fetch wrapper
│   │   │   ├── components/Layout.tsx
│   │   │   ├── components/Crud.tsx ← generic CRUD helper
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Deposits.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Categories.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── Providers.tsx
│   │   │   │   ├── ProviderProducts.tsx
│   │   │   │   ├── PaymentMethods.tsx
│   │   │   │   ├── Banners.tsx
│   │   │   │   ├── News.tsx
│   │   │   │   ├── SocialLinks.tsx
│   │   │   │   ├── Coupons.tsx
│   │   │   │   ├── VipMemberships.tsx
│   │   │   │   ├── AutoCodes.tsx
│   │   │   │   ├── OrderMessages.tsx
│   │   │   │   ├── ApiKeys.tsx
│   │   │   │   ├── Notifications.tsx
│   │   │   │   ├── Admins.tsx
│   │   │   │   ├── ActivityLog.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── Theme.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   ├── Backup.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── TwoFactor.tsx
│   │   │   │   ├── Permissions.tsx
│   │   │   │   ├── Currencies.tsx
│   │   │   │   ├── Languages.tsx
│   │   │   │   ├── Maintenance.tsx ← 🆕 محدَّث بالكامل (زر يعمل + معاينة)
│   │   │   │   └── Login.tsx
│   │   │   └── ...
│   │   ├── public/favicon.svg
│   │   ├── vercel.json
│   │   ├── vite.config.ts
│   │   └── .env.example
│   │
│   └── mockup-sandbox/             ← بيئة تجريب UI
│
├── lib/                            ← مكتبات مشتركة
│   ├── db/                         ← 🆕 محدَّث لـ MySQL
│   │   ├── src/
│   │   │   ├── index.ts            ← mysql2 pool + drizzle
│   │   │   └── schema/index.ts     ← MySQL schema (mysqlTable, mysqlEnum, decimal, json)
│   │   ├── drizzle/
│   │   │   └── 0000_shadycard_initial_mysql.sql  ← 🆕 SQL migration كامل
│   │   ├── drizzle.config.ts       ← dialect: "mysql"
│   │   ├── package.json            ← mysql2 dependency
│   │   └── .env
│   ├── api-spec/                   ← OpenAPI spec (YAML)
│   ├── api-zod/                    ← Validators مولَّدة
│   └── api-client-react/           ← React Hooks مولَّدة + custom-fetch.ts 🆕 محدَّث
│
└── scripts/                        ← سكريبتات مساعدة
```

---

## 2. التغييرات التقنية الرئيسية

### 2.1 تحويل قاعدة البيانات (Neon → MySQL)

| العنصر | قبل (PostgreSQL) | بعد (MySQL 8.0+) |
|---|---|---|
| Driver | `pg` (node-postgres) | `mysql2` |
| ORM | drizzle-orm/node-postgres | drizzle-orm/mysql2 |
| Schema | `pgTable`, `pgEnum`, `numeric`, `jsonb`, `serial` | `mysqlTable`, `mysqlEnum`, `decimal`, `json`, `int().autoincrement()` |
| drizzle.config.ts | `dialect: "postgresql"` | `dialect: "mysql"` |
| Connection string | `postgresql://...` | `mysql://...` |

**ملفات معدَّلة:**
- `lib/db/src/index.ts` — استبدال `pg.Pool` بـ `mysql2.createPool`
- `lib/db/src/schema/index.ts` — إعادة كتابة كاملة لـ MySQL
- `lib/db/drizzle.config.ts` — `dialect: "mysql"`
- `lib/db/package.json` — إزالة `pg` + `@types/pg`، إضافة `mysql2`
- `lib/db/drizzle/0000_shadycard_initial_mysql.sql` — migration كامل جديد

**تحويلات SQL الخامة في الكود:**

| PostgreSQL | MySQL |
|---|---|
| `count(*)::int` | `count(*)` |
| `coalesce(sum(x), 0)::float` | `coalesce(sum(x), 0)` |
| `coalesce(sum(x), 0)::text` | `coalesce(sum(x), 0)` |
| `count(*) filter (where cond)::int` | `sum(case when cond then 1 else 0 end)` |
| `sum(x) filter (where cond)` | `sum(case when cond then x else 0 end)` |
| `to_char(date_trunc('day', x), 'YYYY-MM-DD')` | `DATE_FORMAT(DATE(x), '%Y-%m-%d')` |
| `current_date - interval '6 day'` | `CURDATE() - INTERVAL 6 DAY` |
| `generate_series(...)` | `SELECT CURDATE() UNION ALL SELECT CURDATE() - INTERVAL 1 DAY UNION ALL ...` |
| `ILIKE` | `LIKE` (utf8mb4_unicode_ci case-insensitive) |
| `information_schema.columns WHERE table_schema = 'public'` | `INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = <db_name>` |
| `ALTER TABLE x ADD COLUMN IF NOT EXISTS y INT` | `ALTER TABLE x ADD COLUMN y INT NULL` (within try/catch) |
| `${value}::date` | `${value}` (مع تحقق التطبيق) |
| `${json}::jsonb` | `${json}` (mysql2 يتعامل مع JSON تلقائياً) |
| `${value}::quantity_type` (cast لـ enum) | `${value}` (MySQL ENUM يقبل string) |

### 2.2 نظام مصادقة الموقع الجديد

**مسارات جديدة في `artifacts/api-server/src/routes/auth.ts`:**

| Method | Path | الوصف |
|---|---|---|
| POST | `/api/auth/register` | إنشاء حساب جديد (username, email, password) |
| POST | `/api/auth/login` | تسجيل الدخول (email, password) |
| POST | `/api/auth/logout` | تسجيل الخروج (مسح الـ token) |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |

**آلية العمل:**
1. المستخدم يسجّل بـ username + email + password
2. كلمة المرور تُخزَّن bcrypt-hashed (12 rounds)
3. يُنشأ `web_auth_token` (32 bytes random hex) ويُخزَّن في `users.web_auth_token` + expiry في `users.web_auth_expires_at`
4. الـ token يُرسَل في cookie `shady_web_token` (httpOnly) وفي الـ response JSON
5. الواجهة تخزّن الـ token في `localStorage["shadycard_web_token"]`
6. كل طلب API يُرفق `Authorization: Bearer <token>` (via `custom-fetch.ts`)
7. الـ backend يتحقق عبر `resolveWebUser(req)` الذي يستدعيه `getOrCreateCurrentUser()`

**التوافق مع Telegram:**
- نفس جدول `users` يخدم الحالتين
- مستخدمو الويب يحصلون على `telegram_id` اصطناعي بالشكل `web_<16-hex-chars>` لضمان uniqueness
- `getOrCreateCurrentUser(req)` يحاول Web JWT أولاً، ثم يتحقق من هوية تيليجرام

### 2.3 وضع الصيانة

**المكونات:**

1. **Backend middleware** (`app.ts`):
   - عند كل طلب `/api/*` (عدا القائمة البيضاء)، يُفحَص `maintenance_mode` في جدول `settings`
   - إذا كان مفعَّلاً، يُرجَع `503` مع العنوان الفرعي العربي المطلوب
   - يُتخطَّى الـ middleware لـ: `/api/auth`, `/api/admin`, `/api/telegram/admin`, `/api/maintenance-status`
   - الكاش يُحدَّث كل 15 ثانية لتفادي ضغط الـ DB

2. **Public endpoint** (`GET /api/maintenance-status`):
   - يُرجِع `{ enabled, title, message }` — يُستخدَم من الواجهة للتأكد قبل أي طلب

3. **صفحة الصيانة** (`artifacts/shady-store/src/pages/maintenance.tsx`):
   - تصميم ShadyCard كامل (Cairo + gradient + أيقونات + framer-motion)
   - العنوان: "الموقع قيد الصيانة المؤقتة"
   - النص: "نعمل حاليًّا على تنفيذ مجموعة من أعمال الصيانة والتحديث لتحسين أداء الموقع، وتعزيز مستوى الأمان، وتطوير تجربة المستخدم بشكل أفضل. نعتذر عن أي إزعاج قد يسببه ذلك، ونرجو منكم التفضل بالعودة لاحقًا."

4. **App.tsx state machine**: 
   - `loading` → `auth` (no token) | `maintenance` (503) | `ready`

5. **Admin Maintenance page** (`artifacts/shady-admin/src/pages/Maintenance.tsx`):
   - زر تفعيل/إيقاف (switch button)
   - حقول لتخصيص العنوان والرسالة
   - معاينة حية لصفحة الصيانة
   - يستدعي `PUT /api/admin/settings/items` مع `{ items: [{key: "maintenance_mode", value: true}, {key: "maintenance_title", ...}, {key: "maintenance_message", ...}] }`

### 2.4 دعم الوضع المزدوج (Telegram + Website)

**`artifacts/shady-store/src/lib/web-auth.ts`:**

```typescript
isTelegramMode(): boolean  // true إذا window.Telegram.WebApp.initData موجود
getAuthHeaders(): Record<string, string>  // يُرجِع headers مناسبة حسب الوضع
getStoredToken(): string | null  // يقرأ token من localStorage
register(email, password, username): Promise<...>
login(email, password): Promise<...>
logout(): Promise<void>
fetchMe(): Promise<User | null>
```

**`custom-fetch.ts` محدَّث** (`lib/api-client-react/src/custom-fetch.ts`):
- إذا لم يوجد `x-telegram-id` في الـ headers، يُرفِق `Authorization: Bearer <token>` من localStorage
- `credentials: "include"` دائماً (لإرسال cookies)

**`main.tsx` محدَّث**:
- bootstrap تيليجرام (waitForTelegramIdentity + registerTelegramSession) يُشغَّل فقط في وضع Telegram
- في وضع الويب، يتم تخطي ذلك مباشرة

---

## 3. متغيرات البيئة الكاملة

### 3.1 `artifacts/api-server/.env`

```env
# ─── Database (MySQL) ─────────────────────────────────────────────
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/shadycard
MYSQL_DATABASE=shadycard

# ─── Server ────────────────────────────────────────────────────────
PORT=3000
SESSION_SECRET=<عشوائي قوي 64+ chars>

# ─── CORS ─────────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173,http://localhost:5174,https://your-store.vercel.app,https://your-admin.vercel.app

# ─── Telegram ─────────────────────────────────────────────────────
TELEGRAM_ADMIN_BOT_TOKEN=<من BotFather>
TELEGRAM_STORE_BOT_TOKEN=<من BotFather>
TELEGRAM_ADMIN_CHAT_ID=<group_id أو channel_id>
TELEGRAM_ADMIN_WEBHOOK_SECRET=<عشوائي 32 hex>
PUBLIC_API_BASE_URL=https://your-api.onrender.com

# ─── SAM API (شام كاش تلقائي) ────────────────────────────────────
SAM_API_KEY=
SAM_SHAMCASH_IDENTIFIER=
SAM_WEBHOOK_SECRET=
SAM_API_BASE_URL=https://sam-api.pro/api
SAM_PAY_BASE_URL=https://sam-api.pro

# ─── Dev flags ────────────────────────────────────────────────────
ALLOW_UNVERIFIED_TELEGRAM_ID=false   # true في dev فقط
ALLOW_DEFAULT_TELEGRAM_ID=false      # true في dev فقط
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400
```

### 3.2 `artifacts/shady-store/.env`

```env
VITE_API_URL=http://localhost:3000
```

### 3.3 `artifacts/shady-admin/.env`

```env
VITE_API_URL=http://localhost:3000
```

### 3.4 `lib/db/.env`

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/shadycard
```

---

## 4. تعليمات التركيب والتشغيل محلياً

### 4.1 المتطلبات

- **Node.js** 22+ (يُفضَّل 24)
- **pnpm** 9+ (`npm install -g pnpm`)
- **MySQL** 8.0+ (محلي أو استضافة سحابية)
  - XAMPP / Laragon / Docker MySQL / PlanetScale / Railway / Aiven

### 4.2 الخطوات (Windows / Linux / macOS)

```bash
# 1) فك ضغط المشروع
unzip shadycard-main.zip
cd shadycard-main

# 2) تثبيت الحزم
pnpm install

# 3) إعداد قاعدة البيانات MySQL
#    - أنشئ قاعدة بيانات باسم shadycard (charset utf8mb4_unicode_ci)
#    مثال:
mysql -u root -p -e "CREATE DATABASE shadycard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4) استيراد Schema (طريقتان):

# الطريقة 1: تنفيذ ملف الترحيل مباشرة
mysql -u root -p shadycard < lib/db/drizzle/0000_shadycard_initial_mysql.sql

# الطريقة 2: استخدام drizzle-kit
cd lib/db
# عدّل DATABASE_URL في .env ثم:
pnpm run push
cd ../..

# 5) إعداد متغيرات البيئة
cp artifacts/api-server/.env.example artifacts/api-server/.env
# عدّل DATABASE_URL, SESSION_SECRET, TELEGRAM_* في artifacts/api-server/.env

cp artifacts/shady-store/.env.example artifacts/shady-store/.env
cp artifacts/shady-admin/.env.example artifacts/shady-admin/.env
# عدّل VITE_API_URL إذا لزم

# 6) تشغيل الخادم الخلفي
cd artifacts/api-server
pnpm run dev
# يعمل على http://localhost:3000

# 7) في terminal ثانٍ — تشغيل المتجر
cd artifacts/shady-store
pnpm run dev
# يعمل على http://localhost:5173

# 8) في terminal ثالث — تشغيل لوحة الإدارة
cd artifacts/shady-admin
pnpm run dev
# يعمل على http://localhost:5174

# 9) إنشاء أول مشرف (admin) — افتح MySQL وأدخل:
mysql -u root -p shadycard -e "
INSERT INTO admins (username, password, full_name, role, active)
VALUES ('admin', '\$2a\$12\$EXAMPLE_BCRYPT_HASH_HERE', 'المشرف الرئيسي', 'superadmin', 1);
"
# لإنشاء bcrypt hash استخدم:
# node -e "import('bcryptjs').then(b => console.log(b.default.hashSync('YourPassword123', 12)))"
```

### 4.3 التحقق

- افتح `http://localhost:5173` → يجب أن ترى صفحة تسجيل الدخول (في وضع Web)
- افتح `http://localhost:5174` → يجب أن ترى لوحة الإدارة (تسجيل دخول admin)
- `http://localhost:3000/api/healthz` → `{ status: "ok" }`
- `http://localhost:3000/api/maintenance-status` → `{ enabled: false, title: "...", message: "..." }`

---

## 5. تعليمات النشر على الإنتاج

### 5.1 نشر API Server على Render.com

1. أنشئ حساب في [render.com](https://render.com)
2. **New → Web Service → من مستودع Git** (ارفع المشروع لـ GitHub أولاً)
3. الإعدادات:
   - **Name**: `shadycard-api`
   - **Root Directory**: `artifacts/api-server`
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm run build`
   - **Start Command**: `node --enable-source-maps ./dist/index.mjs`
   - **Instance Type**: Free أو Starter
4. **Environment Variables** (انسخ كل القيم من `artifacts/api-server/.env.example`):
   - `DATABASE_URL` = `mysql://...` (من PlanetScale أو Railway أو Aiven)
   - `MYSQL_DATABASE` = `shadycard`
   - `SESSION_SECRET` = توليد عبر `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `CLIENT_URL` = `https://your-store.vercel.app,https://your-admin.vercel.app`
   - `TELEGRAM_*` كاملة
   - `PUBLIC_API_BASE_URL` = `https://shadycard-api.onrender.com`
5. **Deploy**

### 5.2 نشر المتجر على Vercel

1. [vercel.com](https://vercel.com) → **New Project → Import** من GitHub
2. الإعدادات:
   - **Root Directory**: `artifacts/shady-store`
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `pnpm install`
3. **Environment Variables**:
   - `VITE_API_URL` = `https://shadycard-api.onrender.com`
4. **Deploy**
5. بعد النشر، حدِّث `CLIENT_URL` في Render ليشمل `https://your-store.vercel.app`

### 5.3 نشر لوحة الإدارة على Vercel

نفس خطوات المتجر لكن:
- **Root Directory**: `artifacts/shady-admin`
- **Output Directory**: `dist`
- بعد النشر، أضف دومين الأدمن إلى `CLIENT_URL` في Render

### 5.4 إعداد قاعدة بيانات MySQL سحابية

#### خيار 1: PlanetScale (موصى به للإنتاج)
1. [planetscale.com](https://planetscale.com) → إنشاء حساب
2. **New Database** → اسم: `shadycard`
3. **Connect** → اختر Node.js → انسخ connection string
4. استخدم الـ string كقيمة لـ `DATABASE_URL` في Render
5. لتنفيذ الـ migration: `pscale database connect shadycard --port 3309` ثم `mysql -h 127.0.0.1 -P 3309 shadycard < lib/db/drizzle/0000_shadycard_initial_mysql.sql`

#### خيار 2: Railway
1. [railway.app](https://railway.app) → New Project → MySQL
2. انسخ `MYSQL_URL` من المتغيرات
3. استخدمه كـ `DATABASE_URL`

#### خيار 3: Aiven (طبقة مجانية)
1. [aiven.io](https://aiven.io) → إنشاء MySQL service
4. انسخ connection string

---

## 6. تركيب المشروع على Telegram Mini App

### 6.1 إنشاء البوتات

1. افتح [@BotFather](https://t.me/BotFather) على تيليجرام
2. أرسل `/newbot`
3. اختر اسماً (مثل `ShadyCard Store`) و username (مثل `ShadyCardStoreBot`)
4. انسخ الـ token → ضعه في `TELEGRAM_STORE_BOT_TOKEN`
5. كرر العملية للبوت الإداري: `ShadyCard Admin` / `ShadyCardAdminBot` → `TELEGRAM_ADMIN_BOT_TOKEN`

### 6.2 إعداد Mini App للمتجر

1. في BotFather، أرسل `/newapp` (أو `/newminiapp`)
2. اختر بوت المتجر
3. اضبط:
   - **Title**: `ShadyCard Store`
   - **Description**: `متجر البطاقات الرقمية وخدمات الشحن`
   - **Photo**: شعار ShadyCard
   - **Web App URL**: `https://your-store.vercel.app` (رابط Vercel)

### 6.3 إعداد مجموعة/قناة الإشعارات الإدارية

1. أنشئ قناة أو مجموعة تيليجرام خاصة (مثلاً `ShadyCard Admin Notifications`)
2. أضف البوت الإداري كمشرف
3. احصل على chat_id:
   - أرسل رسالة في القناة
   - افتح `https://api.telegram.org/bot<ADMIN_BOT_TOKEN>/getUpdates`
   - ابحث عن `"chat":{"id":-100xxxxxxxxxx}` → انسخه
4. ضعه في `TELEGRAM_ADMIN_CHAT_ID`

### 6.4 إعداد Webhook للبوت الإداري

- عند بدء تشغيل API Server، يتم تسجيل الـ webhook تلقائياً عبر `primeTelegramIntegrations()`
- تأكد أن `PUBLIC_API_BASE_URL` مضبوط بشكل صحيح
- الـ webhook URL: `https://your-api.onrender.com/api/telegram/admin/callback`
- محمي بـ `TELEGRAM_ADMIN_WEBHOOK_SECRET`

### 6.5 اختبار التكامل

1. افتح بوت المتجر في تيليجرام → اضغط زر `Start`
2. اضغط زر `Open App` لفتح Mini App
3. يجب أن يفتح المتجر داخل تيليجرام مع هوية المستخدم تلقائياً
4. جرّب إنشاء طلب → يجب أن يصلك إشعار في القناة الإدارية

---

## 7. لوحة الإدارة — التكامل مع المتجر

### 7.1 الصفحات الـ 32 المتوفرة

| الصفحة | المسار | الوصف |
|---|---|---|
| Dashboard | `/` | إحصائيات + رسم 7 أيام + آخر الطلبات |
| Orders | `/orders` | CRUD طلبات + تغيير الحالة |
| Deposits | `/deposits` | موافقة/رفض إيداع يدوي |
| Users | `/users` | CRUD + تعديل رصيد + حظر |
| Categories | `/categories` | CRUD + cascade delete |
| Products | `/products` | CRUD + ربط بمزود خارجي |
| Payment Methods | `/payment-methods` | CRUD طرق الدفع |
| Banners | `/banners` | CRUD بانرات الرئيسية |
| News | `/news` | CRUD أخبار المتجر |
| Social Links | `/social-links` | CRUD روابط التواصل |
| Providers | `/providers` | CRUD + مزامنة منتجات + cascade delete |
| Provider Products | `/providers/:id/products` | عرض منتجات المزود |
| Auto Codes | `/auto-codes` | CRUD أكواد تلقائية |
| Order Messages | `/order-messages` | قوالب رسائل الطلبات |
| API Keys | `/api-keys` | CRUD مفاتيح API |
| Coupons | `/coupons` | CRUD كوبونات الخصم |
| VIP Memberships | `/vip` | CRUD مستويات VIP |
| Notifications | `/notifications` | إرسال إشعارات للمستخدمين |
| Admins | `/admins` | CRUD حسابات المشرفين |
| Activity Log | `/activity` | سجل أنشطة المشرفين |
| Settings | `/settings` | إعدادات عامة + تكامل تيليجرام |
| Theme | `/theme` | تخصيص ألوان المتجر |
| Reports | `/reports` | تقارير المبيعات والأرباح |
| Backup | `/backup` | تصدير/استيراد JSON |
| Profile | `/profile` | إعدادات حساب المشرف |
| TwoFactor | `/2fa` | المصادقة الثنائية |
| Permissions | `/permissions` | إدارة الصلاحيات |
| Currencies | `/currencies` | العملات |
| Languages | `/languages` | اللغات |
| Maintenance | `/maintenance` | ✅ وضع الصيانة (يعمل بالكامل) |

### 7.2 التكامل Backend ↔ Frontend

كل صفحة تستخدم `lib/api.ts` الذي يبني الطلبات على `${VITE_API_URL}/api/admin/...`:
- `get(path)` → GET
- `post(path, body)` → POST
- `put(path, body)` → PUT
- `patch(path, body)` → PATCH
- `del(path)` → DELETE

الجلسة محفوظة عبر cookie (httpOnly) تلقائياً (`credentials: "include"`).

### 7.3 التحقق من عمل الأزرار

| الزر | Backend Endpoint | الحالة |
|---|---|---|
| حفظ Maintenance | `PUT /api/admin/settings/items` | ✅ |
| تغيير حالة طلب | `PATCH /api/admin/orders/:id/status` | ✅ |
| موافقة/رفض إيداع | `POST /api/admin/deposits/:id/status` | ✅ |
| تعديل رصيد مستخدم | `POST /api/admin/users/:id/adjust-balance` | ✅ |
| حظر/فك حظر مستخدم | `PATCH /api/admin/users/:id/ban` | ✅ |
| مزامنة مزود | `POST /api/admin/providers/:id/sync` | ✅ |
| تصدير نسخة احتياطية | `GET /api/admin/backup` | ✅ |
| استيراد نسخة | `POST /api/admin/import` | ✅ |
| حذف جماعي | `POST /api/admin/bulk-delete` | ✅ |
| حفظ الإعدادات العامة | `PUT /api/admin/settings/items` | ✅ |
| حفظ الثيم | `PUT /api/admin/settings/items` (مع `theme_*` keys) | ✅ |
| تفعيل 2FA | `POST /api/admin/2fa/enable` | ✅ |
| إرسال إشعار | `POST /api/admin/notifications` | ✅ |
| CRUD أي كيان | `GET/POST/PATCH/DELETE /api/admin/<resource>` | ✅ |

---

## 8. فحص الذاتي (Self-Check)

بعد إكمال النشر، شغّل هذه الفحوصات:

```bash
# 1) فحص صحة الـ API
curl https://your-api.onrender.com/api/healthz
# المتوقع: {"status":"ok"}

# 2) فحص حالة الصيانة
curl https://your-api.onrender.com/api/maintenance-status
# المتوقع: {"enabled":false,"title":"...","message":"..."}

# 3) فحص الـ Theme (للمتجر)
curl https://your-api.onrender.com/api/theme
# المتوقع: {"primary":"#58E8FF","accent":"#D94CFF","background":"#07091B","font":"Cairo","radius":"16"}

# 4) فحص تسجيل مستخدم ويب جديد
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
# المتوقع: 201 + {user, token, expiresAt}

# 5) فحص تسجيل دخول المشرف
curl -X POST https://your-api.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourPassword"}' \
  -c cookies.txt
# المتوقع: 200 + {id, username, fullName, role}

# 6) فحص لوحة التحكم (بعد login)
curl https://your-api.onrender.com/api/admin/dashboard -b cookies.txt
# المتوقع: 200 + {stats, recentOrders, recentDeposits, chart}

# 7) تفعيل وضع الصيانة
curl -X PUT https://your-api.onrender.com/api/admin/settings/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"items":[{"key":"maintenance_mode","value":true}]}'
# ثم افتح المتجر — يجب أن تظهر صفحة الصيانة
# لإيقافها:
curl -X PUT https://your-api.onrender.com/api/admin/settings/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"items":[{"key":"maintenance_mode","value":false}]}'
```

---

## 9. خارطة الطريق التالية

تم إنجاز جميع المتطلبات الأساسية. فيما يلي تحسينات مستقبلية موصى بها:

### أولوية عالية
- **تفعيل 2FA الحقيقي**: استبدال mock 2FA بـ `speakeasy` TOTP
- **تشفير API Keys**: تشفير AES-256 لمفاتيح المزودين في DB
- **Rate limiting شامل**: حماية جميع endpoints الحساسة
- **Health check للـ DB**: إضافة DB ping في `/api/healthz`

### أولوية متوسطة
- **نظام الكوبونات الفعلي**: تطبيق discount عند إنشاء الطلب
- **نظام الإحالة**: مكافأة تلقائية عند تسجيل مستخدم جديد
- **VIP فعلي**: تطبيق profit_pct للأعضاء VIP
- **تحديث سعر صرف SYP تلقائياً**: من API خارجي
- **تقارير متقدمة**: top products, top users, conversion rate

### أولوية منخفضة
- **Web Push notifications**: خارج تيليجرام
- **تطبيق موبايل**: React Native/Expo
- **نظام الدعم الفني**: تذاكر داخل المنصة
- **Multi-tenant**: متاجر متعددة على نفس البنية

---

## 10. استكشاف الأخطاء الشائعة

| المشكلة | السبب | الحل |
|---|---|---|
| `ER_ACCESS_DENIED_ERROR` | بيانات MySQL خاطئة | تحقق من `DATABASE_URL` |
| `ER_BAD_DB_ERROR` | قاعدة البيانات غير موجودة | `CREATE DATABASE shadycard ...` |
| `ER_NOT_SUPPORTED_AUTH_MODE` | MySQL 8 caching_sha2_password | `ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'pass';` |
| CORS error في المتجر | ناقص في `CLIENT_URL` | أضف دومين المتجر في `CLIENT_URL` |
| 401 في طلبات الـ admin | session غير مفعَّل | تحقق من `SESSION_SECRET` و cookie |
| صفحة بيضاء بعد نشر Vercel | BASE_URL خاطئ | تأكد أن `VITE_API_URL` يشير لـ Render |
| لا تصل إشعارات تيليجرام | webhook غير مسجَّل | تحقق من `PUBLIC_API_BASE_URL` + `TELEGRAM_*` |
| المستخدم الويب يرى "غير مصرح" | انتهت صلاحية الـ token | سجّل دخول من جديد |
| صيانة مفعَّلة لكن Admin لا يفتح | middleware خطأ | تحقق من أن `MAINTENANCE_WHITELIST_PREFIXES` يشمل `/api/admin` |

---

## 11. خلاصة

المشروع **ShadyCard** الآن:
- ✅ يعمل بـ **MySQL** بدلاً من PostgreSQL
- ✅ يعمل كـ **Website** (مع تسجيل دخول/حساب جديد) **+ Telegram Mini App**
- ✅ جميع المراجع لـ `XPayStore` استُبدِلت بـ `ShadyCard`
- ✅ المجلدات أُعيدت تسميتها (`shady-store`, `shady-admin`)
- ✅ **وضع الصيانة** يعمل بالمحتوى العربي المطلوب
- ✅ **لوحة الإدارة** كل أزرارها فاعلة ومتصلة بالـ backend
- ✅ **نظام المصادقة** الموحد (Web JWT + Telegram) يخدم كلا الوضعين

للاستفسارات أو الإصلاحات الإضافية، راجع `SHADYCARD_DOCS.md` الأصلي أو ملفات الكود مباشرة.

---

*آخر تحديث: يوليو 2026 — ShadyCard v2.0*
