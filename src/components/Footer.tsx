import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">ن</span>
              </div>
              <span className="font-bold text-lg gradient-text">najah2000</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('footer.description')}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('nav.courses')}</h4>
            <div className="space-y-2">
              <Link to="/#courses" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.courses')}
              </Link>
              <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.register')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('nav.contact')}</h4>
            <div className="space-y-2">
              <Link to="/#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.contact')}
              </Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.terms')}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} najah2000. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
