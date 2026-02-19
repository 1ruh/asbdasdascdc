import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { ComingSoonButton } from './ui/ComingSoonButton';

// Workaround for framer-motion type mismatch
const MotionDiv = motion.div as any;
const MotionForm = motion.form as any;

export const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');

    try {
      // We perform a real network request here to validata connectivity.
      // In production, change this URL to your specific backend endpoint (e.g., /api/join-waitlist)
      // that handles the SMTP email dispatch.
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'atlas_landing',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      // On successful network response (2xx status)
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400"
          >
            <div className="bg-green-500/20 p-1 rounded-full">
              <Check className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Welcome to the inner circle. Check your inbox.</span>
          </MotionDiv>
        ) : status === 'error' ? (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 w-full"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Connection failed. Please try again.</span>
            </div>
            <button 
              onClick={() => setStatus('idle')}
              className="text-xs underline hover:text-red-300"
            >
              Retry
            </button>
          </MotionDiv>
        ) : (
          <MotionForm 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <div className="relative flex-1 group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-3 rounded-full focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 placeholder:text-gray-500 backdrop-blur-sm"
                disabled={status === 'loading'}
                required
              />
            </div>
            <ComingSoonButton type="submit" loading={status === 'loading'}>
              Join Waitlist
            </ComingSoonButton>
          </MotionForm>
        )}
      </AnimatePresence>
    </div>
  );
};