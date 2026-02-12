import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      background: `radial-gradient(circle, hsl(var(--neon-blue) / 0.4), transparent)`,
    }}
    animate={{
      y: [0, -30, 0],
      opacity: [0, 0.6, 0],
      scale: [0.5, 1, 0.5],
    }}
    transition={{
      duration: 4 + Math.random() * 3,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

const AnimatedBackground = () => {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    }))
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large gradient orbs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          top: '10%',
          left: '20%',
          background: 'radial-gradient(circle, hsl(217 91% 60% / 0.08), transparent 60%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          bottom: '10%',
          right: '15%',
          background: 'radial-gradient(circle, hsl(199 89% 48% / 0.07), transparent 60%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, hsl(187 85% 53% / 0.05), transparent 60%)',
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Neon flowing lines — more visible */}
      <div className="neon-line animate-neon-flow" style={{ top: '12%', width: '400px', height: '2px', animationDelay: '0s' }} />
      <div className="neon-line animate-neon-flow-reverse" style={{ top: '28%', width: '350px', height: '2px', animationDelay: '2s' }} />
      <div className="neon-line animate-neon-diagonal" style={{ top: '45%', width: '300px', height: '1.5px', animationDelay: '4s' }} />
      <div className="neon-line animate-neon-flow" style={{ top: '62%', width: '280px', height: '2px', animationDelay: '6s' }} />
      <div className="neon-line animate-neon-flow-reverse" style={{ top: '78%', width: '320px', height: '1.5px', animationDelay: '1s' }} />
      <div className="neon-line animate-neon-diagonal" style={{ top: '8%', width: '250px', height: '2px', animationDelay: '8s' }} />
      <div className="neon-line animate-neon-flow" style={{ top: '92%', width: '360px', height: '1.5px', animationDelay: '3s' }} />
      <div className="neon-line animate-neon-flow-reverse" style={{ top: '50%', width: '200px', height: '2px', animationDelay: '5s' }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <FloatingParticle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
      ))}

      {/* Grid overlay — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-blue) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-blue) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
