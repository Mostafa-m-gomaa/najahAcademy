import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'ar' | 'he';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Translations
const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.courses': 'الدورات',
    'nav.about': 'من نحن',
    'nav.testimonials': 'آراء العملاء',
    'nav.contact': 'اتصل بنا',
    'nav.register': 'سجل الآن',
    'nav.terms': 'شروط الاستخدام',

    // Hero
    'hero.title': 'أتقن العبرية والإنجليزية',
    'hero.titleAccent': 'مع أفضل المعلمات',
    'hero.subtitle': "تعلّم اليوم من خلال دورات اللغة العبرية والإنجليزية، فردية أو جماعية، في برامج احترافية مصممة خصيصًا لتحقيق أهدافك. ، نوفر أيضًا تحضيرًا لامتحانات ياعيل نت، أمير نت، وامتحانات البجروت.",
    'hero.cta1': 'ابدأ الآن',
    'hero.cta2': 'تصفح الدورات',
    'hero.trust': 'موثوق من مئات الطلاب',
    'hero.students': '+823 طالب',
    'hero.rating': '4.9 تقييم',
    'hero.courses_count': '+15 دورة',

    // Courses
    'courses.title.solo': 'دوراتنا التعليمية الفردية',
    'courses.title.group': 'دوراتنا التعليمية الجماعية',
    'courses.subtitle': 'اختر من بين مجموعة متنوعة من الدورات المصممة بعناية لتناسب جميع المستويات',
    'courses.viewAll': 'عرض جميع الدورات',
    'courses.register': 'سجل الآن',
    'courses.details': 'تفاصيل الدورة',
    'courses.level': 'المستوى',
    'courses.price': 'السعر',
    'courses.duration': 'المدة',
    'courses.beginner': 'مبتدئ',
    'courses.intermediate': 'متوسط',
    'courses.advanced': 'متقدم',
    'courses.whatYouLearn': 'ماذا ستتعلم',
    'courses.registerCourse': 'سجل في هذه الدورة',
    'courses.currency': '₪',

    // About
    'about.title': 'من نحن',
    'about.subtitle': 'نحن معهد نجاح 2000 — رحلة نجاح تمتد لأكثر من عقدين',
    'about.story': 'تأسس معهد نجاح 2000 بهدف تمكين المجتمع العربي من إتقان اللغات العبرية والإنجليزية بأعلى معايير الجودة والاحترافية.',
    'about.mission': 'مهمتنا',
    'about.missionText': 'تقديم تعليم لغوي عالي الجودة يمكّن طلابنا من تحقيق أهدافهم المهنية والأكاديمية',
    'about.vision': 'رؤيتنا',
    'about.visionText': 'أن نكون المعهد الرائد في تعليم اللغات في المنطقة من خلال أساليب تعليمية مبتكرة',
    'about.why': 'لماذا نجاح 2000؟',
    'about.reason1': 'معلمون متخصصون',
    'about.reason1Text': 'فريق من أفضل المعلمين ذوي الخبرة والكفاءة العالية',
    'about.reason2': 'مناهج حديثة',
    'about.reason2Text': 'مناهج تعليمية محدثة ومصممة وفق أحدث أساليب التعليم',
    'about.reason3': 'نتائج مضمونة',
    'about.reason3Text': 'نسبة نجاح عالية وشهادات معترف بها',
    'about.reason4': 'بيئة تعليمية متميزة',
    'about.reason4Text': 'فصول مجهزة بأحدث التقنيات التعليمية',

    // Testimonials
    'testimonials.title': 'آراء طلابنا',
    'testimonials.subtitle': 'اكتشف تجارب طلابنا الناجحين',

    // Contact
    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'نحن هنا لمساعدتك. تواصل معنا في أي وقت',
    'contact.name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'رقم الهاتف',
    'contact.message': 'رسالتك',
    'contact.send': 'إرسال الرسالة',
    'contact.success': 'تم إرسال رسالتك بنجاح!',
    'contact.whatsapp': 'تواصل عبر واتساب',
    'contact.callUs': 'اتصل بنا',
    'contact.address': 'العنوان',

    // Registration
    'register.title': 'سجل الآن',
    'register.subtitle': 'انضم إلى آلاف الطلاب الناجحين',
    'register.name': 'الاسم الكامل',
    'register.city': 'المدينة',
    'register.phone': 'رقم الهاتف',
    'register.course': 'اختر الدورة',
    'register.submit': 'إرسال التسجيل',
    'register.success': 'تم التسجيل بنجاح! سنتواصل معك قريباً.',
    'register.selectCourse': 'اختر دورة...',

    // Footer
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.description': 'معهد متخصص في تعليم اللغات العبرية والإنجليزية بأعلى معايير الجودة',

    // Terms
    'terms.title': 'شروط الاستخدام',
    'terms.intro': 'باستخدامك لموقع نجاح 2000 فإنك توافق على الشروط والأحكام التالية:',
    'terms.section1Title': 'الشروط العامة',
    'terms.section1Text': 'يحق لمعهد نجاح 2000 تعديل هذه الشروط في أي وقت. يُنصح بمراجعة هذه الصفحة بشكل دوري.',
    'terms.section2Title': 'التسجيل والدفع',
    'terms.section2Text': 'التسجيل في الدورات يتطلب تعبئة نموذج التسجيل ودفع الرسوم المحددة. الأسعار قابلة للتغيير.',
    'terms.section3Title': 'حقوق الملكية',
    'terms.section3Text': 'جميع المحتويات والمواد التعليمية هي ملكية حصرية لمعهد نجاح 2000.',
    'terms.section4Title': 'سياسة الإلغاء',
    'terms.section4Text': 'يمكن إلغاء التسجيل واسترداد المبلغ خلال 14 يوماً من تاريخ التسجيل وقبل بدء الدورة.',
  },
  he: {
    'nav.home': 'ראשי',
    'nav.courses': 'קורסים',
    'nav.about': 'אודות',
    'nav.testimonials': 'המלצות',
    'nav.contact': 'צור קשר',
    'nav.register': 'הרשמה',
    'nav.terms': 'תנאי שימוש',

    'hero.title': 'שלטו בעברית ובאנגלית',
    'hero.titleAccent': 'עם המומחים הטובים ביותר',
    'hero.subtitle': 'צאו לדרך לעתיד מקצועי טוב יותר עם קורסים מקצועיים שעוצבו במיוחד להשגת מטרותיכם',
    'hero.cta1': 'התחילו עכשיו',
    'hero.cta2': 'עיינו בקורסים',
    'hero.trust': 'אלפי תלמידים סומכים עלינו',
    'hero.students': '+2000 תלמידים',
    'hero.rating': '4.9 דירוג',
    'hero.courses_count': '+15 קורסים',

    'courses.title.solo': 'הקורסים שלנו הפרטיים',
    'courses.title.group': 'הקורסים שלנו הקבוצתיים',
    'courses.subtitle': 'בחרו מתוך מגוון קורסים שעוצבו בקפידה לכל הרמות',
    'courses.viewAll': 'הצג את כל הקורסים',
    'courses.register': 'הרשמה',
    'courses.details': 'פרטי הקורס',
    'courses.level': 'רמה',
    'courses.price': 'מחיר',
    'courses.duration': 'משך',
    'courses.beginner': 'מתחילים',
    'courses.intermediate': 'בינוני',
    'courses.advanced': 'מתקדם',
    'courses.whatYouLearn': 'מה תלמדו',
    'courses.registerCourse': 'הירשמו לקורס זה',
    'courses.currency': '₪',

    'about.title': 'אודות',
    'about.subtitle': 'אנחנו מכון נג\'אח 2000 — מסע הצלחה של למעלה משני עשורים',
    'about.story': 'מכון נג\'אח 2000 נוסד במטרה להעצים את החברה הערבית בשליטה בשפות העברית והאנגלית בסטנדרטים הגבוהים ביותר.',
    'about.mission': 'המשימה שלנו',
    'about.missionText': 'לספק חינוך לשוני איכותי שמאפשר לתלמידינו להשיג את מטרותיהם המקצועיות והאקדמיות',
    'about.vision': 'החזון שלנו',
    'about.visionText': 'להיות המכון המוביל בהוראת שפות באזור באמצעות שיטות הוראה חדשניות',
    'about.why': 'למה נג\'אח 2000?',
    'about.reason1': 'מורים מומחים',
    'about.reason1Text': 'צוות המורים המנוסים והמוסמכים ביותר',
    'about.reason2': 'תוכניות לימוד מודרניות',
    'about.reason2Text': 'תוכניות לימוד מעודכנות ומתקדמות',
    'about.reason3': 'תוצאות מוכחות',
    'about.reason3Text': 'שיעור הצלחה גבוה ותעודות מוכרות',
    'about.reason4': 'סביבת לימוד מצוינת',
    'about.reason4Text': 'כיתות מאובזרות בטכנולוגיה החדישה ביותר',

    'testimonials.title': 'המלצות התלמידים',
    'testimonials.subtitle': 'גלו את חוויות התלמידים המצליחים שלנו',

    'contact.title': 'צור קשר',
    'contact.subtitle': 'אנחנו כאן לעזור. פנו אלינו בכל עת',
    'contact.name': 'שם מלא',
    'contact.email': 'דואר אלקטרוני',
    'contact.phone': 'מספר טלפון',
    'contact.message': 'ההודעה שלך',
    'contact.send': 'שלח הודעה',
    'contact.success': 'ההודעה נשלחה בהצלחה!',
    'contact.whatsapp': 'דברו איתנו בוואטסאפ',
    'contact.callUs': 'התקשרו אלינו',
    'contact.address': 'כתובת',

    'register.title': 'הירשמו עכשיו',
    'register.subtitle': 'הצטרפו לאלפי תלמידים מצליחים',
    'register.name': 'שם מלא',
    'register.city': 'עיר',
    'register.phone': 'מספר טלפון',
    'register.course': 'בחרו קורס',
    'register.submit': 'שלח הרשמה',
    'register.success': 'ההרשמה בוצעה בהצלחה! ניצור איתכם קשר בקרוב.',
    'register.selectCourse': 'בחרו קורס...',

    'footer.rights': 'כל הזכויות שמורות',
    'footer.description': 'מכון מתמחה בהוראת עברית ואנגלית בסטנדרטים הגבוהים ביותר',

    'terms.title': 'תנאי שימוש',
    'terms.intro': 'בשימוש באתר נג\'אח 2000 אתם מסכימים לתנאים והגבלות הבאים:',
    'terms.section1Title': 'תנאים כלליים',
    'terms.section1Text': 'מכון נג\'אח 2000 שומר לעצמו את הזכות לעדכן תנאים אלה בכל עת.',
    'terms.section2Title': 'הרשמה ותשלום',
    'terms.section2Text': 'ההרשמה לקורסים מחייבת מילוי טופס הרשמה ותשלום. המחירים עשויים להשתנות.',
    'terms.section3Title': 'זכויות קניין',
    'terms.section3Text': 'כל התכנים וחומרי הלימוד הם רכוש בלעדי של מכון נג\'אח 2000.',
    'terms.section4Title': 'מדיניות ביטול',
    'terms.section4Text': 'ניתן לבטל הרשמה ולקבל החזר כספי תוך 14 ימים מיום ההרשמה ולפני תחילת הקורס.',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');

  const t = useCallback((key: string) => {
    return translations[lang][key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: 'rtl' }}>
      <div dir="rtl" lang={lang}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
