import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AcademicExpertsSection from '@/components/AcademicExpertsSection';
import CoursesSection from '@/components/CoursesSection';
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
      <CoursesSection type="solo" />
      <CoursesSection type="group" />
      <CoursesSection type="enSolo" />
      <CoursesSection type="enGroup" />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
