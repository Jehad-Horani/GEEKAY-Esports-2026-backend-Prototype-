
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, ChevronLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOCK_JOBS } from '../constants';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

const JobDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const job = MOCK_JOBS.find(j => j.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!job) {
    return (
      <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-syncopate text-4xl text-white mb-8">JOB NOT FOUND</h1>
          <Link to="/careers">
            <ArenaButton variant="outline">BACK TO JOB OPENINGS</ArenaButton>
          </Link>
        </div>
      </div>
    );
  }

  const mailtoSubject = `Application – ${job.title}`;
  const mailtoLink = `mailto:inquiries@geekay.com?subject=${encodeURIComponent(mailtoSubject)}`;

  return (
    <div className="bg-[#081B3A] min-h-screen selection:bg-[#FFC400] selection:text-black pt-32 pb-60">
      <SEOMeta 
        title={`${job.title} - Careers at Geekay Esports`}
        description={job.summary || `Apply for the ${job.title} position in the ${job.department} department at Geekay Esports.`}
        ogType="article"
      />
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <Breadcrumbs />
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-16"
        >
          <Link 
            to="/careers" 
            className="group flex items-center gap-4 text-slate-500 hover:text-[#FFC400] transition-colors font-syncopate text-[10px] tracking-[0.4em] font-bold uppercase"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            BACK TO JOB OPENINGS
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <span className="bg-[#FFC400] text-black px-6 py-2 font-syncopate text-[10px] font-black tracking-[0.3em] uppercase skew-x-[-15deg]">
                  <span className="block skew-x-[15deg]">{job.department}</span>
                </span>
                <div className="h-[1px] w-12 bg-slate-800 hidden md:block" />
                <div className="flex gap-8 text-slate-400">
                  <span className="flex items-center gap-3 font-syncopate text-[10px] font-bold tracking-[0.3em] uppercase"><MapPin size={14} className="text-[#FFC400]" /> {job.location}</span>
                  <span className="flex items-center gap-3 font-syncopate text-[10px] font-bold tracking-[0.3em] uppercase"><Briefcase size={14} className="text-[#FFC400]" /> {job.type}</span>
                </div>
              </div>

              <h1 className="font-syncopate text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-12">
                {job.title}
              </h1>

              <div className="space-y-20">
                {/* OVERVIEW */}
                <section>
                  <h2 className="font-syncopate text-xl text-white font-bold tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                    OVERVIEW
                  </h2>
                  <p className="text-slate-400 font-inter text-xl md:text-2xl font-light leading-relaxed border-l-2 border-[#FFC400] pl-8">
                    {job.summary}
                  </p>
                </section>

                {/* Responsibilities */}
                <section>
                  <h2 className="font-syncopate text-xl text-white font-bold tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                    RESPONSIBILITIES
                  </h2>
                  <ul className="space-y-6">
                    {job.responsibilities.map((item, i) => (
                      <li key={i} className="flex gap-6 group">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-[#FFC400] shrink-0 group-hover:scale-150 transition-transform" />
                        <p className="text-slate-400 font-inter text-lg leading-relaxed group-hover:text-white transition-colors">{item}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Requirements */}
                <section>
                  <h2 className="font-syncopate text-xl text-white font-bold tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                    REQUIREMENTS
                  </h2>
                  <ul className="space-y-6">
                    {job.requirements.map((item, i) => (
                      <li key={i} className="flex gap-6 group">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-[#FFC400] shrink-0 group-hover:scale-150 transition-transform" />
                        <p className="text-slate-400 font-inter text-lg leading-relaxed group-hover:text-white transition-colors">{item}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Nice to have */}
                {job.niceToHave && job.niceToHave.length > 0 && (
                  <section>
                    <h2 className="font-syncopate text-xl text-white font-bold tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                      NICE TO HAVE
                    </h2>
                    <ul className="space-y-6">
                      {job.niceToHave.map((item, i) => (
                        <li key={i} className="flex gap-6 group">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-slate-700 shrink-0 group-hover:bg-[#FFC400] transition-colors" />
                          <p className="text-slate-500 font-inter text-lg leading-relaxed group-hover:text-slate-300 transition-colors">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Benefits */}
                <section>
                  <h2 className="font-syncopate text-xl text-white font-bold tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                    BENEFITS
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {job.benefits.map((item, i) => (
                      <div key={i} className="p-6 bg-[#0A254D]/20 border border-slate-800/50 flex items-center gap-4 group hover:border-[#FFC400]/30 transition-all">
                        <CheckCircle2 size={20} className="text-[#FFC400] opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-slate-300 font-syncopate text-[10px] font-bold tracking-[0.2em] uppercase">{item}</span>
                      </div>
                    ))}
                    <div className="p-6 bg-[#0A254D]/20 border border-slate-800/50 flex items-center gap-4 group hover:border-[#FFC400]/30 transition-all">
                      <CheckCircle2 size={20} className="text-[#FFC400] opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-slate-300 font-syncopate text-[10px] font-bold tracking-[0.2em] uppercase">Exposure to esports industry</span>
                    </div>
                    <div className="p-6 bg-[#0A254D]/20 border border-slate-800/50 flex items-center gap-4 group hover:border-[#FFC400]/30 transition-all">
                      <CheckCircle2 size={20} className="text-[#FFC400] opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-slate-300 font-syncopate text-[10px] font-bold tracking-[0.2em] uppercase">High-performance team culture</span>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Apply */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sticky top-32 space-y-8"
            >
              <div className="bg-[#0A254D]/30 border border-slate-800 p-10 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
                
                <h3 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter mb-8">
                  APPLY NOW
                </h3>
                
                <p className="text-slate-400 font-inter text-sm leading-relaxed mb-10">
                  Ready to join the elite? Send your CV and portfolio to our recruitment team.
                </p>

                <a href={mailtoLink} className="block w-full mb-8">
                  <ArenaButton 
                    className="w-full h-20 group relative overflow-hidden"
                    icon={<ArrowRight className="group-hover:translate-x-2 transition-transform" />}
                  >
                    <span className="relative z-10">APPLY NOW</span>
                    {/* Premium Shine Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </ArenaButton>
                </a>

                <div className="pt-8 border-t border-slate-800/50">
                  <p className="text-slate-500 font-syncopate text-[9px] font-bold tracking-widest uppercase mb-4">
                    For partnerships and business inquiries:
                  </p>
                  <a href="mailto:business@geekay.com" className="text-white hover:text-[#FFC400] transition-colors font-bold text-sm tracking-widest">
                    business@geekay.com
                  </a>
                </div>
              </div>

              {/* OFFICE CONTEXT */}
              <div className="bg-[#040E1E]/50 border border-slate-800/50 p-8 space-y-6">
                <div>
                  <h4 className="font-syncopate text-[10px] text-yellow-500 font-bold mb-3 tracking-widest">RIYADH (PRIMARY)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Al Nemer Center, 2nd Tower, 3rd Floor, Office 312<br />
                    P.O. Box 12214, Riyadh
                  </p>
                </div>
                <div>
                  <h4 className="font-syncopate text-[10px] text-yellow-500 font-bold mb-3 tracking-widest">UAE</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Dubai – Al Aweer, Ras Al Khor
                  </p>
                </div>
              </div>

              <div className="p-8 border border-slate-800/50 bg-[#040E1E]/30">
                <p className="text-slate-500 font-inter text-[10px] leading-relaxed italic">
                  Geekay Esports is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all operatives.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
