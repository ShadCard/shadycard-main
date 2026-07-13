import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { rateLimit } from "../lib/rateLimit.js";

const router: IRouter = Router();

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_HOURS = 24 * 7; // 7 days

const registerRateLimit = rateLimit({
  keyPrefix: "web-register",
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "تم تجاوز عدد محاولات التسجيل. حاول بعد ساعة.",
});

const loginRateLimit = rateLimit({
  keyPrefix: "web-login",
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "تم تجاوز عدد محاولات تسجيل الدخول. حاول بعد قليل.",
});

// ---------- Helpers ----------
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function isValidUsername(username: string): boolean {
  const trimmed = username.trim();
  return trimmed.length >= 3 && trimmed.length <= 64 && /^[a-zA-Z0-9_\-.\u0600-\u06FF\s]+$/.test(trimmed);
}

function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 128;
}

function generateWebAuthToken(): string {
  return randomBytes(32).toString("hex");
}

function expiryDate(): Date {
  return new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

/**
 * Resolve the current user from a web JWT-style bearer token.
 * Returns null if no/invalid token.
 *
 * The token is sent either via:
 *   - Authorization: Bearer <token>
 *   - Cookie: shady_web_token=<token>
 *
 * The token is matched against usersTable.webAuthToken and
 * usersTable.webAuthExpiresAt must still be in the future.
 */
export async function resolveWebUser(req: Request) {
  const authHeader = req?.headers?.authorization || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  const cookieToken = parseCookie(req?.headers?.cookie || "")["shady_web_token"];
  const token = bearer || cookieToken || "";
  if (!token) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.webAuthToken, token))
    .limit(1);
  if (!user) return null;

  if (user.banned) return null;
  if (user.webAuthExpiresAt && new Date(user.webAuthExpiresAt).getTime() < Date.now()) {
    return null;
  }
  return user;
}

function parseCookie(cookieHeader: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

// ---------- Routes ----------

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 * Creates a new web user. The user is created with a synthetic telegram_id
 * (prefixed with "web_") so the same users table can serve both Telegram and web.
 */
router.post("/auth/register", registerRateLimit, async (req, res) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!isValidUsername(username || "")) {
    res.status(400).json({ error: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل وحتى 64 حرفاً" });
    return;
  }
  if (!isValidEmail(email || "")) {
    res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
    return;
  }
  if (!isValidPassword(password || "")) {
    res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    return;
  }

  // Check email uniqueness
  const [existingByEmail] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email!.toLowerCase()))
    .limit(1);
  if (existingByEmail) {
    res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل بالفعل" });
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password!, BCRYPT_ROUNDS);

  // Synthetic telegramId: "web_" prefix + 10 hex chars (unique enough for our purposes)
  // We use randomBytes to avoid collisions with real Telegram IDs (which are numeric).
  const synthId = "web_" + randomBytes(8).toString("hex");

  const token = generateWebAuthToken();
  const expiresAt = expiryDate();

  const insertResult = await db.insert(usersTable).values({
    telegramId: synthId,
    username: username!.trim(),
    email: email!.toLowerCase(),
    passwordHash,
    balanceUsd: "0",
    balanceSyp: "0",
    role: "user",
    banned: false,
    vipLevel: 0,
    webAuthToken: token,
    webAuthExpiresAt: expiresAt,
    lastLoginAt: new Date(),
  });
  const insertId = Number((insertResult as unknown as { insertId?: number }).insertId ?? 0);
  const [created] = await db.select().from(usersTable).where(eq(usersTable.id, insertId)).limit(1);

  setAuthCookie(res, token, expiresAt);
  res.status(201).json({
    user: publicUser(created),
    token,
    expiresAt: expiresAt.toISOString(),
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/auth/login", loginRateLimit, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }
  if (user.banned) {
    res.status(403).json({ error: "تم حظر هذا الحساب. تواصل مع الدعم." });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    return;
  }

  // Generate new token
  const token = generateWebAuthToken();
  const expiresAt = expiryDate();
  await db.update(usersTable).set({ webAuthToken: token, webAuthExpiresAt: expiresAt, lastLoginAt: new Date() }).where(eq(usersTable.id, user.id));
  const [updated] = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);

  setAuthCookie(res, token, expiresAt);
  res.json({ user: publicUser(updated!), token, expiresAt: expiresAt.toISOString() });
});

/**
 * POST /api/auth/logout
 * Clears the auth token server-side and the cookie client-side.
 */
router.post("/auth/logout", async (req, res) => {
  // Try to find the user by token and clear it
  const authHeader = req?.headers?.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  const cookieToken = parseCookie(req?.headers?.cookie || "")["shady_web_token"];
  const token = bearer || cookieToken || "";
  if (token) {
    const [user] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.webAuthToken, token))
      .limit(1);
    if (user) {
      await db
        .update(usersTable)
        .set({ webAuthToken: null, webAuthExpiresAt: null })
        .where(eq(usersTable.id, user.id));
    }
  }
  res.clearCookie("shady_web_token");
  res.json({ ok: true });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated web user (or 401).
 */
router.get("/auth/me", async (req, res) => {
  const user = await resolveWebUser(req);
  if (!user) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  res.json({ user: publicUser(user) });
});

// ---------- Utilities ----------

function setAuthCookie(res: Response, token: string, expiresAt: Date) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("shady_web_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: expiresAt,
    path: "/",
  });
}

function publicUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    balanceUsd: u.balanceUsd,
    balanceSyp: u.balanceSyp,
    role: u.role,
    banned: u.banned,
    vipLevel: u.vipLevel,
    createdAt: u.createdAt,
  };
}

export default router;
