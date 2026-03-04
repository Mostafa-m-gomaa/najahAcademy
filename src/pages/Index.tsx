import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AcademicExpertsSection from '@/components/AcademicExpertsSection';
import CourseCategoriesSection from '@/components/CourseCategoriesSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';
import WhatsAppButton from '@/components/WhatsAppButton';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <AcademicExpertsSection />
      <CourseCategoriesSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
