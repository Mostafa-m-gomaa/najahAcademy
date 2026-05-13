import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch, resolveMediaUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ApiCourseLite {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  isPublished: boolean;
  topicsCount?: number;
}

type CoursesResponse = {
  success: boolean;
  results: number;
  data: {
    courses: ApiCourseLite[];
  };
};

type PayPlusCheckoutResponse = {
  success: boolean;
  message?: string;
  data: {
    paymentPageLink: string;
    referenceCode: string;
    pageRequestUid?: string;
  };
};

const Courses = () => {
  const { lang, t } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => apiFetch<CoursesResponse>("/courses")
  });

  const title = lang === "ar" ? "كل الدورات" : "כל הקורסים";
  const subtitle =
    lang === "ar"
      ? "تصفّح جميع الدورات، اطّلع على التفاصيل والسعر، واشترك مباشرة." 
      : "עיינו בכל הקורסים, ראו פרטים ומחיר, והירשמו.";

  const sortedCourses = useMemo(() => {
    const list = data?.data.courses ?? [];
    return list
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [data?.data.courses]);

  const checkoutMutation = useMutation({
    mutationFn: (courseId: string) =>
      apiFetch<PayPlusCheckoutResponse>(`/courses/${courseId}/subscriptions/payplus/checkout`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: (response) => {
      const link = response.data?.paymentPageLink;
      if (link) {
        window.location.href = link;
        return;
      }
      toast({
        variant: "destructive",
        title: lang === "ar" ? "رابط الدفع غير متاح" : "קישור תשלום לא זמין",
        description: lang === "ar" ? "حاول مرة أخرى لاحقًا." : "נסו שוב מאוחר יותר.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "تعذّر بدء الدفع" : "לא ניתן להתחיל תשלום",
        description: (err as Error).message,
      });
    },
  });

  const handleSubscribe = (courseId: string) => {
    if (!token) {
      toast({
        title: lang === "ar" ? "محتاج تسجّل دخول أولًا" : "יש להתחבר קודם",
        description:
          lang === "ar"
            ? "سجّل دخولك أولًا ثم جرّب الاشتراك."
            : "יש להתחבר לחשבון לפני ביצוע הרשמה לקורס.",
      });
      navigate("/login", { state: { from: `/courses` } });
      return;
    }

    if (user?.role !== "student") {
      toast({
        title: lang === "ar" ? "الاشتراك للطلاب فقط" : "ההרשמה לתלמידים בלבד",
        description:
          lang === "ar"
            ? "سجّل دخولك بحساب طالب للاشتراك في الكورس."
            : "יש להתחבר עם חשבון תלמיד כדי להירשם לקורס.",
      });
      return;
    }

    checkoutMutation.mutate(courseId);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="glass-card-glow rounded-2xl p-6 md:p-8 border border-primary/15">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">{title}</h1>
              <p className="text-muted-foreground text-lg">{subtitle}</p>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">{lang === "ar" ? "جارٍ تحميل الكورسات..." : "טוען קורסים..."}</div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 sm:auto-rows-fr gap-6 items-stretch">
              {sortedCourses.map((course, index) => {
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <div className="glass-card-glow rounded-2xl overflow-hidden h-full flex flex-col border border-primary/10">
                      <div className="h-52 md:h-56 relative overflow-hidden bg-secondary/60">
                        {course.imageUrl ? (
                          <img
                            src={resolveMediaUrl(course.imageUrl)}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            {lang === "ar" ? "بدون صورة" : "ללא תמונה"}
                          </div>
                        )}
                      </div>

                      <div className="p-5 md:p-6 flex flex-col h-full">
                        <h3 className="font-bold text-md mb-2 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{course.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          {typeof course.topicsCount === "number" ? (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {lang === "ar" ? "عدد التوبيكس" : "מספר נושאים"}: {course.topicsCount}
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5" />
                            {lang === "ar" ? "السعر" : "מחיר"}: {course.price} {t("courses.currency")}
                          </span>
                        </div>

                        <div className="mt-auto pt-2">
                          <button
                            type="button"
                            disabled={checkoutMutation.isPending && checkoutMutation.variables === course.id}
                            onClick={() => handleSubscribe(course.id)}
                            className="w-full px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
                          >
                            {checkoutMutation.isPending && checkoutMutation.variables === course.id
                              ? lang === "ar"
                                ? "جارٍ التوجيه للدفع..."
                                : "מפנים לתשלום..."
                              : lang === "ar"
                                ? "اشترك"
                                : "הירשם"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Courses;
