import { Router, type IRouter } from "express";
import { db, paymentMethodsTable, settingsTable, socialLinksTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import { ListPaymentMethodsResponse, ListSocialLinksResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/payment-methods", async (_req, res) => {
  const rows = await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.active, true));
  res.json(
    ListPaymentMethodsResponse.parse(
      rows.map((m) => ({
        id: String(m.id),
        code: m.code as "sham_cash" | "sham_cash_auto" | "binance_pay" | "syriatel_cash" | "mtn_cash" | "usdt_auto",
        name: m.name,
        subtitle: m.subtitle,
        instructions: m.instructions ?? undefined,
        walletAddress: m.walletAddress ?? undefined,
        logoImage: m.logoImage ?? undefined,
        qrImage: m.qrImage ?? undefined,
        minAmount: Number(m.minAmount),
        active: m.active,
      })),
    ),
  );
});

router.get("/social-links", async (_req, res) => {
  const rows = await db.select().from(socialLinksTable).orderBy(asc(socialLinksTable.order));
  res.json(
    ListSocialLinksResponse.parse(
      rows.map((s) => ({ id: String(s.id), platform: s.platform, url: s.url, label: s.label })),
    ),
  );
});

router.get("/theme", async (_req, res) => {
  const rows = await db.select().from(settingsTable);
  const map = new Map(rows.map((row) => [row.key, row.value]));

  const normalizeThemeColor = (key: string, fallback: string, legacyValues: string[] = []) => {
    const value = String(map.get(key) || fallback).trim();
    return legacyValues.includes(value.toLowerCase()) ? fallback : value;
  };

  res.json({
    primary: normalizeThemeColor("theme_primary", "#58E8FF", ["#0052cc"]),
    accent: normalizeThemeColor("theme_accent", "#D94CFF", ["#f97316"]),
    background: normalizeThemeColor("theme_bg", "#07091B", ["#0a1628"]),
    font: String(map.get("theme_font") || "Cairo"),
    radius: String(map.get("theme_radius") || "16"),
  });
});

// Public endpoint: returns current maintenance state (used by frontend before any request)
router.get("/maintenance-status", async (_req, res) => {
  const [row] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "maintenance_mode"))
    .limit(1);
  const enabled =
    row?.value === true || row?.value === "true" || row?.value === 1;

  const [titleRow] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "maintenance_title"))
    .limit(1);
  const [msgRow] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.key, "maintenance_message"))
    .limit(1);

  res.json({
    enabled,
    title: titleRow?.value || "الموقع قيد الصيانة المؤقتة",
    message:
      msgRow?.value ||
      "نعمل حاليًّا على تنفيذ مجموعة من أعمال الصيانة والتحديث لتحسين أداء الموقع، وتعزيز مستوى الأمان، وتطوير تجربة المستخدم بشكل أفضل. نعتذر عن أي إزعاج قد يسببه ذلك، ونرجو منكم التفضل بالعودة لاحقًا.",
  });
});

export default router;
