import React from 'react';
import { motion } from 'framer-motion';

// Workaround for framer-motion type mismatch
const MotionButton = motion.button as any;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const ComingSoonButton: React.FC<ButtonProps> = ({ children, loading, className, ...props }) => {
  return (
    <MotionButton
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden
        bg-white text-black font-semibold px-6 py-3 rounded-full
        shadow-[0_0_20px_rgba(255,255,255,0.3)]
        hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]
        transition-all duration-300
        disabled:opacity-70 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
      ) : (
        children
      )}
    </MotionButton>
  );
};