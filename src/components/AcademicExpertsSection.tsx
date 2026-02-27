import { motion } from 'framer-motion';
import { GraduationCap, Award, BookOpenCheck } from 'lucide-react';

const AcademicExpertsSection = () => {
  const highlights = [
    {
      icon: GraduationCap,
      title: 'معايير أكاديمية عالية',
      text: 'اختيار المعلمات يتم وفق مؤهلات أكاديمية دقيقة وخبرة حقيقية في التعليم.',
    },
    {
      icon: Award,
      title: 'خبرة طويلة ومثبتة',
      text: 'سنين ممتدة في سلك التعليم مع نتائج واضحة وانعكاس مباشر على أداء الطلاب.',
    },
    {
      icon: BookOpenCheck,
      title: 'مسارات تعليمية ذكية',
      text: 'تصميم خطة مناسبة لكل طالب بما يضمن التقدم بثبات نحو أهدافه التعليمية.',
    },
  ];

  return (
    <section className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-glow rounded-3xl p-7 md:p-10 lg:p-12 overflow-hidden relative"
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 20% 20%, hsl(217 91% 60% / 0.2), transparent 45%), radial-gradient(circle at 80% 70%, hsl(187 85% 53% / 0.2), transparent 40%)' }}
          />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 gradient-text"
            >
              تعرّف على طاقم الخبيرات الأكاديميات لدينا
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl font-semibold mb-8 text-foreground/90"
            >
              هنا يجتمع العلم والخبرة: طاقم المعلمات الأكاديميات
            </motion.p>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="space-y-5 text-muted-foreground leading-8"
              >
                <p>
                  خلف كل قصة نجاح لطلابنا، يقف طاقم مهني متكامل من المعلمات ذوات الكفاءة العالية. لقد تم اختيار كل عضوة في فريقنا بعناية فائقة وبناءً على معايير أكاديمية عليا، مع التركيز على امتلاك خلفية مهنية رصينة وسنين طويلة من الخبرة في سلك التعليم.
                </p>
                <p>
                  هذا المزيج الفريد بين الخبرة الممتدة والتحصيل الأكاديمي المتقدم (ألقاب جامعية أولى وثانية) هو ما يجعل طاقمنا الأقدر على فهم احتياجات الطلاب بدقة، وتصميم المسار الأنسب لقيادتهم نحو أهدافهم بثبات واحترافية.
                </p>
              </motion.div>

              <div className="grid gap-4">
                {highlights.map(({ icon: Icon, title, text }, i) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    viewport={{ once: true }}
                    className="rounded-2xl border border-primary/15 bg-background/60 backdrop-blur-sm p-5 flex gap-4"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl gradient-bg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-6">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AcademicExpertsSection;
