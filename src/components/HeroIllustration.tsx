'use client';

import { motion } from 'framer-motion';
import { MapPin, Smile, MessageCircleHeart } from 'lucide-react';

export default function HeroIllustration() {
  // Animation variants
  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 0.3,
      transition: { duration: 3, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 1 }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-full drop-shadow-[0_20px_60px_rgba(0,113,227,0.2)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Base - Transparent */}
        <rect width="800" height="600" rx="48" fill="transparent"/>
        
        {/* Subtle Grid */}
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500/5"/>
          </pattern>
          <filter id="hero-glow">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="800" height="600" rx="48" fill="url(#hero-grid)"/>

        {/* Animated Paths */}
        <motion.path 
          d="M150 150 Q 300 200 400 300" 
          stroke="#3B82F6" strokeWidth="4" strokeDasharray="10 10"
          variants={pathVariants} initial="initial" animate="animate"
        />
        <motion.path 
          d="M650 150 Q 500 200 400 300" 
          stroke="#6366F1" strokeWidth="4" strokeDasharray="10 10"
          variants={pathVariants} initial="initial" animate="animate"
        />

        {/* Midpoint Marker with Pulse */}
        <g transform="translate(400, 300)">
          <motion.circle 
            r="50" fill="#4F46E5" fillOpacity="0.05"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <circle r="28" fill="#4F46E5" filter="url(#hero-glow)"/>
          <MapPin className="text-white" width="28" height="28" x="-14" y="-14" />
          
          {/* Arriving Message Bubble */}
          <motion.g
            initial={{ opacity: 0, scale: 0, y: -40 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1, 1, 0.5],
              y: [-40, -60, -60, -70]
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 3 }}
          >
            <rect x="-40" y="-30" width="80" height="30" rx="15" fill="white" className="shadow-lg fill-white dark:fill-slate-800" />
            <MessageCircleHeart className="text-pink-500" width="16" height="16" x="-8" y="-23" />
          </motion.g>
        </g>

        {/* Character 1 (Friend A) - Walking Animation */}
        <motion.g
          animate={{ 
            x: [150, 400], 
            y: [150, 300],
            opacity: [0, 1, 1, 0],
            rotate: [0, 5, -5, 5, 0] // Swaying walk
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
        >
          {/* Bobbing effect inside the group */}
          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle r="18" fill="white" filter="url(#hero-glow)" stroke="#3B82F6" strokeWidth="2" />
            <Smile className="text-blue-600" width="22" height="22" x="-11" y="-11" />
          </motion.g>
        </motion.g>

        {/* Character 2 (Friend B) - Walking Animation */}
        <motion.g
          animate={{ 
            x: [650, 400], 
            y: [150, 300],
            opacity: [0, 1, 1, 0],
            rotate: [0, -5, 5, -5, 0] // Swaying walk
          }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 0.5, ease: "linear" }}
        >
          {/* Bobbing effect inside the group */}
          <motion.g
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
          >
            <circle r="18" fill="white" filter="url(#hero-glow)" stroke="#6366F1" strokeWidth="2" />
            <Smile className="text-indigo-600" width="22" height="22" x="-11" y="-11" />
          </motion.g>
        </motion.g>

        {/* Floating "Meeting Place" Badge */}
        <motion.g
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="520" y="240" width="180" height="50" rx="18" fill="white" className="shadow-2xl fill-white dark:fill-slate-800" />
          <text x="540" y="272" className="text-[16px] font-black fill-slate-900 dark:fill-white">우리 만날각? 잡았다! ✨</text>
        </motion.g>
      </svg>

      {/* Atmospheric Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px]" />
      </div>
    </div>
  );
}
