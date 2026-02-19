import React, { Suspense, useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { HelloScreen } from './components/HelloScreen';
import { Dashboard } from './components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabaseClient';

// Workaround for framer-motion type mismatch in this environment
const MotionDiv = motion.div as any;

interface User {
  email: string;
  name: string;
  credits: number | string;
  isAdmin: boolean;
  id: string;
}

const LoadingScreen = () => (
  <MotionDiv 
    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  </MotionDiv>
);

const ADMIN_EMAIL = 'michaelwilki25@gmail.com';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewState, setViewState] = useState<'landing' | 'hello' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Helper to parse credits from session metadata
  const getCreditsFromSession = (session: any) => {
    const isAdmin = session.user.email === ADMIN_EMAIL;
    if (isAdmin) return 'INF';
    
    // Check metadata first
    const metaCredits = session.user.user_metadata?.credits;
    if (metaCredits !== undefined && metaCredits !== null) {
      return parseInt(metaCredits, 10);
    }
    
    return 25; // Default fallback (will be synced to metadata shortly after)
  };

  useEffect(() => {
    // 1. Load 3D scene timer
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);

    // 2. Check Session (Local Bypass OR Supabase)
    const checkSession = async () => {
      // CHECK FOR LOCAL ADMIN BYPASS FIRST
      const localBypass = localStorage.getItem('atlas_admin_bypass');
      
      if (localBypass === 'true') {
        setUser({
          id: 'admin-local-bypass',
          email: ADMIN_EMAIL,
          name: 'System Admin (Bypass)',
          credits: 'INF',
          isAdmin: true
        });
        setViewState('dashboard');
        setSessionChecked(true);
        return;
      }

      // Normal Supabase Flow
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isAdmin = session.user.email === ADMIN_EMAIL;
        
        // Ensure credits exist in metadata if not admin
        if (!isAdmin && session.user.user_metadata?.credits === undefined) {
           await supabase.auth.updateUser({ data: { credits: 25 } });
        }

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'Operative',
          credits: getCreditsFromSession(session),
          isAdmin: isAdmin
        });
        setViewState('dashboard');
      }
      setSessionChecked(true);
    };

    checkSession();

    // 3. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignore auth state changes if we are in local bypass mode
      if (localStorage.getItem('atlas_admin_bypass') === 'true') return;

      if (session) {
        const isAdmin = session.user.email === ADMIN_EMAIL;
        
        // Sync metadata if missing
        if (!isAdmin && session.user.user_metadata?.credits === undefined) {
           await supabase.auth.updateUser({ data: { credits: 25 } });
        }

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'Operative',
          credits: getCreditsFromSession(session),
          isAdmin: isAdmin
        });

        // Only switch view to hello on explicit SIGNED_IN event.
        if (event === 'SIGNED_IN') {
           setViewState('hello');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setViewState('landing');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    // Clear local bypass
    localStorage.removeItem('atlas_admin_bypass');
    // Clear supabase
    await supabase.auth.signOut();
    
    setUser(null);
    setViewState('landing');
  };

  const handleHelloComplete = () => {
    setViewState('dashboard');
  };

  const handleDeductCredit = async () => {
    if (!user) return;
    if (user.credits === 'INF') return;
      
    const currentVal = typeof user.credits === 'number' ? user.credits : 0;
    // Do not go below zero
    if (currentVal <= 0) return;

    const newVal = currentVal - 1;
    
    // Optimistic Update
    setUser((prev) => prev ? ({ ...prev, credits: newVal }) : null);
    
    // Persist to Supabase Metadata
    await supabase.auth.updateUser({
        data: { credits: newVal }
    });
  };

  // Wait for both the fake loader and the session check
  const isReady = isLoaded && sessionChecked;

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
      <AnimatePresence>
        {!isReady && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Radial gradient for depth */}
      <div className="absolute inset-0 z-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      {/* Main Content Layers */}
      <AnimatePresence mode="wait">
        {isReady && viewState === 'landing' && (
          <motion.div 
            key="landing"
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Overlay isLoaded={isReady} />
          </motion.div>
        )}

        {viewState === 'hello' && (
          <HelloScreen key="hello" onComplete={handleHelloComplete} />
        )}

        {viewState === 'dashboard' && user && (
          <motion.div 
            key="dashboard"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              onDeductCredit={handleDeductCredit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;