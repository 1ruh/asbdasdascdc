import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LogOut, ShieldAlert, User, Database, Globe, AlertTriangle, CheckCircle, Loader2, Copy, Users, Crown, Shield, Zap, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Workaround for framer-motion
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface DashboardProps {
  user: {
    email: string;
    name: string;
    credits: number | string;
    isAdmin: boolean;
  };
  onLogout: () => void;
  onDeductCredit: () => void;
}

const AtlasLogo = () => (
  <div className="relative w-6 h-6 opacity-90">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
  </div>
);

type SearchType = 'auto' | 'email' | 'username' | 'roblox';

const LEAKCHECK_API_KEY = "4344cd645b6e6cc2559c1a92017d9bfa12e4e4b1";

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onDeductCredit }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Admin State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');
  const [creditAmount, setCreditAmount] = useState('100');
  const [adminStatus, setAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    console.log('Atlas Dashboard: v3.1 (Direct Connection Mode)');
  }, []);

  const detectType = (input: string): SearchType => {
    if (input.includes('@')) return 'email';
    if (/^\d{5,15}$/.test(input)) return 'roblox'; 
    return 'username';
  };

  const handleAdminAddCredits = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminStatus('loading');
      setAdminMsg('');

      try {
          const { error } = await supabase.rpc('admin_add_credits', { 
              target_email: targetEmail, 
              amount: parseInt(creditAmount) 
          });

          if (error) throw error;

          setAdminStatus('success');
          setAdminMsg(`Successfully added ${creditAmount} credits to ${targetEmail}`);
          setTimeout(() => {
              setAdminStatus('idle');
              setTargetEmail('');
              setShowAdminModal(false);
          }, 2000);

      } catch (err: any) {
          console.error('Admin Action Failed:', err);
          setAdminStatus('error');
          if (err.message?.includes('function') && err.message?.includes('does not exist')) {
             setAdminMsg('Backend function missing. Please run the SQL setup script.');
          } else {
             setAdminMsg(err.message || 'Operation failed');
          }
      }
  };

  const handleSearch = async () => {
    if (!query) return;

    if (user.credits !== 'INF' && typeof user.credits === 'number' && user.credits <= 0) {
      setError("INSUFFICIENT CREDITS. Access denied. Please contact administration.");
      return;
    }

    onDeductCredit();
    setIsLoading(true);
    setResult(null);
    setError(null);

    const typeToUse = searchType === 'auto' ? detectType(query) : searchType;

    try {
      if (typeToUse === 'roblox') {
        const id = query;
        
        // Use relative paths that are proxied by netlify.toml or _redirects
        const infoUrl = `/api/roblox-users/users/${id}`;
        const avatarUrl = `/api/roblox-thumbnails/users/avatar?userIds=${id}&size=352x352&format=Png&isCircular=false`;
        const friendsUrl = `/api/roblox-friends/users/${id}/friends/count`;
        const followersUrl = `/api/roblox-friends/users/${id}/followers/count`;
        const followingUrl = `/api/roblox-friends/users/${id}/followings/count`;
        const groupsUrl = `/api/roblox-groups/users/${id}/groups/roles`;

        const [infoRes, avatarRes, friendsRes, followersRes, followingRes, groupsRes] = await Promise.all([
          fetch(infoUrl),
          fetch(avatarUrl),
          fetch(friendsUrl),
          fetch(followersUrl),
          fetch(followingUrl),
          fetch(groupsUrl),
        ]);

        if (!infoRes.ok) {
           if (infoRes.status === 404) throw new Error('Roblox user not found.');
           throw new Error(`Roblox API Error: ${infoRes.statusText}`);
        }
        
        const infoData = await infoRes.json();
        const avatarData = await avatarRes.json();
        const friendsData = await friendsRes.json();
        const followersData = await followersRes.json();
        const followingData = await followingRes.json();
        const groupsData = await groupsRes.json();

        setResult({ 
          type: 'roblox', 
          data: { 
            ...infoData, 
            avatarUrl: avatarData.data?.[0]?.imageUrl,
            friendsCount: friendsData.count,
            followersCount: followersData.count,
            followingCount: followingData.count,
            groups: groupsData.data || [] 
          } 
        });
      } 
      else {
        // LEAKCHECK - Direct connection via local/cloud proxy path
        const lcType = typeToUse === 'email' ? 'email' : 'username';
        
        // This relative path "/api/leakcheck" will be handled by:
        // 1. vite.config.ts (in dev) -> proxies to leakcheck.io
        // 2. netlify.toml (in prod) -> redirects to leakcheck.io
        // This avoids using "corsproxy.io" or other third party services.
        const targetUrl = `/api/leakcheck/${encodeURIComponent(query)}?type=${lcType}`;
        
        const response = await fetch(targetUrl, {
            headers: {
                'X-API-Key': LEAKCHECK_API_KEY,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // If the proxy config is missing or fails, we might see HTML (404/500 from host)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                 console.error('Proxy Error: Received HTML instead of JSON. Check netlify.toml or vite.config.ts');
                 throw new Error('Connection Error: The security gateway refused the connection.');
            }
            
            throw new Error(`Lookup failed: API responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
           if (data.message === "Not found") throw new Error('No leaks found for this target.');
           throw new Error(data.message || 'Lookup failed');
        }
        
        setResult({ type: 'leakcheck', data: data.result });
      }
    } catch (err: any) {
      console.error("Search Error:", err);
      setError(err.message || 'An error occurred during the investigation.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto custom-scrollbar relative z-40 bg-black/80">
       <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>

      {/* ADMIN MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowAdminModal(false)}
          >
            <MotionDiv 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               onClick={(e: any) => e.stopPropagation()}
               className="bg-[#0f0f15] border border-yellow-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-300"></div>
               
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-yellow-500">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-bold font-display text-lg tracking-wider">ADMIN COMMAND</h3>
                 </div>
                 <button onClick={() => setShowAdminModal(false)} className="text-gray-500 hover:text-white">
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <form onSubmit={handleAdminAddCredits} className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs text-gray-400 font-mono uppercase">Target Email</label>
                   <input 
                      type="email" 
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 outline-none transition-colors"
                      placeholder="user@example.com"
                      required
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs text-gray-400 font-mono uppercase">Credits to Add</label>
                   <input 
                      type="number" 
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-yellow-500/50 outline-none transition-colors"
                      placeholder="100"
                      required
                   />
                 </div>
                 
                 {adminMsg && (
                    <div className={`text-xs p-3 rounded border ${adminStatus === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-400' : 'bg-green-900/20 border-green-500/30 text-green-400'}`}>
                       {adminMsg}
                    </div>
                 )}

                 <button 
                   type="submit"
                   disabled={adminStatus === 'loading'}
                   className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                 >
                   {adminStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                   INJECT CREDITS
                 </button>
               </form>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>


      {/* Floating Pill Navbar */}
      <MotionDiv 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%] md:max-w-fit"
      >
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between gap-4 md:gap-8 shadow-2xl">
          
          <div className="flex items-center gap-3">
            <AtlasLogo />
            <span className="font-display font-bold text-lg text-white tracking-widest hidden sm:block">ATLAS</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-[10px] md:text-xs font-mono text-blue-400">
               {user.credits} CREDITS
            </div>
            
            {/* ADMIN BUTTON */}
            {user.isAdmin && (
               <>
                 <div className="h-5 w-px bg-white/20"></div>
                 <button 
                   onClick={() => setShowAdminModal(true)}
                   className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all text-xs font-bold tracking-wider"
                 >
                   <Shield className="w-3 h-3" />
                   <span className="hidden md:inline">ADMIN</span>
                 </button>
               </>
            )}

            <div className="h-5 w-px bg-white/20"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                <div className={`text-[10px] font-mono leading-none mt-1 ${user.isAdmin ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {user.isAdmin ? 'ADMINISTRATOR' : 'OPERATIVE'}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${user.isAdmin ? 'bg-yellow-500 text-black border-yellow-300' : 'bg-black text-white border-white/20'}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </MotionDiv>

      {/* Content */}
      <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto flex flex-col items-center min-h-[80vh]">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Operations Center</h1>
          <p className="text-gray-400">Access global intelligence databases.</p>
        </div>

        {/* Search Module */}
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl mb-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Universal Lookup</h3>
                <p className="text-sm text-gray-400">Target: Email, Username, or Roblox ID</p>
              </div>
            </div>
          </div>

          {/* Search Input Area */}
          <div className="p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter target identifier..."
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 pl-14 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/10 transition-all text-lg font-mono"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <button 
                    onClick={handleSearch}
                    disabled={isLoading || !query}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan'}
                  </button>
                </div>
                
                {/* Type Selectors */}
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { id: 'auto', label: 'Auto-Detect' },
                    { id: 'username', label: 'Username' },
                    { id: 'email', label: 'Email' },
                    { id: 'roblox', label: 'Roblox ID' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSearchType(type.id as SearchType)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${
                        searchType === type.id 
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                          : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
            </div>
          </div>
        </MotionDiv>

        {/* RESULTS AREA */}
        <AnimatePresence mode="wait">
          {error && (
            <MotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 mb-8"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </MotionDiv>
          )}

          {result && (
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white tracking-wide uppercase">Intelligence Report</h2>
              </div>

              {/* ROBLOX RESULT */}
              {result.type === 'roblox' && (
                <div className="space-y-4">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-white/5 shadow-2xl flex items-center justify-center">
                        {result.data.avatarUrl ? (
                          <img src={result.data.avatarUrl} alt="Roblox Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                      <div>
                        <h3 className="text-3xl font-bold text-white">{result.data.displayName}</h3>
                        <p className="text-gray-400 font-mono text-sm">@{result.data.name} • ID: {result.data.id}</p>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 w-full text-sm text-gray-300 italic">
                        "{result.data.description || "No description provided."}"
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center md:text-left">
                          <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                            <Users className="w-3 h-3" /> Friends
                          </div>
                          <div className="text-lg text-white font-bold mt-1">
                            {result.data.friendsCount || 0}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center md:text-left">
                          <div className="text-xs text-gray-500 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                            <Crown className="w-3 h-3" /> Followers
                          </div>
                          <div className="text-lg text-white font-bold mt-1">
                            {result.data.followersCount || 0}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center md:text-left">
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Created</div>
                           <div className="text-sm text-white font-mono mt-1">
                             {new Date(result.data.created).toLocaleDateString()}
                           </div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center md:text-left">
                           <div className="text-xs text-gray-500 uppercase tracking-wider">Banned</div>
                           <div className={`text-sm font-mono mt-1 font-bold ${result.data.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                             {result.data.isBanned ? 'YES' : 'NO'}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Groups Section */}
                  {result.data.groups && result.data.groups.length > 0 && (
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden p-6">
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Affiliations / Groups</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {result.data.groups.slice(0, 3).map((group: any, i: number) => (
                           <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                             <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500">
                               GRP
                             </div>
                             <div>
                               <div className="text-sm font-bold text-white">{group.group.name}</div>
                               <div className="text-xs text-blue-400">{group.role.name} (Rank {group.role.rank})</div>
                             </div>
                           </div>
                        ))}
                        {result.data.groups.length > 3 && (
                          <div className="flex items-center justify-center p-3 text-xs text-gray-500">
                            +{result.data.groups.length - 3} more groups
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LEAKCHECK RESULT */}
              {result.type === 'leakcheck' && (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-white">Data Breach Index</h3>
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
                      {result.data.length} HITS FOUND
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="bg-white/5 text-gray-200 font-medium uppercase text-xs">
                        <tr>
                          <th className="p-4">Source</th>
                          <th className="p-4">Identity</th>
                          <th className="p-4">Compromised Data</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {result.data.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white">
                              {item.sources ? item.sources.join(', ') : 'Unknown DB'}
                            </td>
                            <td className="p-4">
                               <div className="flex flex-col">
                                 <span className="text-white">{item.username || 'N/A'}</span>
                                 <span className="text-xs text-gray-500">{item.email}</span>
                                </div>
                            </td>
                            <td className="p-4">
                              <div className="group relative cursor-help w-fit">
                                <span className="blur-sm group-hover:blur-none transition-all duration-300 font-mono bg-white/10 px-2 py-1 rounded text-white select-all">
                                  {item.password || item.hash || '*********'}
                                </span>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-white/20 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Hover to reveal
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs">
                              {item.date ? item.date.split(' ')[0] : 'Unknown'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.data.length === 0 && (
                      <div className="p-12 text-center text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500/50" />
                        <p>No leaks found for this target in the database.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </MotionDiv>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
