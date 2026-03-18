'use client';

import { motion } from 'framer-motion';

export default function InteractiveMap() {
  // SVG Path for the map lines
  const pathData = "M 50 150 Q 150 50 250 150 T 450 150 T 650 50 T 750 150";

  return (
    <div className="relative w-full h-full bg-blue-50/30 dark:bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex items-center justify-center">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3182f6_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05]" />

      <svg 
        viewBox="0 0 800 250" 
        className="w-full max-w-4xl h-auto drop-shadow-2xl overflow-visible px-10"
      >
        {/* Animated Glow Path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke="url(#gradient-line)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Moving Particles (Light) */}
        <motion.circle r="3" fill="#6962fe">
          <animateMotion dur="6s" repeatCount="indefinite" path={pathData} />
        </motion.circle>
        <motion.circle r="3" fill="#46f3cb">
          <animateMotion dur="8s" repeatCount="indefinite" path={pathData} begin="2s" />
        </motion.circle>

        {/* Character 1 (Walking) */}
        <motion.g>
          <animateMotion dur="15s" repeatCount="indefinite" path={pathData} />
          
          {/* Character Body - Simple 3D-ish style */}
          <motion.g
            animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Shadow */}
            <ellipse cx="0" cy="35" rx="10" ry="3" fill="rgba(0,0,0,0.1)" />
            
            {/* Body */}
            <rect x="-10" y="0" width="20" height="25" rx="8" fill="#3b82f6" />
            <circle cx="0" cy="-10" r="10" fill="#fbcfe8" /> {/* Head */}
            
            {/* Smartphone */}
            <motion.g
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <rect x="5" y="0" width="8" height="12" rx="2" fill="#1c1c1e" />
              <rect x="6" y="1" width="6" height="10" rx="1" fill="#60a5fa" />
            </motion.g>

            {/* Float Indication Label */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
               <rect x="-20" y="-45" width="40" height="20" rx="10" fill="white" className="shadow-sm" />
               <text x="0" y="-31" fontSize="8" textAnchor="middle" fontWeight="bold" fill="#1c1c1e">철수</text>
            </motion.g>
          </motion.g>
        </motion.g>

        {/* Character 2 (Walking from opposite) */}
        <motion.g>
          <animateMotion dur="18s" repeatCount="indefinite" path={pathData} begin="5s" />
          
          <motion.g
            animate={{ y: [0, -6, 0], rotate: [2, -2, 2] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Shadow */}
            <ellipse cx="0" cy="35" rx="10" ry="3" fill="rgba(0,0,0,0.1)" />
            
            {/* Body */}
            <rect x="-10" y="0" width="20" height="25" rx="8" fill="#a855f7" />
            <circle cx="0" cy="-10" r="10" fill="#fde68a" />
            
            {/* Smartphone */}
            <motion.g
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <rect x="-13" y="0" width="8" height="12" rx="2" fill="#1c1c1e" />
              <rect x="-12" y="1" width="6" height="10" rx="1" fill="#c084fc" />
            </motion.g>

            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
               <rect x="-20" y="-45" width="40" height="20" rx="10" fill="white" className="shadow-sm" />
               <text x="0" y="-31" fontSize="8" textAnchor="middle" fontWeight="bold" fill="#1c1c1e">영희</text>
            </motion.g>
          </motion.g>
        </motion.g>

        {/* Arrival Pins */}
        {[
          { x: 50, y: 150, color: "#3b82f6" },
          { x: 750, y: 150, color: "#a855f7" },
          { x: 400, y: 150, color: "#ef4444" } // Midpoint
        ].map((pin, i) => (
          <motion.g
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.2, type: 'spring' }}
            style={{ x: pin.x, y: pin.y }}
          >
            <motion.circle
              r="20"
              fill={pin.color}
              className="opacity-20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <path 
              d="M0 0 C -10 -10 -10 -25 0 -35 C 10 -25 10 -10 0 0" 
              fill={pin.color}
              stroke="white"
              strokeWidth="2"
            />
            <circle cx="0" cy="-25" r="4" fill="white" />
          </motion.g>
        ))}

        {/* Gradients */}
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6962fe" />
            <stop offset="50%" stopColor="#46f3cb" />
            <stop offset="100%" stopColor="#a92efd" />
          </linearGradient>
        </defs>
      </svg>

      {/* Info Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="px-4 py-2 glass rounded-full text-xs font-black flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          REAL-TIME TRACKING
        </div>
      </div>
    </div>
  );
}
