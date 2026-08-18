import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

type SubscribedCourse = {
  id?: string;
  _id?: string;
};

type MySubscribedCoursesResponse = {
  data?: {
    courses?: SubscribedCourse[];
  };
  courses?: SubscribedCourse[];
};

const getCourseId = (course: SubscribedCourse | undefined) =>
  course?.id || course?._id || "";

const isAppDeepLink = (path?: string) => {
  if (!path) return false;
  return (
    path.startsWith("/app/") ||
    path === "/app" ||
    path === "/profile" ||
    path === "/notifications"
  );
};

const resolvePostLoginPath = async (options?: {
  from?: string;
  token?: string | null;
  role?: string | null;
}) => {
  const { from, token, role } = options || {};
  const deepLink = isAppDeepLink(from) ? from : undefined;

  if (role === "admin") {
    return deepLink || "/app/courses";
  }

  // Keep explicit in-app deep-links (e.g. return to a protected page)
  if (deepLink && deepLink !== "/app/courses") {
    return deepLink;
  }

  try {
    const response = await apiFetch<MySubscribedCoursesResponse>("/courses/my-subscribed", {
      token: token || undefined,
    });
    const courses = response.data?.courses ?? response.courses ?? [];
    if (courses.length === 1) {
      const courseId = getCourseId(courses[0]);
      if (courseId) {
        return `/app/courses/${courseId}`;
      }
    }
  } catch {
    // Fall back to courses dashboard
  }

  return "/app/courses";
};

const Login = () => {
  const { t, lang } = useLanguage();
  const { login, token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = (location.state as { from?: string })?.from;
  const didRedirect = useRef(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || didRedirect.current) return;

    let cancelled = false;

    const redirect = async () => {
      const destination = await resolvePostLoginPath({
        from: redirectFrom,
        token,
        role: user?.role,
      });
      if (cancelled) return;
      didRedirect.current = true;
      navigate(destination, { replace: true });
    };

    void redirect();

    return () => {
      cancelled = true;
    };
  }, [navigate, redirectFrom, token, user?.role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const auth = await login(form.email, form.password);
      const destination = await resolvePostLoginPath({
        from: redirectFrom,
        token: auth.token,
        role: auth.user.role,
      });
      didRedirect.current = true;
      navigate(destination, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <p className="text-muted-foreground">
          {lang === "ar" ? "جارٍ التوجيه..." : "מפנים..."}
        </p>
      </div>
    );
  }

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
