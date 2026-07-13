import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import adminRouter from "./routes/admin";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/adminAuth";
import { primeTelegramIntegrations } from "./lib/telegram";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const app: Express = express();
app.set("trust proxy", 1);
app.disable("etag");

// طباعة قيمة CLIENT_URL عند بدء التشغيل للتشخيص
console.log("[ShadyCard] CLIENT_URL from env:", process.env.CLIENT_URL);

const allowedOrigins = process.env.CLIENT_URL?.split(",").map(s => s.trim()) || [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

console.log("[ShadyCard] Allowed Origins:", allowedOrigins);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("[ShadyCard] CORS rejected origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// ====== Maintenance mode middleware ======
// If maintenance_mode is enabled in settings, ALL public store APIs (except auth + health + admin) return 503.
// The admin panel still works so the admin can disable maintenance.
const MAINTENANCE_WHITELIST_PREFIXES = [
  "/api/auth",
  "/api/admin",   // admin panel always accessible
  "/api/telegram/admin", // admin bot callbacks still work
  "/api/maintenance-status", // public endpoint so frontend can check maintenance state
];

let maintenanceCache: { value: boolean; expiresAt: number } = { value: false, expiresAt: 0 };

async function isMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (maintenanceCache.expiresAt > now) return maintenanceCache.value;
  try {
    const [row] = await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.key, "maintenance_mode"))
      .limit(1);
    const val =
      row?.value === true || row?.value === "true" || row?.value === 1;
    maintenanceCache = { value: val, expiresAt: now + 15_000 }; // 15s cache
    return val;
  } catch {
    // If DB error, do NOT enter maintenance (avoid locking users out)
    maintenanceCache = { value: false, expiresAt: now + 5_000 };
    return false;
  }
}

app.use("/api", async (req, res, next) => {
  // Skip whitelist
  if (MAINTENANCE_WHITELIST_PREFIXES.some(p => req.path.startsWith(p))) {
    return next();
  }
  // Skip OPTIONS preflight
  if (req.method === "OPTIONS") return next();

  const maintenance = await isMaintenanceMode();
  if (!maintenance) return next();

  res.status(503).json({
    error: "maintenance_mode",
    message: "الموقع قيد الصيانة المؤقتة",
    title: "الموقع قيد الصيانة المؤقتة",
    subtitle:
      "نعمل حاليًّا على تنفيذ مجموعة من أعمال الصيانة والتحديث لتحسين أداء الموقع، وتعزيز مستوى الأمان، وتطوير تجربة المستخدم بشكل أفضل. نعتذر عن أي إزعاج قد يسببه ذلك، ونرجو منكم التفضل بالعودة لاحقًا.",
  });
});

primeTelegramIntegrations();

app.use("/api", router);
app.use("/api", adminRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  const status = Number(err?.statusCode || 500);
  const message = err?.publicMessage || err?.message || "Internal Server Error";
  if (status >= 500) console.error("Unhandled API error:", err);
  res.status(status).json({ error: message });
});

export default app;
