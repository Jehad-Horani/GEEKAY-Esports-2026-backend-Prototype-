
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Briefcase, ChevronRight, Search, Zap, Target, Shield, Globe, TrendingUp, Cpu, Award, ZapOff, Trophy, Users, DollarSign, Activity, Play, ArrowRight, ChevronDown } from 'lucide-react';
import { MOCK_JOBS } from '../constants';
import { Job } from '../types';
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

import { safeJsonParse } from '../src/utils/json';

const Careers = () => {
  const [filter, setFilter] = useState('ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/jobs')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          const mapped: Job[] = data.map((j: any) => ({
            id: String(j.id),
            slug: j.slug || String(j.id),
            title: j.title,
            department: j.department || 'OPERATIONS',
            location: j.location || 'RIYADH, SAUDI ARABIA',
            type: j.work_type || j.type || 'FULL-TIME',
            summary: j.summary || '',
            responsibilities: safeJsonParse(j.responsibilities, []),
            requirements: safeJsonParse(j.requirements, []),
            niceToHave: safeJsonParse(j.nice_to_have || j.niceToHave, []),
            benefits: safeJsonParse(j.benefits, []),
            email: j.email || j.application_email || ''
          }));
          setDbJobs(mapped);
        }
      })
      .catch(err => console.error('Failed to fetch jobs:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const departments = useMemo(() => ['ALL', ...Array.from(new Set(dbJobs.map(job => job.department)))], [dbJobs]);

  const filteredJobs = useMemo(() => {
    return filter === 'ALL' ? dbJobs : dbJobs.filter(job => job.department === filter);
  }, [filter, dbJobs]);

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

        <div className="container mx-auto px-4 sm:px-6 relative z-20 flex flex-col items-center text-center pt-24 sm:pt-32">
          <Breadcrumbs />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-5xl"
          >
            <motion.div 
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-[1px] h-12 sm:h-20 bg-[#FFC400] mx-auto mb-6 sm:mb-10 origin-top"
            />

            <div className="flex flex-col gap-2 mb-8 sm:mb-12 items-center">
              <div className="relative inline-block mt-2 sm:mt-4 max-w-full">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.7, ease: "circOut" }}
                  className="font-syncopate text-white text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-black leading-tight sm:leading-[0.85] tracking-tight uppercase break-words"
                >
                  CAREERS<span className="text-[#FFC400] drop-shadow-[0_0_50px_rgba(255,196,0,0.4)]">.</span>
                </motion.h1>
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "circOut" }}
                  className="absolute -bottom-2 sm:-bottom-4 left-0 right-0 h-1 sm:h-2 bg-[#FFC400] origin-left shadow-[0_0_20px_rgba(255,196,0,0.5)]"
                />
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-slate-200 font-syncopate text-xs sm:text-sm md:text-lg mb-10 sm:mb-16 font-light leading-relaxed sm:leading-loose max-w-3xl mx-auto tracking-wide sm:tracking-[0.2em] px-2"
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
              <ArenaButton className="h-14 sm:h-20 min-w-[200px] sm:min-w-[280px]" onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}>View Openings</ArenaButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40"
        >
          <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-[#FFC400] to-transparent" />
        </motion.div>
      </section>

      {/* 🏛 SECTION 2: STAFF BENEFITS */}
      <section className="py-16 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 bg-[#040E1E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-12 mb-12 sm:mb-20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
                <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
                  WHY JOIN GEEKAY
                </span>
              </div>
              <h2 className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight break-words">WHY JOIN GEEKAY?</h2>
            </div>
            <div className="h-[2px] hidden lg:block flex-grow mx-16 bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <BenefitCard icon={<Trophy size={36} />} title="Performance Bonuses" index={0} />
            <BenefitCard icon={<Globe size={36} />} title="Global Exposure" index={1} />
            <BenefitCard icon={<Users size={36} />} title="Elite Network" index={2} />
            <BenefitCard icon={<DollarSign size={36} />} title="Competitive Comp" index={3} />
            <BenefitCard icon={<Activity size={36} />} title="High-Perf Culture" index={4} />
            <BenefitCard icon={<TrendingUp size={36} />} title="Career Acceleration" index={5} />
          </div>
        </div>
      </section>

      {/* 🎯 SECTION 3: JOB OPENINGS */}
      <section id="jobs-section" className="py-16 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 bg-[#040E1E] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 sm:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
                <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
                  ACTIVE RECRUITMENT
                </span>
              </div>
              <h2 className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight break-words">JOB OPENINGS</h2>
            </div>

            {/* Department Filter Dropdown */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
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
                  <div className="bg-[#0A254D]/10 border border-slate-800 p-5 sm:p-8 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-10 transition-all duration-500 hover:border-[#FFC400]/40 hover:bg-[#FFC400]/[0.02] overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
                    
                    <div className="relative z-10 flex-grow">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-8">
                        <span className="bg-[#FFC400] text-black px-4 sm:px-6 py-1.5 sm:py-2 font-syncopate text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-[0.3em] uppercase">
                          <span>{job.department}</span>
                        </span>
                        <div className="h-[1px] w-8 sm:w-12 bg-slate-800 hidden sm:block" />
                        <div className="flex flex-wrap gap-4 sm:gap-8 text-slate-300">
                          <span className="flex items-center gap-2 font-syncopate text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-colors group-hover:text-white">
                            <MapPin size={13} className="text-[#FFC400] shrink-0" /> {job.location}
                          </span>
                          <span className="flex items-center gap-2 font-syncopate text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-colors group-hover:text-white">
                            <Briefcase size={13} className="text-[#FFC400] shrink-0" /> 
                            <span className="px-2.5 py-0.5 border border-slate-800 rounded-full text-[8px] group-hover:border-[#FFC400]/50 transition-colors">
                              {job.type}
                            </span>
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-syncopate text-xl sm:text-2xl md:text-4xl font-black text-white uppercase tracking-tight group-hover:text-[#FFC400] transition-colors leading-tight break-words">
                        {job.title}
                      </h3>
                    </div>

                    <div className="relative z-10 pt-2 sm:pt-0">
                      <div className="flex items-center gap-2 sm:gap-4 font-syncopate text-[9px] sm:text-[10px] font-bold text-[#FFC400] tracking-wider sm:tracking-[0.4em] group-hover:translate-x-2 transition-transform duration-500">
                        VIEW DETAILS <ChevronRight size={16} />
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
