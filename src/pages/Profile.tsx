import { motion } from "framer-motion";
import { BadgeCheck, CalendarDays, CircleUserRound, LayoutDashboard, LogOut, Mail, ShieldCheck, UserCog } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useAuth } from "@/contexts/AuthContext";

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const Profile = () => {
  const { token, user, logout } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "U";

  const rows = [
    { label: "User ID", value: user?.id },
    { label: "Email", value: user?.email, icon: Mail },
    { label: "Role", value: user?.role, icon: UserCog },
    { label: "Account Status", value: user?.isActive ? "Active" : "Inactive", icon: ShieldCheck },
    { label: "Registration Source", value: user?.registrationSource || "N/A", icon: BadgeCheck },
    { label: "Review Status", value: user?.adminReviewStatus || "N/A", icon: BadgeCheck },
    { label: "Created At", value: formatDate(user?.createdAt), icon: CalendarDays },
    { label: "Updated At", value: formatDate(user?.updatedAt), icon: CalendarDays }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-[320px,1fr]"
          >
            <section className="glass-card rounded-3xl p-6 md:p-8 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {initials}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profile</p>
                  <h1 className="text-2xl md:text-3xl font-bold">{user?.fullName}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{user?.role} account</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
                  <CircleUserRound className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Display name</p>
                    <p className="font-medium">{user?.fullName}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email address</p>
                    <p className="font-medium break-all">{user?.email}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-secondary/40 p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current status</p>
                    <p className="font-medium">{user?.isActive ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  to="/app/courses"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to dashboard
                </Link>
                <button
                  onClick={logout}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </section>

            <section className="glass-card rounded-3xl p-6 md:p-8 border border-border/50">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Account details</p>
                  <h2 className="text-2xl font-bold">Everything in one place</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm text-muted-foreground">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  Synced with server
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {rows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {Icon ? <Icon className="w-4 h-4" /> : null}
                        <span>{row.label}</span>
                      </div>
                      <p className="font-medium break-words">{row.value || "N/A"}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;