
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, ChevronRight, Search, Zap, Target, Shield, Globe, TrendingUp, Cpu, Award, ZapOff, Trophy, Users, DollarSign, Activity, Play, ArrowRight, ChevronDown } from 'lucide-react';
import { MOCK_JOBS } from '../constants';
import ArenaButton from '../components/ui/ArenaButton';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

const BenefitCard = ({ icon, title, index }: { icon: React.ReactNode, title: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -10, borderColor: 'rgba(255, 196, 0, 0.5)', boxShadow: '0 0 30px rgba(255, 196, 0, 0.1)' }}
    className="p-10 bg-[#0A254D]/20 border border-slate-800/50 relative group transition-all duration-500 flex flex-col items-center text-center justify-center min-h-[220px]"
  >
    <div className="text-[#FFC400] mb-6 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="font-syncopate text-[10px] md:text-xs font-bold text-white tracking-[0.3em] uppercase leading-relaxed">
      {title}
    </h3>
  </motion.div>
);

const Careers = () => {
  const [filter, setFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const departments = ['ALL', ...Array.from(new Set(MOCK_JOBS.map(job => job.department)))];

  const filteredJobs = useMemo(() => {
    return filter === 'ALL' ? MOCK_JOBS : MOCK_JOBS.filter(job => job.department === filter);
  }, [filter]);

  return (
    <div className="bg-[#081B3A] min-h-screen overflow-x-hidden selection:bg-[#FFC400] selection:text-black">
      <SEOMeta 
        title="Careers - Join Geekay Esports"
        description="Build the future of esports in the Middle East. Join Geekay Esports and work with elite rosters, coaching staff, and management."
        ogType="website"
      />
      
      {/* 🎬 SECTION 1: HERO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, ease: "easeOut" }}
            className="w-full h-full"
          >
            <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale brightness-[0.2] opacity-40">
              <source src="https://assets.mixkit.co/videos/preview/mixkit-electronic-sports-players-shaking-hands-4467-large.mp4" type="video/mp4" />
            </video>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A] via-[#081B3A]/80 to-[#081B3A]/40 z-10" />
          <div className="absolute inset-0 bg-grid opacity-10 z-10" />
        </div>

        <div className="container mx-auto px-6 relative z-20 flex flex-col items-center text-center pt-24">
          <Breadcrumbs />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-[1px] h-20 bg-[#FFC400] mx-auto mb-10 origin-top"
            />

            <div className="flex flex-col gap-2 mb-12 items-center">
              <div className="relative inline-block mt-4">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.7, ease: "circOut" }}
                  className="font-syncopate text-white text-6xl md:text-[140px] font-black leading-[0.85] tracking-tighter uppercase"
                >
                  CAREERS<span className="text-[#FFC400] drop-shadow-[0_0_50px_rgba(255,196,0,0.4)]">.</span>
                </motion.h1>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "circOut" }}
                  className="absolute -bottom-4 left-0 right-0 h-2 bg-[#FFC400] origin-left shadow-[0_0_20px_rgba(255,196,0,0.5)]"
                />
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-white font-syncopate text-xs md:text-xl mb-16 font-light leading-loose max-w-3xl mx-auto tracking-[0.2em]"
            >
              WE DON’T HIRE EMPLOYEES. <br className="hidden md:block" />
              WE RECRUIT ARCHITECTS OF <span className="text-white font-bold opacity-100 underline decoration-[#FFC400]/50 underline-offset-8">DOMINANCE.</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="flex justify-center items-center"
            >
              <ArenaButton className="h-20 min-w-[280px]" onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}>View</ArenaButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#FFC400] to-transparent" />
        </motion.div>
      </section>

      {/* 🏛 SECTION 2: STAFF BENEFITS */}
      <section className="py-32 md:py-48 px-6 bg-[#040E1E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
            <div>
              <h2 className="font-syncopate text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white">WHY JOIN GEEKAY?</h2>
            </div>
            <div className="h-[2px] hidden lg:block flex-grow mx-16 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BenefitCard icon={<Trophy size={40} />} title="Performance Bonuses" index={0} />
            <BenefitCard icon={<Globe size={40} />} title="Global Exposure" index={1} />
            <BenefitCard icon={<Users size={40} />} title="Elite Network" index={2} />
            <BenefitCard icon={<DollarSign size={40} />} title="Competitive Comp" index={3} />
            <BenefitCard icon={<Activity size={40} />} title="High-Perf Culture" index={4} />
            <BenefitCard icon={<TrendingUp size={40} />} title="Career Acceleration" index={5} />
          </div>
        </div>
      </section>

      {/* 🎯 SECTION 3: JOB OPENINGS */}
      <section id="jobs-section" className="py-32 md:py-60 px-6 bg-[#040E1E] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div>
              <h2 className="font-syncopate text-4xl md:text-8xl font-bold uppercase tracking-tighter text-white">JOB OPENINGS</h2>
            </div>

            {/* Department Filter Dropdown */}
            <div className="relative min-w-[240px]">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-[#0A254D]/20 border border-slate-800 px-6 py-4 flex items-center justify-between text-white font-syncopate text-[10px] font-bold tracking-widest uppercase hover:border-[#FFC400]/40 transition-all"
              >
                {filter === 'ALL' ? 'FILTER BY DEPARTMENT' : filter}
                <ChevronDown size={16} className={`text-[#FFC400] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-[#040E1E] border border-slate-800 z-50 shadow-2xl"
                  >
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setFilter(dept);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-6 py-4 font-syncopate text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-[#FFC400] hover:text-black ${filter === dept ? 'bg-[#FFC400]/10 text-[#FFC400]' : 'text-slate-400'}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job, index) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <Link to={`/careers/${job.slug}`}>
                  <div className="bg-[#0A254D]/10 border border-slate-800 p-10 md:p-16 flex flex-col lg:flex-row lg:items-center justify-between gap-10 transition-all duration-500 hover:border-[#FFC400]/40 hover:bg-[#FFC400]/[0.02] overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
                    
                    <div className="relative z-10 flex-grow">
                      <div className="flex items-center gap-6 mb-8">
                        <span className="bg-[#FFC400] text-black px-6 py-2 font-syncopate text-[10px] font-black tracking-[0.3em] uppercase skew-x-[-15deg]">
                          <span className="block skew-x-[15deg]">{job.department}</span>
                        </span>
                        <div className="h-[1px] w-12 bg-slate-800" />
                        <div className="flex gap-8 text-slate-500">
                          <span className="flex items-center gap-3 font-syncopate text-[10px] font-bold tracking-[0.3em] uppercase transition-colors group-hover:text-white">
                            <MapPin size={14} className="text-[#FFC400]" /> {job.location}
                          </span>
                          <span className="flex items-center gap-3 font-syncopate text-[10px] font-bold tracking-[0.3em] uppercase transition-colors group-hover:text-white">
                            <Briefcase size={14} className="text-[#FFC400]" /> 
                            <span className="px-3 py-1 border border-slate-800 rounded-full text-[8px] group-hover:border-[#FFC400]/50 transition-colors">
                              {job.type}
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-syncopate text-4xl md:text-5xl font-bold text-white uppercase tracking-tighter group-hover:text-[#FFC400] transition-colors leading-none">
                        {job.title}
                      </h3>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-4 font-syncopate text-[10px] font-bold text-[#FFC400] tracking-[0.4em] group-hover:translate-x-4 transition-transform duration-500">
                        VIEW_DETAILS <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Careers;
