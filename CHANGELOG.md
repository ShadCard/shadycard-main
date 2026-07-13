# Changelog

جميع التغييرات الجوهرية على المشروع تُسجَّل هنا مع رقم الإصدار.
عند كل تحديث من المحادثة، استخدم رقم الإصدار لمتابعة التغييرات.

---

## [2.1.0] — 2026-07-13

### Fixed
- **`lib/db/src/schema/index.ts`**: استبدال جميع استدعاءات `defaultNow()` بـ `default(sql\`CURRENT_TIMESTAMP\`)` (12 موضع)
  - السبب: Drizzle ORM مع MySQL لا يدعم `defaultNow()` على `datetime()`، فقط على `timestamp()`
  - أضيف `import { sql } from "drizzle-orm"` في أعلى الملف
  - يحل خطأ TypeScript: `TS2551: Property 'defaultNow' does not exist on type 'NotNull<MySqlDateTimeBuilderInitial<...>>'`

---

## [2.0.0] — 2026-07-13 (الإصدار الأولي)

### Added
- إعادة تسمية العلامة التجارية XPayStore → ShadyCard (61 ملف، 99 استبدال)
- إعادة تسمية المجلدات `xpay-store` → `shady-store`, `xpay-admin` → `shady-admin`
- التحويل من PostgreSQL (Neon) إلى MySQL 8.0+ (Drizzle ORM + mysql2)
- إعادة كتابة استعلامات SQL الخامة (إزالة `::`, `ILIKE`, `to_char`, `date_trunc`, `generate_series`, `filter (where ...)`)
- إنشاء ملف ترحيل SQL كامل `lib/db/drizzle/0000_shadycard_initial_mysql.sql`
- نظام مصادقة الموقع الجديد:
  - `POST /api/auth/register` — إنشاء حساب (bcrypt + JWT)
  - `POST /api/auth/login` — تسجيل دخول
  - `POST /api/auth/logout` — تسجيل خروج
  - `GET /api/auth/me` — بيانات المستخدم الحالي
- صفحة `AuthPage` (`artifacts/shady-store/src/pages/auth.tsx`) بأسلوب ShadyCard
- صفحة `MaintenancePage` (`artifacts/shady-store/src/pages/maintenance.tsx`) بالمحتوى العربي المطلوب
- endpoint جديد: `GET /api/maintenance-status` (عام)
- middleware لوضع الصيانة في `app.ts`
- ملف `lib/web-auth.ts` للمتجر (helpers للمصادقة في كلا الوضعين)
- تحديث `currentUser.ts` لدعم Web JWT + Telegram
- تحديث `custom-fetch.ts` لإرفاق web JWT تلقائياً
- تحديث `Maintenance.tsx` في الأدمن (زر يعمل + معاينة حية)
- تحديث `App.tsx` للمتجر لـ 4 حالات (loading/auth/ready/maintenance)
- تحديث `main.tsx` للتمييز Telegram/Web
- ملفات `.env.example` شاملة لكل تطبيق
- ملف `SHADYCARD_FINAL_DOCS.md` (35 KB توثيق كامل)
- ملف `README.md` احترافي للمستودع
- ملف `LICENSE` (MIT)
- تحديث `.gitignore` لاستثناء `.env`

### Changed
- `lib/db/src/index.ts`: `pg.Pool` → `mysql2.createPool`
- `lib/db/src/schema/index.ts`: `pgTable` → `mysqlTable`, `pgEnum` → `mysqlEnum`, `numeric` → `decimal`, `jsonb` → `json`, `serial` → `int().autoincrement()`
- `lib/db/drizzle.config.ts`: `dialect: "postgresql"` → `dialect: "mysql"`
- `lib/db/package.json`: استبدال `pg` + `@types/pg` بـ `mysql2`
- `artifacts/api-server/package.json`: إضافة `cookie-parser`
- `artifacts/api-server/src/app.ts`: إضافة `cookieParser()` + middleware الصيانة
- `artifacts/shady-store/vite.config.ts` + `artifacts/shady-admin/vite.config.ts`: جعل `PORT` و `BASE_PATH` اختيارية
- `replit.md`: تحديث للإشارة إلى MySQL بدل PostgreSQL

### Removed
- جميع مراجع `xpay`, `XPay`, `XPayStore` من الكود والـ SVGs
- ملفات الترحيل القديمة لـ PostgreSQL (`lib/db/drizzle/0000_*.sql` to `0005_*.sql`)

---

## كيفية تطبيق التحديثات

### الطريقة 1: تطبيق patch محدد (للتعديلات الصغيرة)

لكل تحديث، سأعطيك أمر `sed` جاهز. مثال:

```bash
cd /workspaces/shadycard-main

# تطبيق إصلاح v2.1.0
sed -i '/} from "drizzle-orm\/mysql-core";/a import { sql } from "drizzle-orm";' lib/db/src/schema/index.ts
sed -i 's|\.defaultNow()|.default(sql`CURRENT_TIMESTAMP`)|g' lib/db/src/schema/index.ts

# التحقق
grep -c "CURRENT_TIMESTAMP" lib/db/src/schema/index.ts  # المتوقع: 12

# Commit + Push
git add -A
git commit -m "fix(db): v2.1.0 - use default(sql\`CURRENT_TIMESTAMP\`) for MySQL"
git push origin main
```

### الطريقة 2: استبدال المشروع كاملاً (للتعديلات الكبيرة)

```bash
cd /workspaces/shadycard-main

# 1) نسخة احتياطية
git stash

# 2) حذف الملفات القديمة (إلا .git)
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name '.gitignore' ! -name '.codespaces' ! -name '.devcontainer' -exec rm -rf {} +

# 3) رفع shadycard-main.zip الجديد (اسحبه لمستكشف VS Code)

# 4) فك الضغط
unzip -q shadycard-main.zip
shopt -s dotglob && mv shadycard-main/* . && rm -rf shadycard-main shadycard-main.zip

# 5) التحقق من الإصدار
cat VERSION  # يجب أن يطابق آخر إصدار

# 6) Commit + Push
git add -A
git commit -m "chore: sync to v2.1.0"
git push origin main
```
