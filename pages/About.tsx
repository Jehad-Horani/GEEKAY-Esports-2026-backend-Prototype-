
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Play, ArrowRight, Activity, ChevronRight, ChevronLeft, Zap, Target, Shield, Cpu, X, Mail, Globe, Trophy, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

// --- Utility: Animated Counter ---
const Counter = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const match = value.match(/(\d+)/);
  const numericValue = match ? parseInt(match[0]) : 0;
  const prefix = value.split(/\d+/)[0] || '';
  const suffix = value.split(/\d+/)[1] || '';

  useEffect(() => {
    if (isInView && numericValue > 0) {
      let start = 0;
      const end = numericValue;
      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;
      const timer = setInterval(() => {
        start += 1;
        setDisplayValue(start);
        if (start === end) clearInterval(timer);
      }, Math.max(incrementTime, 20));
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, duration]);

  if (numericValue === 0) return <span>{value}</span>;

  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
};

// --- Sub-components ---

const SectionTitle = ({ title, titleAccent }: { title: string; titleAccent?: string }) => (
  <div className="mb-10">
    <h2 className="font-syncopate text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white">
      {title} {titleAccent && <span className="text-[#FFC400]">{titleAccent}</span>}
    </h2>
  </div>
);

const HUDStatCard = ({ label, value, index, isPriority = false }: { label: string; value: string; index: number; isPriority?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.6 }}
    whileHover={{ 
      y: -8, 
      borderColor: 'rgba(255, 196, 0, 0.4)', 
      backgroundColor: 'rgba(10, 37, 77, 0.4)',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,196,0,0.05)'
    }}
    className={`
      relative p-8 md:p-10 flex flex-col justify-center min-h-[160px] md:min-h-[200px] group transition-all duration-500 
      backdrop-blur-xl border border-white/5 overflow-hidden
      ${isPriority ? 'bg-[#FFC400]/5 border-[#FFC400]/20' : 'bg-white/[0.02]'}
    `}
  >
    {/* Inner Shadow / Glow Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    
    {/* Gold Micro Separator */}
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400]/20 to-transparent" />
    
    {/* Priority Pulse */}
    {isPriority && (
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[#FFC400]/5 pointer-events-none"
      />
    )}
    
    <div className="font-syncopate text-[10px] text-slate-500 tracking-[0.4em] mb-4 uppercase group-hover:text-[#FFC400] transition-colors flex items-center gap-3">
      <div className={`w-1.5 h-1.5 rounded-full ${isPriority ? 'bg-[#FFC400] animate-pulse' : 'bg-slate-700'}`} />
      {label}
    </div>
    
    <div className={`font-syncopate text-4xl md:text-6xl font-bold tracking-tighter transition-all duration-500 ${isPriority ? 'text-[#FFC400]' : 'text-white'}`}>
      <Counter value={value} />
    </div>

    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#FFC400]/30" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#FFC400]/30" />
  </motion.div>
);

const About = () => {
  const leadershipData = [
    { 
      name: "KISHAN", 
      role: "CEO , FOUNDER", 
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Visionary leader driving global expansion and defining the future of MENA esports.",
      linkedin: "#"
    },
    { 
      name: "RAGHEED", 
      role: "HEAD OF ESPORTS", 
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Architect of competitive dominance, overseeing all team operations and performance.",
      linkedin: "#"
    },
    { 
      name: "IHAB", 
      role: "HEAD OF OPERATIONS", 
      photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Ensuring operational excellence and infrastructure scalability across the organization.",
      linkedin: "#"
    },
    { 
      name: "ALI", 
      role: "HEAD OF CONTENT", 
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Leading the narrative and digital presence of Geekay through elite storytelling.",
      linkedin: "#"
    },
    { 
      name: "AOY", 
      role: "BIZDEV MANAGER", 
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Driving strategic partnerships and business growth in the KSA region.",
      linkedin: "#"
    },
    { 
      name: "NOUR", 
      role: "KSA OPERATIONS", 
      photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Managing on-ground operations and community engagement within Saudi Arabia.",
      linkedin: "#"
    },
    { 
      name: "ARTHUR", 
      role: "HEAD OF SOCIALS", 
      photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Commanding the social meta and fan interaction across all platforms.",
      linkedin: "#"
    },
    { 
      name: "YAZEED", 
      role: "HEAD OF CREATIVES", 
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=500&h=600", 
      desc: "Defining the visual identity and uncompromising aesthetic of the brand.",
      linkedin: "#"
    }
  ];

  return (
    <div className="bg-[#081B3A] overflow-x-hidden selection:bg-[#FFC400] selection:text-black pt-32">
      <SEOMeta 
        title="About Geekay Esports - Organization, Vision, Leadership"
        description="Learn about Geekay Esports. Founded in 2021, we are a professional Middle Eastern esports organization representing elite rosters globally."
        ogType="website"
      />
      
      {/* 📊 SECTION — PERFORMANCE SNAPSHOT */}
      <section className="py-24 px-6 md:px-12 bg-[#040E1E] relative border-b border-white/5 overflow-hidden">
        {/* Background Grid Overlay */}
        <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Breadcrumbs />
          
          {/* TOP: EXECUTIVE HEADLINE */}
          <div className="mb-20 max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }} 
              viewport={{ once: true }}
            >
              <h1 className="font-syncopate text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase text-white mb-10">
                GEEKAY ESPORTS<br />
                <span className="text-[#FFC400]">ORGANIZATION</span>
              </h1>

              <div className="space-y-8 border-l border-white/10 pl-10 py-2">
                <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed font-syncopate tracking-tight uppercase">
                  A multi-division organization engineered for sustained performance across global titles.
                </p>
                <p className="text-slate-500 font-inter text-base leading-relaxed font-light max-w-md">
                  We operate at the intersection of elite talent and analytical precision, maintaining a consistent presence on the world's most competitive stages.
                </p>
              </div>
            </motion.div>
          </div>

          {/* BOTTOM: STATS GRID (3x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <HUDStatCard label="ACTIVE TEAMS" value="10" index={0} />
            <HUDStatCard label="GLOBAL REACH" value="24M" index={1} />
            <HUDStatCard label="TOTAL W’S" value="47+" index={2} />
            <HUDStatCard label="EWC PLACEMENTS" value="20th Place" index={3} isPriority={true} />
            <HUDStatCard label="TOTAL STAFF" value="85+" index={4} />
            <HUDStatCard label="NATIONALITIES" value="18" index={5} />
          </div>
        </div>
      </section>

      {/* 🔮 SECTION — VISION AND MISSION */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#081B3A] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionTitle title="VISION AND" titleAccent="MISSION" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="border border-slate-800 p-10 bg-[#040E1E]/40 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 w-2 h-2 bg-[#FFC400]" />
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[#FFC400]">
                  <Target size={28} />
                  <span className="font-syncopate text-xs tracking-widest font-black uppercase">OUR STRATEGIC VISION</span>
                </div>
                <p className="text-slate-300 font-inter text-base font-light leading-relaxed">
                  To establish Geekay Esports as the definitive benchmark for competitive gaming in the Middle East and North Africa. We aim to export regional athletic excellence onto the global stage, proving that champions forged in MENA belong under international lights.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-900 text-slate-500 font-mono text-[9px] tracking-wider uppercase">
                TARGETS: INT_PRESTIGE // GLOBAL_STANDARDS
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="border border-slate-800 p-10 bg-[#040E1E]/40 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-2 h-2 bg-white" />
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <Award size={28} className="text-[#FFC400]" />
                  <span className="font-syncopate text-xs tracking-widest font-black uppercase">OUR CORE MISSION</span>
                </div>
                <p className="text-slate-300 font-inter text-base font-light leading-relaxed">
                  To recruit, nurture, and optimize elite athletic talent through dedicated, data-backed operational coaching. We construct high-performance environments and establish regional infrastructure that enables our teams to consistently secure tournament victories.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-900 text-slate-500 font-mono text-[9px] tracking-wider uppercase">
                OPERATIONS: TALENT_ENGINES // ATHLETE_HYPERDRIVE
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 👥 SECTION — COMMAND STRUCTURE (Leadership) */}
      <section className="py-24 md:py-48 px-6 md:px-12 bg-[#040E1E] border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionTitle title="LEADERSHIP" titleAccent="TEAM" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {leadershipData.map((leader, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative aspect-[2/3] overflow-hidden border border-slate-800 bg-slate-900/10 cursor-default transition-all duration-500 hover:border-[#FFC400] hover:shadow-[0_0_40px_rgba(255,196,0,0.2)]"
              >
                <img 
                  src={leader.photo} 
                  alt={leader.name} 
                  className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0" 
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#040E1E]/0 group-hover:bg-[#040E1E]/90 transition-all duration-500 flex flex-col justify-end p-8">
                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-syncopate text-2xl font-bold text-white mb-1 uppercase tracking-tighter leading-none">{leader.name}</h3>
                    <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.2em] font-bold uppercase block mb-4">{leader.role}</span>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <p className="text-slate-300 text-sm font-light leading-relaxed mb-6">
                        {leader.desc}
                      </p>
                      
                      {leader.linkedin && (
                        <a 
                          href={leader.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-white hover:text-[#FFC400] transition-colors text-[10px] font-syncopate tracking-widest"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LINKEDIN
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🤝 SECTION — CORPORATE PARTNERS */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#040E1E] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.02] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionTitle title="CORPORATE" titleAccent="PARTNERS" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { name: "GEEKAY RETAIL", desc: "Leading MENA Gaming Distributor", category: "PARENT COMPANY" },
              { name: "PREDATOR GAMING", desc: "Official High-Performance PC Partner", category: "ENDEMIC SPONSOR" },
              { name: "INTEL CORE", desc: "Elite Hardware & Processor Supplier", category: "TECHNICAL SPONSOR" },
              { name: "RAZER GEAR", desc: "Professional Grade Peripherals", category: "PERIPHERAL SPONSOR" }
            ].map((partner, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 bg-[#081B3A]/40 border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[180px]"
              >
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#FFC400]/5 to-transparent rounded-bl-sm" />
                <div>
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-[0.3em] uppercase block mb-2">{partner.category}</span>
                  <h3 className="text-white font-syncopate text-base font-black tracking-wider uppercase group-hover:text-[#FFC400] transition-colors">{partner.name}</h3>
                </div>
                <p className="text-slate-400 font-inter text-xs font-light leading-relaxed mt-4">
                  {partner.desc}
                </p>
                
                {/* Subtle visual accent */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-800 group-hover:bg-[#FFC400]/30 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📞 SECTION — CONTACT CHANNELS */}
      <section className="py-32 md:py-60 px-6 bg-[#081B3A] border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">OFFICIAL_PROTOCOLS</span>
            <h2 className="font-syncopate text-4xl md:text-8xl font-bold uppercase tracking-tighter text-white mb-6">CONTACT CHANNELS</h2>
            <p className="text-slate-500 font-syncopate text-[10px] tracking-[0.3em] uppercase font-bold">Official communication lines — choose the right channel.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'GENERAL INQUIRIES',
                email: 'inquiries@geekay.com',
                purpose: 'Questions, support, and general requests.',
                icon: <Globe size={32} />
              },
              {
                title: 'PARTNERSHIPS AND BUSINESS',
                email: 'business@geekay.com',
                purpose: 'Sponsorships, collaborations, brand deals.',
                icon: <Trophy size={32} />
              },
              {
                title: 'OFFICE LOCATIONS',
                isLocation: true,
                icon: <MapPin size={32} />
              }
            ].map((channel, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-[#0A254D]/20 border border-slate-800/50 p-12 flex flex-col items-center text-center transition-all duration-500 hover:y-[-10px] hover:border-[#FFC400]/40 hover:shadow-[0_20px_50px_rgba(255,196,0,0.1)]"
              >
                {/* Executive Command Panel Design */}
                <div className="text-[#FFC400] mb-8 group-hover:scale-110 transition-transform duration-500">
                  {channel.icon}
                </div>
                
                <div className="h-[1px] w-12 bg-[#FFC400]/30 mb-8 group-hover:w-24 transition-all duration-500" />

                <h3 className="font-syncopate text-sm font-bold text-white tracking-[0.3em] uppercase mb-4 group-hover:text-[#FFC400] transition-colors">
                  {channel.title}
                </h3>
                
                {channel.isLocation ? (
                  <div className="space-y-6 w-full">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-[#FFC400]" />
                        <span className="text-[#FFC400] font-syncopate text-[10px] font-black tracking-widest uppercase">Riyadh (Primary)</span>
                      </div>
                      <p className="text-slate-400 font-inter text-xs leading-relaxed">
                        Al Nemer Center, 2nd Tower, 3rd Floor, Office 312<br />
                        P.O. Box 12214, Riyadh<br />
                        +966 54 097 4261<br />
                        esports@geekaygroupmea.com
                      </p>
                    </div>
                    
                    <div className="h-[1px] w-12 bg-white/5 mx-auto" />
                    
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-[#FFC400]" />
                        <span className="text-[#FFC400] font-syncopate text-[10px] font-black tracking-widest uppercase">UAE</span>
                      </div>
                      <p className="text-slate-400 font-inter text-xs leading-relaxed">
                        1 19D Street, Al Aweer, Industrial Area First, Ras Al Khor<br />
                        P.O. Box 2589, Dubai<br />
                        +971 52 505 9709<br />
                        esports@geekaygroupmea.com
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-500 font-inter text-sm mb-8 leading-relaxed">
                      {channel.purpose}
                    </p>

                    <a href={`mailto:${channel.email}`} className="relative group/mail">
                      <span className="text-white font-syncopate text-[10px] font-bold tracking-widest relative">
                        {channel.email}
                        <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#FFC400] group-hover:w-full transition-all duration-500" />
                      </span>
                    </a>

                    <div className="mt-12 flex items-center gap-3 text-[#FFC400] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <span className="font-syncopate text-[8px] font-black tracking-[0.4em] uppercase">OPEN CHANNEL</span>
                      <ArrowRight size={14} />
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 right-8 opacity-20 group-hover:opacity-100 transition-opacity">
                   <span className="font-syncopate text-[7px] text-slate-500 font-bold tracking-widest uppercase">
                     {channel.isLocation ? 'ESTABLISHED PRESENCE' : 'Typical response: 24–48h'}
                   </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
