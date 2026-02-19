import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Workaround for framer-motion type mismatch
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;

interface HelloScreenProps {
  onComplete: () => void;
}

export const HelloScreen: React.FC<HelloScreenProps> = ({ onComplete }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl"
    >
       <MotionH1
         initial={{ opacity: 0, y: 20, scale: 0.9 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
         className="text-6xl md:text-9xl font-display font-medium text-white tracking-tighter drop-shadow-2xl"
       >
         hello
       </MotionH1>
       
       <MotionDiv
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 2, duration: 1 }}
         className="absolute bottom-20"
       >
         <button 
           onClick={onComplete}
           className="text-white/50 hover:text-white transition-colors text-sm font-mono tracking-widest uppercase animate-pulse"
         >
           Click to Initialize
         </button>
       </MotionDiv>
    </MotionDiv>
  );
};