import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SafeMediaImage from "@/components/SafeMediaImage";
import { cn } from "@/lib/utils";

export type CoursePricingPlan = {
  id?: string;
  durationDays: number;
  price: number;
};

export type CourseSummary = {
  id: string;
  title: string;
  description: string;
  features: string[];
  pricingPlans: CoursePricingPlan[];
  imageUrl?: string;
  isPublished: boolean;
  topicsCount: number;
  /** Legacy single price when pricingPlans are missing */
  price?: number;
};

type CoursesResponse = {
  success: boolean;
  results: number;
  data: {
    courses: CourseSummary[];
  };
};

type PayPlusCheckoutResponse = {
  success: boolean;
  message?: string;
  data: {
    paymentPageLink: string;
    referenceCode?: string;
    pageRequestUid?: string;
    pricingPlan?: CoursePricingPlan & { id?: string };
  };
};

type CheckoutPayload = {
  courseId: string;
  pricingPlanId?: string;
};

const getCoursePlans = (course: CourseSummary): CoursePricingPlan[] => {
  if (course.pricingPlans?.length) return course.pricingPlans;
  if (typeof course.price === "number") {
    return [{ durationDays: 30, price: course.price }];
  }
  return [];
};

const planKey = (courseId: string, plan: CoursePricingPlan, index: number) =>
  plan.id || `${courseId}-legacy-${index}`;

const Courses = () => {
  const { lang, t } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlanByCourse, setSelectedPlanByCourse] = useState<Record<string, string>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => apiFetch<CoursesResponse>("/courses"),
  });

  const title = lang === "ar" ? "كورس ياعيل" : 'קורס יע"ל';
  const subtitle =
    lang === "ar"
      ? "استعد لامتحان ياعيل بمسار منظم، اختر مدة الاشتراك المناسبة، واشترك مباشرة."
      : 'התכוננו למבחן יע"ל במסלול מסודר, בחרו משך מנוי, והירשמו ישירות.';

  const sortedCourses = useMemo(() => {
    const list = data?.data.courses ?? [];
    return list.slice().sort((a, b) => a.title.localeCompare(b.title));
  }, [data?.data.courses]);

  useEffect(() => {
    if (!sortedCourses.length) return;

    setSelectedPlanByCourse((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const course of sortedCourses) {
        if (next[course.id]) continue;
        const plans = getCoursePlans(course);
        if (!plans.length) continue;
        next[course.id] = planKey(course.id, plans[0], 0);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [sortedCourses]);

  const checkoutMutation = useMutation({
    mutationFn: ({ courseId, pricingPlanId }: CheckoutPayload) =>
      apiFetch<PayPlusCheckoutResponse>(`/courses/${courseId}/subscriptions/payplus/checkout`, {
        method: "POST",
        body: JSON.stringify(pricingPlanId ? { pricingPlanId } : {}),
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

  const handleSubscribe = (course: CourseSummary) => {
    if (!token) {
      toast({
        title: lang === "ar" ? "محتاج تسجّل دخول أولًا" : "יש להתחבר קודם",
        description:
          lang === "ar"
            ? "سجّل دخولك أولًا ثم جرّب الاشتراك."
            : "יש להתחבר לחשבון לפני ביצוע הרשמה לקורס.",
      });
      navigate("/login");
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

    const plans = getCoursePlans(course);
    const selectedKey = selectedPlanByCourse[course.id];
    const selectedIndex = plans.findIndex((plan, index) => planKey(course.id, plan, index) === selectedKey);
    const selectedPlan = selectedIndex >= 0 ? plans[selectedIndex] : plans[0];

    if (plans.length > 1 && !selectedPlan?.id) {
      toast({
        variant: "destructive",
        title: lang === "ar" ? "اختر خطة أسعار" : "בחרו תוכנית מחיר",
        description:
          lang === "ar"
            ? "لازم تختار مدة الاشتراك قبل الدفع."
            : "יש לבחור משך מנוי לפני התשלום.",
      });
      return;
    }

    checkoutMutation.mutate({
      courseId: course.id,
      pricingPlanId: selectedPlan?.id,
    });
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 gradient-text">{title}</h1>
                  <p className="text-muted-foreground text-lg">{subtitle}</p>
                </div>
                {!token ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/signup"
                      className="px-5 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      {t("nav.signup")}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">
              {lang === "ar" ? "جارٍ تحميل الكورسات..." : "טוען קורסים..."}
            </div>
          ) : error ? (
            <div className="text-center text-destructive">{(error as Error).message}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 sm:auto-rows-fr gap-6 items-stretch">
              {sortedCourses.map((course, index) => {
                const plans = getCoursePlans(course);
                const selectedKey = selectedPlanByCourse[course.id] || (plans[0] ? planKey(course.id, plans[0], 0) : "");
                const isCheckoutPending =
                  checkoutMutation.isPending && checkoutMutation.variables?.courseId === course.id;

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
                      <SafeMediaImage
                        src={course.imageUrl}
                        alt={course.title}
                        wrapperClassName="h-52 md:h-56 relative overflow-hidden bg-secondary/60"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />

                      <div className="p-5 md:p-6 flex flex-col h-full">
                        <h3 className="font-bold text-md mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{course.description}</p>

                        {typeof course.topicsCount === "number" ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                            <Clock className="w-3.5 h-3.5" />
                            {lang === "ar" ? "عدد المحاضرات المسجلة" : "מספר הרצאות מוקלטות"}: {course.topicsCount}
                          </div>
                        ) : null}

                        {course.features?.length ? (
                          <ul className="mb-4 space-y-1.5">
                            {course.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm text-foreground/85">
                                <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {plans.length ? (
                          <div className="mb-4 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {lang === "ar" ? "اختر خطة الاشتراك" : "בחרו תוכנית מנוי"}
                            </p>
                            <div className="grid gap-2">
                              {plans.map((plan, planIndex) => {
                                const key = planKey(course.id, plan, planIndex);
                                const isSelected = selectedKey === key;

                                return (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() =>
                                      setSelectedPlanByCourse((prev) => ({
                                        ...prev,
                                        [course.id]: key,
                                      }))
                                    }
                                    className={cn(
                                      "w-full rounded-xl border px-3 py-2.5 text-start transition-all",
                                      isSelected
                                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                        : "border-border bg-secondary/40 hover:border-primary/40"
                                    )}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-semibold text-foreground">
                                        {plan.durationDays} {lang === "ar" ? "يوم" : "ימים"}
                                      </span>
                                      <span className="text-sm font-bold text-primary">
                                        {plan.price} {t("courses.currency")}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-auto pt-2">
                          <button
                            type="button"
                            disabled={isCheckoutPending || !plans.length}
                            onClick={() => handleSubscribe(course)}
                            className="w-full px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
                          >
                            {isCheckoutPending
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
