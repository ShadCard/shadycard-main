import { motion } from "framer-motion";
import { Wrench, ShieldCheck, Sparkles, Clock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="shady-shell min-h-[100dvh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 180 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 relative"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            boxShadow: "0 18px 60px hsl(var(--primary) / 0.40)",
          }}
        >
          <Wrench className="w-12 h-12 text-white" strokeWidth={2.2} />
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute -inset-2 rounded-3xl border-2 border-dashed border-primary/30"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-l from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent"
        >
          الموقع قيد الصيانة المؤقتة
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-foreground/80 leading-relaxed text-sm sm:text-base mb-8"
        >
          نعمل حاليًّا على تنفيذ مجموعة من أعمال الصيانة والتحديث لتحسين أداء الموقع،
          وتعزيز مستوى الأمان، وتطوير تجربة المستخدم بشكل أفضل.
          <br />
          نعتذر عن أي إزعاج قد يسببه ذلك، ونرجو منكم التفضل بالعودة لاحقًا.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <FeatureBadge icon={<ShieldCheck className="w-5 h-5" />} label="أمان أقوى" />
          <FeatureBadge icon={<Sparkles className="w-5 h-5" />} label="أداء أفضل" />
          <FeatureBadge icon={<Clock className="w-5 h-5" />} label="عودة قريبة" />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-xs text-muted-foreground"
        >
          ShadyCard — نشكرك على صبركم وثقتكم بنا
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="shady-brand-card rounded-2xl border border-primary/15 p-3 flex flex-col items-center gap-1.5">
      <div className="text-primary">{icon}</div>
      <span className="text-[11px] font-semibold text-foreground/80">{label}</span>
    </div>
  );
}
