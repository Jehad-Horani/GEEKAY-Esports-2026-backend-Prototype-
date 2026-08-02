import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Link as LinkIcon, User, Tag, ChevronRight, Award } from 'lucide-react';
import { MOCK_NEWS } from '../constants';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dbNews, setDbNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      try {
        const res = await fetch('/api/news', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbNews(data);
          } else {
            console.warn('API returned non-array data for news:', data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch news from API (or timed out):', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
  }, [slug]);

  const article = useMemo(() => {
    let found = (Array.isArray(dbNews) ? dbNews : []).find(n => n.slug === slug);
    if (!found) {
      found = MOCK_NEWS.find(n => n.slug === slug);
    }
    return found ? {
      ...found,
      featured: found.featured === 1 || found.featured === true,
      published: found.published === 1 || found.published === true || found.published === undefined,
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
    MOCK_NEWS.forEach(mock => {
      if (filtered.length < 2 && mock.slug !== article.slug && !filtered.some(n => n.slug === mock.slug)) {
        filtered.push(mock);
      }
    });
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
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Breadcrumbs />
        <Link to="/news" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#FFC400] font-syncopate text-[10px] tracking-widest transition-colors mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO INTEL FEED
        </Link>

        {/* Article Metadata Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[10px] font-black tracking-widest uppercase mb-6 inline-block skew-x-[-15deg]">
            <span className="block skew-x-[15deg]">{article.category}</span>
          </span>
          
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase leading-tight tracking-tight mb-8">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 md:gap-8 text-slate-500 font-syncopate text-[10px] tracking-widest border-y border-slate-800 py-6">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#FFC400]" />
              {article.date}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#FFC400]" />
              {article.readTime || '4 MIN READ'}
            </div>

            <div className="flex items-center gap-2">
              <User size={14} className="text-[#FFC400]" />
              BY {article.author || 'GEEKAY HQ'}
            </div>
            
            <div className="flex items-center gap-4 md:ml-auto">
              <span className="text-slate-600">SHARE:</span>
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
          className="relative aspect-video mb-16 overflow-hidden border border-slate-800 bg-slate-950"
        >
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
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
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0A1A31] border border-slate-800 p-8 rounded-sm">
              <h3 className="font-syncopate text-[10px] font-black text-white tracking-[0.2em] uppercase mb-6 pb-4 border-b border-slate-800">
                BRIEF_SPECIFICATIONS
              </h3>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 uppercase tracking-widest font-syncopate text-[8px]">SECURITY_LEVEL</span>
                  <span className="text-emerald-500 font-mono font-bold tracking-widest uppercase">PUBLIC_RELEASE</span>
                </li>
                {article.related_team && (
                  <li className="flex justify-between items-center text-xs border-t border-slate-900 pt-4">
                    <span className="text-slate-500 uppercase tracking-widest font-syncopate text-[8px]">ASSIGNED_TEAM</span>
                    <span className="text-white font-syncopate text-[9px] font-bold tracking-wider">{article.related_team}</span>
                  </li>
                )}
                {article.related_game && (
                  <li className="flex justify-between items-center text-xs border-t border-slate-900 pt-4">
                    <span className="text-slate-500 uppercase tracking-widest font-syncopate text-[8px]">GAME_DIVISION</span>
                    <span className="text-[#FFC400] font-mono font-bold tracking-wider uppercase">{article.related_game}</span>
                  </li>
                )}
                <li className="flex justify-between items-center text-xs border-t border-slate-900 pt-4">
                  <span className="text-slate-500 uppercase tracking-widest font-syncopate text-[8px]">CHANNEL_ORIGIN</span>
                  <span className="text-slate-400 font-mono font-bold tracking-wider">GEEKAY_HQ</span>
                </li>
              </ul>
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
