import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Search, Lock, ChevronRight, Activity, Database, Server, Cpu, Eye, Network, Terminal } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface OverlayProps {
  isLoaded: boolean;
}

// Workaround for framer-motion type mismatch
const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;

export const Overlay: React.FC<OverlayProps> = ({ isLoaded }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!isLoaded) return null;

  return (
    <>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
      
      <div className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth relative custom-scrollbar">
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
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
          }
        `}</style>

        {/* FIXED HUD ELEMENTS - Always visible overlay */}
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-4 md:inset-8 border border-white/5 hidden md:block rounded-3xl">
             {/* Top Left */}
             <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-blue-500/30 rounded-tl-lg"></div>
             {/* Top Right */}
             <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-blue-500/30 rounded-tr-lg"></div>
             {/* Bottom Left */}
             <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-blue-500/30 rounded-bl-lg"></div>
             {/* Bottom Right */}
             <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-blue-500/30 rounded-br-lg"></div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="relative z-40 flex flex-col items-center w-full">
          
          {/* --- HERO SECTION --- */}
          <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 w-full max-w-7xl mx-auto pt-20 pb-10">
            <div className="flex flex-col items-center gap-8">
              
              {/* Headline */}
              <MotionH1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-8xl font-display font-bold tracking-tight text-white leading-[1.05] max-w-5xl drop-shadow-2xl"
              >
                Global intelligence, <br className="hidden md:block" />
                <span 
                  className="relative inline-block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-blue-500"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.6))' }}
                >
                  simplified for everyone.
                </span>
              </MotionH1>

              {/* Subheadline */}
              <MotionP 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-gray-400 font-light max-w-2xl leading-relaxed"
              >
                The world's most advanced OSINT platform. Visualize data, track assets, and uncover insights with the power of the Atlas engine.
              </MotionP>

              {/* CTA Buttons */}
              <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col md:flex-row items-center gap-4 mt-4"
              >
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-blue-50 transition-colors duration-300 flex items-center gap-2 group"
                >
                  Start Intelligence
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                  View Live Demo
                </button>
              </MotionDiv>
            </div>

            {/* Stats Bar */}
            <MotionDiv 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-full mt-24 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              <div className="absolute left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              {[
                { label: 'Real-time Coverage', value: '100%' },
                { label: 'Data Points', value: '50B+' },
                { label: 'Uptime SLA', value: '99.9%' },
                { label: 'Global Sources', value: '5+' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center group cursor-default pt-8">
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-500 font-medium font-mono tracking-wider uppercase">{stat.label}</div>
                </div>
              ))}
            </MotionDiv>
          </section>

          {/* --- FEATURES SECTION --- */}
          <section className="w-full py-32 px-6 max-w-7xl mx-auto relative">
            <MotionDiv 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400 mb-4">Core Capabilities</h2>
              <h3 className="text-3xl md:text-5xl font-display font-bold text-white">Advanced Reconnaissance</h3>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: Globe, 
                  title: "Global Monitoring", 
                  desc: "Real-time surveillance of open source data channels across 190+ countries with automated translation." 
                },
                { 
                  icon: Shield, 
                  title: "Dark Web Indexing", 
                  desc: "Securely access and analyze hidden networks. Monitor leaks, threats, and illicit marketplaces safely." 
                },
                { 
                  icon: Cpu, 
                  title: "Neural Analysis", 
                  desc: "AI-driven pattern recognition identifies anomalies and connections faster than human analysts." 
                },
                { 
                  icon: Eye, 
                  title: "Visual Intelligence", 
                  desc: "Analyze satellite imagery and social media media streams for geospatial verification." 
                },
                { 
                  icon: Network, 
                  title: "Link Analysis", 
                  desc: "Visualize complex relationships between entities, assets, and organizations in an interactive graph." 
                },
                { 
                  icon: Lock, 
                  title: "Enterprise Security", 
                  desc: "Military-grade encryption and access controls ensure your investigation data remains sovereign." 
                }
              ].map((feature, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
                </MotionDiv>
              ))}
            </div>
          </section>

          {/* --- LIVE INTELLIGENCE STREAM --- */}
          <section className="w-full py-20 px-6 max-w-7xl mx-auto">
            <MotionDiv 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/80 backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
                {/* Left: Terminal */}
                <div className="p-8 font-mono text-xs border-r border-white/10 bg-black/40">
                  <div className="flex items-center gap-2 mb-4 text-gray-500 border-b border-white/5 pb-2">
                    <Terminal className="w-4 h-4" />
                    <span>LIVE_FEED_V0.9</span>
                  </div>
                  <div className="space-y-2 opacity-80">
                    {[
                      { time: "14:02:11", type: "INF", msg: "Scanning node clusters [EU-WEST-2]" },
                      { time: "14:02:14", type: "WRN", msg: "Anomaly detected in sector 7G" },
                      { time: "14:02:15", type: "INF", msg: "Decrypting data packet... SUCCESS" },
                      { time: "14:02:18", type: "INF", msg: "Indexing social graph connections" },
                      { time: "14:02:22", type: "SEC", msg: "Verification complete. Handshake OK." },
                      { time: "14:02:25", type: "INF", msg: "Updating geospatial coordinates" },
                      { time: "14:02:29", type: "INF", msg: "Querying dark web marketplaces..." },
                      { time: "14:02:31", type: "ERR", msg: "Connection timeout [Proxy 404] - Retrying" },
                      { time: "14:02:35", type: "INF", msg: "Re-routing via secure tunnel" },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-gray-600">{log.time}</span>
                        <span className={`${
                          log.type === 'WRN' ? 'text-yellow-500' : 
                          log.type === 'ERR' ? 'text-red-500' : 
                          log.type === 'SEC' ? 'text-green-500' : 'text-blue-400'
                        }`}>[{log.type}]</span>
                        <span className="text-gray-400">{log.msg}</span>
                      </div>
                    ))}
                    <div className="animate-pulse text-blue-500">_</div>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative p-8 flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                   <div className="text-center relative z-10">
                     <div className="w-32 h-32 mx-auto rounded-full border border-blue-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                        <div className="text-2xl font-bold text-white">98%</div>
                     </div>
                     <p className="mt-6 text-sm font-mono text-blue-400 tracking-widest uppercase">Global Threat Index</p>
                     <p className="text-xs text-gray-500 mt-2">Monitoring 15,204 active nodes</p>
                   </div>
                </div>
              </div>
            </MotionDiv>
          </section>

          {/* --- CTA / FOOTER --- */}
          <section className="w-full mt-20 border-t border-white/10 bg-black/40 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Ready to deploy?</h3>
                <p className="text-gray-400 text-sm">Join elite organizations using Atlas for mission-critical intelligence.</p>
              </div>
              <div className="flex gap-4">
                 <button className="px-6 py-3 text-sm font-semibold text-white border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                   Contact Sales
                 </button>
                 <button className="px-6 py-3 text-sm font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                   Get Started
                 </button>
              </div>
            </div>
            <div className="border-t border-white/5 py-8 text-center">
               <p className="text-xs text-gray-600 font-mono">© 2024 ATLAS INTELLIGENCE SYSTEMS. ALL RIGHTS RESERVED.</p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};