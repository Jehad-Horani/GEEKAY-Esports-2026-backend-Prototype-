import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Link as LinkIcon, Tag, ChevronRight, Award } from 'lucide-react';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dbNews, setDbNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setDbNews(data);
          } else if (isMounted) {
            console.warn('API returned non-array data for news:', data);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch news from API:', err);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [slug]);

  const article = useMemo(() => {
    const found = (Array.isArray(dbNews) ? dbNews : []).find(n => n.slug === slug);
    return found ? {
      ...found,
      featured: found.featured === 1 || found.featured === true,
      published: found.published === 1 || found.published === true || found.published === undefined,
      readTime: found.readTime || found.read_time || '4 MIN READ',
    } : null;
  }, [dbNews, slug]);

  const articleTags = useMemo(() => {
    if (!article || !article.tags) return ['GEEKAY', 'ESPORTS', 'MENA'];
    try {
      const parsed = typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return typeof article.tags === 'string' ? article.tags.split(',').map((t: string) => t.trim()) : [];
    }
  }, [article]);

  const nextBriefings = useMemo(() => {
    if (!article) return [];
    const filtered = (Array.isArray(dbNews) ? dbNews : []).filter(n => n.slug !== article.slug && (n.published === 1 || n.published === true || n.published === undefined));
    return filtered.slice(0, 2);
  }, [dbNews, article]);

  // Parse multi-paragraph content from DB/mock content body
  const bodyParagraphs = useMemo(() => {
    if (!article) return [];
    if (!article.content) {
      return [
        "The competitive landscape in the MENA region is evolving at an unprecedented pace. As Geekay Esports continues to dominate the regional circuits, our focus remains on operational excellence and the professional development of our operatives. This latest update follows our strategic roadmap for the 2026 season, emphasizing our commitment to the global esports ecosystem.",
        "Our performance analytics team has been working closely with the coaching staff to refine tactics and ensure peak performance across all divisions. We are seeing significant growth in our strategic initiatives, particularly in the integration of youth talent into our championship-winning rosters.",
        "Looking ahead to the upcoming international qualifiers, we have implemented a rigorous training regimen designed to address high-pressure scenarios and diverse meta-shifts. Our operatives consistently demonstrate the resilience and technical proficiency required to compete at the highest levels of global competition.",
        "Geekay Esports values the overwhelming support from our community. Every victory is shared with our fans, and we are dedicated to delivering world-class entertainment and competitive success. Stay tuned for more operational briefings as we progress through the competitive calendar."
      ];
    }
    return article.content.split('\n\n').filter((p: string) => p.trim().length > 0);
  }, [article]);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-syncopate text-4xl font-bold text-white mb-8">INTEL DECLASSIFIED OR NOT FOUND</h1>
          <Link to="/news">
            <ArenaButton>RETURN TO FEED</ArenaButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081B3A] pt-32 pb-20 relative overflow-hidden">
      <SEOMeta 
        title={`${article.title} - Geekay Esports News`}
        description={article.excerpt || article.content?.slice(0, 150) || `Latest news and updates regarding ${article.title} at Geekay Esports.`}
        ogImage={article.image}
        ogType="article"
      />
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#FFC400]/5 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <Breadcrumbs />
        <Link to="/news" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#FFC400] font-syncopate text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest transition-colors mb-8 sm:mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO INTEL FEED
        </Link>

        {/* Article Metadata Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <span className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-widest uppercase mb-4 sm:mb-6 inline-block">
            <span>{article.category}</span>
          </span>
          
          <h1 className="font-syncopate text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-tight tracking-tight mb-6 sm:mb-8 break-words">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 text-slate-400 font-syncopate text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest border-y border-slate-800 py-4 sm:py-6">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#FFC400]" />
              {article.date}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#FFC400]" />
              {article.readTime || '4 MIN READ'}
            </div>
            
            <div className="flex items-center gap-4 sm:ml-auto">
              <span className="text-slate-500">SHARE:</span>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#FFC400] transition-colors">
                <Twitter size={16} />
              </a>
              <button onClick={handleShareCopy} className="hover:text-[#FFC400] transition-colors relative" title="Copy URL Link">
                <LinkIcon size={16} />
                {copied && (
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#FFC400] text-[8px] px-2 py-0.5 whitespace-nowrap rounded">COPIED!</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Cover Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative aspect-[16/9] mb-10 sm:mb-16 overflow-hidden border border-slate-800 bg-slate-950"
        >
          <img 
            src={article.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'} 
            alt={article.title} 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
            }}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A]/40 to-transparent" />
        </motion.div>

        {/* Rich Article Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Highlighted Quote Intro */}
            <div className="border-l-4 border-[#FFC400] pl-6 py-2 italic text-slate-200 text-lg md:text-xl bg-white/5 pr-4 rounded-r-md leading-relaxed font-light">
              "{article.excerpt}"
            </div>

            {/* Dynamic paragraphs rendering */}
            <div className="text-slate-300 text-base md:text-lg leading-relaxed space-y-6 font-light">
              {bodyParagraphs.map((paragraph: string, index: number) => {
                // Insert a visual division halfway
                if (index === Math.floor(bodyParagraphs.length / 2) && bodyParagraphs.length > 2) {
                  return (
                    <React.Fragment key={index}>
                      <h3 className="font-syncopate text-xl font-bold text-white uppercase pt-6 pb-2 tracking-wide flex items-center gap-3">
                        <Award size={18} className="text-[#FFC400]" />
                        TACTICAL OVERVIEW
                      </h3>
                      <p>{paragraph}</p>
                    </React.Fragment>
                  );
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </div>

            {/* Tags footer */}
            {articleTags.length > 0 && (
              <div className="pt-12 flex flex-wrap gap-2 items-center">
                <span className="text-slate-500 font-syncopate text-[9px] tracking-widest mr-2 uppercase flex items-center gap-1.5">
                  <Tag size={12} className="text-[#FFC400]" /> TAGS:
                </span>
                {articleTags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-slate-900 border border-slate-800 text-[#FFC400] px-3 py-1 text-[9px] font-mono tracking-widest uppercase rounded-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sidebar Metadata (Team, game, division details) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0A1A31] border border-slate-800 p-6 relative group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FFC400] via-[#FFC400]/40 to-transparent" />
              
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
                  <h3 className="font-syncopate text-[10px] sm:text-[11px] font-black text-white tracking-[0.2em] uppercase">
                    BRIEF_SPECIFICATIONS
                  </h3>
                </div>
                <span className="font-mono text-[9px] text-[#FFC400]/80 font-bold">#INTEL</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[#040E1E] border border-white/5 p-3.5 space-y-1.5">
                  <span className="text-slate-500 uppercase tracking-[0.15em] font-syncopate text-[8px] font-bold block">
                    SECURITY LEVEL
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold tracking-wider uppercase bg-emerald-950/40 px-2 py-0.5 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    PUBLIC_RELEASE
                  </div>
                </div>

                {article.related_team && (
                  <div className="bg-[#040E1E] border border-white/5 p-3.5 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-[0.15em] font-syncopate text-[8px] font-bold block">
                      ASSIGNED TEAM
                    </span>
                    <span className="text-white font-syncopate text-[11px] font-bold tracking-wide uppercase block">
                      {article.related_team}
                    </span>
                  </div>
                )}

                {article.related_game && (
                  <div className="bg-[#040E1E] border border-white/5 p-3.5 space-y-1.5">
                    <span className="text-slate-500 uppercase tracking-[0.15em] font-syncopate text-[8px] font-bold block">
                      GAME DIVISION
                    </span>
                    <span className="text-[#FFC400] font-syncopate text-[11px] font-bold tracking-wide uppercase block">
                      {article.related_game}
                    </span>
                  </div>
                )}

                <div className="bg-[#040E1E] border border-white/5 p-3.5 space-y-1.5">
                  <span className="text-slate-500 uppercase tracking-[0.15em] font-syncopate text-[8px] font-bold block">
                    CHANNEL ORIGIN
                  </span>
                  <span className="text-slate-300 font-mono text-xs font-semibold tracking-wider uppercase block">
                    GEEKAY_HQ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* C) Related Content Section */}
        <div className="mt-24 pt-16 border-t border-slate-800">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1.5 h-1.5 bg-[#FFC400] rounded-full" />
            <h3 className="font-syncopate text-xl md:text-2xl font-black text-white uppercase tracking-wider">NEXT BRIEFINGS</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {nextBriefings.map(item => (
              <Link key={item.id} to={`/news/${item.slug}`} className="group block bg-[#0A1A31] border border-slate-800 p-8 hover:border-[#FFC400]/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#FFC400] font-syncopate text-[8px] font-bold tracking-widest uppercase">{item.category}</span>
                    <span className="text-slate-500 font-syncopate text-[8px] tracking-widest">{item.date}</span>
                  </div>
                  <h4 className="font-syncopate text-base font-bold text-white uppercase group-hover:text-[#FFC400] transition-colors line-clamp-2 leading-snug mb-4">{item.title}</h4>
                  <p className="text-slate-400 text-xs font-light line-clamp-2 leading-relaxed mb-6">{item.excerpt}</p>
                </div>
                <div className="flex items-center gap-2 text-[#FFC400] font-syncopate text-[8px] font-bold tracking-[0.2em] uppercase mt-auto">
                  RETRIEVE INTEL <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
