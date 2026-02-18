import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, MapPin, Send, CheckCircle } from 'lucide-react';

const ContactSection = () => {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.name')}</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.email')}</label>
                <input
                  type="email"
                  required
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.phone')}</label>
                <input
                  type="tel"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.message')}</label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3.5 rounded-xl font-semibold gradient-bg text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {sent ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('contact.success')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('contact.send')}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <a
              href="tel:+972546410674"
              className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">{t('contact.callUs')}</div>
                <div className="text-muted-foreground text-sm" dir="ltr">+972-54-641-0674</div>
              </div>
            </a>

            <a
              href="https://wa.me/972501234567"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">{t('contact.whatsapp')}</div>
                <div className="text-muted-foreground text-sm" dir="ltr">+972-50-123-4567</div>
              </div>
            </a>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold">{t('contact.address')}</div>
                <div className="text-muted-foreground text-sm">Palestine</div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="glass-card rounded-2xl h-48 overflow-hidden flex items-center justify-center">
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Google Maps
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
