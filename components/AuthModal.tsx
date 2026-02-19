import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase, supabaseUrl } from '../lib/supabaseClient';

// Workaround for framer-motion type mismatch
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AtlasLogo = () => (
  <div className="relative w-10 h-10 opacity-90">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-full bg-gradient-to-b from-white via-gray-200 to-gray-400 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white blur-[1px]"></div>
  </div>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClientIp = async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (err) {
      console.warn('Could not determine client IP', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const isAdmin = email.toLowerCase() === 'michaelwilki25@gmail.com';

    try {
      if (!supabaseUrl.includes('YOUR_SUPABASE')) {
          
          if (isAdmin) {
             // --- ADMIN BYPASS FLOW ---
             // Attempt to Sign In first.
             const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
             });
             
             // If login succeeded, great. If it FAILED (Rate limit, IP block, wrong password), we FORCE BYPASS.
             if (signInError || !signInData.session) {
                 // Set local flag to bypass Supabase entirely on next load
                 localStorage.setItem('atlas_admin_bypass', 'true');
                 
                 // Reload the page to let App.tsx pick up the local bypass flag
                 window.location.reload();
                 return;
             }
             
             // If we actually logged in via Supabase (rare given your error), just close.
             onClose();
             return;

          } else {
            // --- NORMAL USER FLOW ---
            if (mode === 'signup') {
                const clientIp = await getClientIp();

                if (clientIp) {
                    // 1. Browser-level check (Fastest)
                    const storedIp = localStorage.getItem('atlas_last_ip');
                    const lastSignupTime = localStorage.getItem('atlas_signup_time');
                    
                    if (storedIp === clientIp && lastSignupTime) {
                       throw new Error("Registration limit reached. Only one account per IP address allowed.");
                    }

                    // 2. Database-level check
                    try {
                        const { count } = await supabase
                            .from('profiles')
                            .select('*', { count: 'exact', head: true })
                            .eq('ip', clientIp);

                        if (count !== null && count > 0) {
                            throw new Error("This IP address has already registered an account.");
                        }
                    } catch (dbErr: any) {
                        if (dbErr.message === "This IP address has already registered an account.") {
                            throw dbErr;
                        }
                        console.warn("IP Check DB skipped or failed", dbErr);
                    }

                    // Proceed with signup
                    const { error: signUpError } = await supabase.auth.signUp({
                      email,
                      password,
                      options: {
                        data: { 
                            full_name: name,
                            ip: clientIp,
                            credits: 25 
                        },
                      },
                    });
                    
                    if (signUpError) throw signUpError;
                    
                    // Mark this IP as used locally
                    localStorage.setItem('atlas_last_ip', clientIp);
                    localStorage.setItem('atlas_signup_time', Date.now().toString());

                } else {
                     // Fallback if IP service fails
                     const { error: signUpError } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { 
                                full_name: name,
                                credits: 25 
                            },
                        },
                      });
                      if (signUpError) throw signUpError;
                }
            } else {
                // Normal Login
                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
                if (signInError) throw signInError;
            }
            onClose();
          }

      } else {
        // Fallback for demo
        console.warn("Supabase keys not configured.");
        setError("Supabase not configured properly.");
        return; 
      }
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side */}
              <div className="w-full md:w-2/5 relative p-8 flex flex-col justify-between overflow-hidden bg-white/5">
                <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                </div>

                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <AtlasLogo />
                    <span className="font-display font-bold tracking-widest text-lg text-white">ATLAS</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-3 leading-tight drop-shadow-lg">
                      {mode === 'login' ? 'Welcome back, Operative.' : 'Initialize your access.'}
                    </h2>
                    <p className="text-gray-300 text-sm leading-relaxed drop-shadow-md">
                      Secure terminal access. All connections are encrypted and monitored.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-transparent">
                <div className="flex gap-6 mb-8 border-b border-white/10 pb-1">
                  <button 
                    onClick={() => { setMode('login'); setError(null); }}
                    className={`pb-3 text-sm font-medium transition-all relative ${mode === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Login
                    {mode === 'login' && <MotionDiv layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                  </button>
                  <button 
                    onClick={() => { setMode('signup'); setError(null); }}
                    className={`pb-3 text-sm font-medium transition-all relative ${mode === 'signup' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                  >
                    Sign Up
                    {mode === 'signup' && <MotionDiv layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />}
                  </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {mode === 'signup' && (
                    <MotionDiv initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
                        />
                      </div>
                    </MotionDiv>
                  )}

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
                    <input 
                      type="password" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/5 transition-all"
                    />
                  </div>

                  <MotionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full bg-white text-black font-bold py-3 rounded-lg mt-4 flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Access Terminal' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </MotionButton>
                </form>
              </div>
            </MotionDiv>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
};