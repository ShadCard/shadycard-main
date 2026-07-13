import { useEffect, useState } from "react";
import { get, put } from "../lib/api";
import { PowerOff, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const DEFAULT_MAINTENANCE_TITLE = "الموقع قيد الصيانة المؤقتة";
const DEFAULT_MAINTENANCE_SUBTITLE =
  "نعمل حاليًّا على تنفيذ مجموعة من أعمال الصيانة والتحديث لتحسين أداء الموقع، وتعزيز مستوى الأمان، وتطوير تجربة المستخدم بشكل أفضل. نعتذر عن أي إزعاج قد يسببه ذلك، ونرجو منكم التفضل بالعودة لاحقًا.";

export default function Maintenance() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState(DEFAULT_MAINTENANCE_TITLE);
  const [message, setMessage] = useState(DEFAULT_MAINTENANCE_SUBTITLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get("/settings/list")
      .then((arr: any[]) => {
        const map = Object.fromEntries(arr.map((s) => [s.key, s.value]));
        setEnabled(
          map.maintenance_mode === true ||
          map.maintenance_mode === "true" ||
          map.maintenance_mode === 1,
        );
        if (map.maintenance_title) {
          setTitle(String(map.maintenance_title));
        }
        if (map.maintenance_message) {
          setMessage(String(map.maintenance_message));
        }
      })
      .catch((err) => setError(err?.message || "فشل تحميل الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await put("/settings/items", {
        items: [
          { key: "maintenance_mode", value: enabled },
          { key: "maintenance_title", value: title },
          { key: "maintenance_message", value: message },
        ],
      });
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (err: any) {
      setError(err?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin ml-2" />
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <PowerOff /> وضع الصيانة
      </h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          عند تفعيل وضع الصيانة، لن يتمكن المستخدمون من الوصول إلى المتجر.
          ستظهر لهم صفحة الصيانة بدلاً من ذلك. لوحة الإدارة تبقى متاحة دائماً
          لتتمكن من إيقاف الصيانة لاحقاً.
        </div>
      </div>

      <form
        onSubmit={save}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 max-w-2xl"
      >
        <label className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
          <span>
            <div className="font-semibold text-slate-900">تفعيل وضع الصيانة</div>
            <div className="text-xs text-slate-500 mt-0.5">
              سيتم عرض صفحة الصيانة لجميع المستخدمين في المتجر
            </div>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              enabled ? "bg-rose-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            عنوان الصيانة (يظهر للمستخدمين)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            placeholder={DEFAULT_MAINTENANCE_TITLE}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            رسالة الصيانة
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            placeholder={DEFAULT_MAINTENANCE_SUBTITLE}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
        {done && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> تم حفظ الإعدادات بنجاح
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-rose-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          حفظ
        </button>
      </form>

      {/* Preview */}
      <div className="bg-slate-900 rounded-xl p-6 max-w-2xl">
        <div className="text-xs text-slate-400 mb-3">معاينة صفحة الصيانة:</div>
        <h3 className="text-xl font-bold text-white mb-2">{title || DEFAULT_MAINTENANCE_TITLE}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {message || DEFAULT_MAINTENANCE_SUBTITLE}
        </p>
      </div>
    </div>
  );
}
