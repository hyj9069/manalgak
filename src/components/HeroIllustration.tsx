'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';

export default function HeroIllustration() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D effect
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-15, 15]), { stiffness: 100, damping: 30 });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!isMounted) return null;

  return (
    <div className="relative w-full aspect-square flex items-center justify-center pointer-events-none">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      
      {/* Hit Area - Constrain interaction to the content bounds */}
      <div 
        className="relative w-full max-w-[450px] aspect-square flex items-center justify-center cursor-default group/hero pointer-events-auto"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: '1000px' }}
          className="relative w-full h-full flex items-center justify-center p-8 rounded-[48px] pointer-events-none"
        >
        {/* Main Glass Platform */}
        <div className="absolute inset-2 glass rounded-[48px] border border-white/40 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-2xl" />
        
        {/* Floating AI Elements */}
        {/* Central Midpoint Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" style={{ transform: 'translateZ(100px)' }}>
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center p-2"
          >
            <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.9)]">
              <Sparkles className="text-white w-5 h-5" />
            </div>
          </motion.div>
          {/* Scanning Rings (Multiple for smoothness) */}
          {[0, 1, 2].map((i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.8, 4], 
                opacity: [0, 0.4, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeOut",
                delay: i * 1.33
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-blue-500/50 rounded-full"
            />
          ))}
        </div>

        {/* Floating Pins & Connections */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible" style={{ transform: 'translateZ(40px)' }}>
          <defs>
            {/* Individually aligned gradients for each path direction */}
            <linearGradient id="grad1" x1="60" y1="100" x2="225" y2="225" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
            <linearGradient id="grad2" x1="390" y1="120" x2="225" y2="225" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
            <linearGradient id="grad3" x1="230" y1="370" x2="225" y2="225" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
            </linearGradient>
          </defs>
          {/* Path 1 (Red side) */}
          <motion.path 
            d="M 60,100 Q 225,225 225,225" 
            fill="none" 
            stroke="url(#grad1)" 
            strokeWidth="2"
            strokeDasharray="16 8"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Path 2 (Blue side) */}
          <motion.path 
            d="M 390,120 Q 225,225 225,225" 
            fill="none" 
            stroke="url(#grad2)" 
            strokeWidth="2"
            strokeDasharray="16 8"
            animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Path 3 (Purple side) */}
          <motion.path 
            d="M 230,370 Q 225,225 225,225" 
            fill="none" 
            stroke="url(#grad3)" 
            strokeWidth="2"
            strokeDasharray="16 8"
             animate={{ strokeDashoffset: [0, -24] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Top-Left Pin */}
        <motion.div 
          style={{ translateZ: '80px', top: '100px', left: '60px' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-2xl border border-white/50 dark:border-white/5 flex items-center justify-center">
            <MapPin className="text-red-500 w-5 h-5 fill-red-500/10" />
          </div>
        </motion.div>

        {/* Top-Right Pin */}
        <motion.div 
          style={{ translateZ: '60px', top: '120px', left: '390px' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-2xl border border-white/50 dark:border-white/5 flex items-center justify-center">
            <MapPin className="text-blue-500 w-5 h-5 fill-blue-500/10" />
          </div>
        </motion.div>

        {/* Bottom Pin */}
        <motion.div 
          style={{ translateZ: '120px', top: '370px', left: '230px' }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-2xl border border-white/50 dark:border-white/5 flex items-center justify-center">
            <MapPin className="text-purple-500 w-5 h-5 fill-purple-500/10" />
          </div>
        </motion.div>

        {/* Map Grid Pattern (Low opacity) */}
        <div className="absolute inset-12 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </motion.div>
      </div>
    </div>
  );
}
