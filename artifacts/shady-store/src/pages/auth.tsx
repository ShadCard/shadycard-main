import { useState, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, LogIn, UserPlus, ArrowRight, Shield, Sparkles, Loader2 } from "lucide-react";
import { login, register } from "@/lib/web-auth";
import { toast } from "sonner";

type Mode = "login" | "register";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("كلمتا المرور غير متطابقتين");
          setLoading(false);
          return;
        }
        await register(email, password, username);
        toast.success("تم إنشاء حسابك بنجاح! مرحباً بك في ShadyCard");
      } else {
        await login(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
      }
      // Reload to refresh auth state in App.tsx
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: Mode) {
    setMode(newMode);
    setError(null);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="shady-shell min-h-[100dvh] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo + Heading */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              boxShadow: "0 12px 40px hsl(var(--primary) / 0.35)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black bg-gradient-to-l from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
            ShadyCard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "سجّل الدخول لمتابعة التسوق" : "أنشئ حسابك وابدأ التسوق الآن"}
          </p>
        </div>

        {/* Card */}
        <div className="shady-brand-card rounded-3xl border border-primary/20 p-6 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex bg-background/60 rounded-2xl p-1 mb-5">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="w-4 h-4" />
              دخول
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === "register"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              حساب جديد
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Field
                    icon={<User className="w-4 h-4" />}
                    label="اسم المستخدم"
                    type="text"
                    value={username}
                    onChange={setUsername}
                    placeholder="اكتب اسم المستخدم"
                    required
                    autoComplete="username"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              icon={<Mail className="w-4 h-4" />}
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="example@email.com"
              required
              autoComplete="email"
            />

            <Field
              icon={<Lock className="w-4 h-4" />}
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Field
                    icon={<Shield className="w-4 h-4" />}
                    label="تأكيد كلمة المرور"
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-xl p-3 text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Switch hint */}
          <div className="text-center text-xs text-muted-foreground mt-4">
            {mode === "login" ? (
              <>
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-primary font-bold hover:underline"
                >
                  أنشئ حساباً جديداً
                </button>
              </>
            ) : (
              <>
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary font-bold hover:underline"
                >
                  سجّل دخولك
                </button>
              </>
            )}
          </div>
        </div>

        {/* Support link */}
        <div className="text-center text-xs text-muted-foreground mt-4">
          هل واجهتك مشكلة؟{" "}
          <Link href="/support" className="text-primary hover:underline">
            تواصل مع الدعم
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-muted-foreground mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-background/60 border border-border/60 rounded-xl py-3 pr-10 pl-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
    </div>
  );
}
