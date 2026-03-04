import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import najjahImage from '@/assets/najahLogo.png';
import { Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const instagramUrl = 'https://www.instagram.com/najah2200/';
  const facebookUrl = 'https://www.facebook.com/najahacademy2200';

  return (
    <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={najjahImage} alt="Najah 2200" className="w-24 rounded-xl" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('footer.description')}</p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-[#1877F2] flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
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
            © {new Date().getFullYear()} najah2200. {t('footer.rights')}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This website created with Mostafa Gomaa.{' '}
            <a
              href="https://mostafa-gomaa.me"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              mostafa-gomaa.me
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
