import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { t, lang } = useLanguage();
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string })?.from || "/app/courses";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, token]);

  if (token) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t("auth.loginTitle")}</h1>
            <p className="text-muted-foreground text-lg">{t("auth.loginSubtitle")}</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">{t("auth.email")}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t("auth.password")}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? (lang === "ar" ? "جارٍ الدخول..." : "מתחבר...") : t("auth.login")}
            </button>

            {error ? <p className="text-sm text-destructive text-center">{error}</p> : null}

            <p className="text-sm text-muted-foreground text-center">
              {t("auth.noAccount")} <Link to="/signup" className="text-primary font-semibold">{t("auth.signup")}</Link>
            </p>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
