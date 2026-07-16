import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Bell, CircleUserRound, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import najjahImage from '@/assets/najahLogo.png';

const Navbar = () => {
  const { t, lang, setLang } = useLanguage();
  const { token, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/#courses', label: t('nav.courses'), isHash: true },
    { to: '/courses', label: lang === 'ar' ? 'كورس ياعيل' : 'קורס יע"ל' },
    { to: '/#about', label: t('nav.about'), isHash: true },
    { to: '/#testimonials', label: t('nav.testimonials'), isHash: true },
    { to: '/#contact', label: t('nav.contact'), isHash: true },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    if (link.isHash && location.pathname === '/') {
      const id = link.to.replace('/#', '');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={najjahImage} alt="Najah 2200" className="w-24 rounded-xl" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.isHash && location.pathname !== '/' ? '/' : link.to}
                onClick={() => handleNavClick(link)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'he' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Globe className="w-4 h-4" />
              {lang === 'ar' ? 'עב' : 'عر'}
            </button>

            {token ? (
              <div className="hidden md:flex items-center gap-2">
                {user?.role === 'admin' ? (
                  <Link
                    to="/app/admin/essay-dashboard"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {lang === 'ar' ? 'إدارة الأسئلة' : 'ניהול שאלות'}
                  </Link>
                ) : null}
                <Link
                  to="/notifications"
                  className="p-2 rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                  title={lang === 'ar' ? 'التنبيهات' : 'התראות'}
                >
                  <Bell className="w-5 h-5" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                  title={user?.fullName || 'Profile'}
                >
                  <CircleUserRound className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-[140px] truncate">{user?.fullName || 'Profile'}</span>
                </Link>
                <Link
                  to="/app/courses"
                  className="px-4 py-2 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  {t('nav.dashboard')}
                </Link>
                {user?.role === 'student' ? (
                  <Link
                    to="/app/stats"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground hover:text-foreground transition-all inline-flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'الإحصائيات' : 'סטטיסטיקות'}</span>
                  </Link>
                ) : null}
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground hover:text-foreground transition-all"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : null}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.isHash && location.pathname !== '/' ? '/' : link.to}
                  onClick={() => handleNavClick(link)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {token ? (
                <>
                  {user?.role === 'admin' ? (
                    <Link
                      to="/app/admin/essay-dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground text-center"
                    >
                      {lang === 'ar' ? 'إدارة الأسئلة' : 'ניהול שאלות'}
                    </Link>
                  ) : null}
                  <Link
                    to="/notifications"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground text-center flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'التنبيهات' : 'התראות'}</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground text-center flex items-center justify-center gap-2"
                  >
                    <CircleUserRound className="w-4 h-4" />
                    <span>{user?.fullName || 'Profile'}</span>
                  </Link>
                  <Link
                    to="/app/courses"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-bg text-primary-foreground text-center"
                  >
                    {t('nav.dashboard')}
                  </Link>
                  {user?.role === 'student' ? (
                    <Link
                      to="/app/stats"
                      onClick={() => setMobileOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground text-center flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'الإحصائيات' : 'סטטיסטיקות'}</span>
                    </Link>
                  ) : null}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-secondary/70 text-muted-foreground text-center"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
