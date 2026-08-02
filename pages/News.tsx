import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Calendar, Clock, Filter, ArrowRight, Newspaper } from 'lucide-react';
import { MOCK_NEWS } from '../constants';
import { NewsItem } from '../types';
import ArenaButton from '../components/ui/ArenaButton';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta, { generateArticleSchema } from '../components/SEOMeta';

const News = () => {
  const [dbNews, setDbNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(7); // 1 featured + 6 in grid

  const filterCategories = [
    { label: 'All', value: 'ALL' },
    { label: 'Announcements', value: 'ANNOUNCEMENT' },
    { label: 'Roster Updates', value: 'ROSTER' },
    { label: 'Tournament News', value: 'TOURNAMENT' },
    { label: 'Partnerships', value: 'PARTNERSHIP' },
    { label: 'Community', value: 'COMMUNITY' },
    { label: 'Media', value: 'MEDIA' }
  ];

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
  }, []);

  // Merge & normalize database articles and fallback mock articles
  const allArticles = useMemo(() => {
    const normalized: any[] = (Array.isArray(dbNews) ? dbNews : []).map(item => ({
      ...item,
      id: String(item.id),
      featured: item.featured === 1 || item.featured === true,
      published: item.published === 1 || item.published === true || item.published === undefined,
    }));

    // Append MOCK_NEWS items if they don't already exist by slug
    MOCK_NEWS.forEach(mock => {
      const exists = normalized.some(
        item => (item.slug || '').toLowerCase().trim() === (mock.slug || '').toLowerCase().trim()
      );
      if (!exists) {
        normalized.push({
          ...mock,
          featured: mock.slug === 'international-qualifications-2026', // Keep qualifiers as featured fallback
          published: true
        });
      }
    });

    // Ensure they are sorted: Featured first, then by date descending
    return normalized
      .filter(item => item.published)
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Secondary sort by date (fallback to ID)
        const dateA = new Date(a.date || '').getTime() || 0;
        const dateB = new Date(b.date || '').getTime() || 0;
        return dateB - dateA;
      });
  }, [dbNews]);

  // Apply instant filters and search query
  const filteredArticles = useMemo(() => {
    return allArticles.filter(item => {
      // Normalize category checking
      const itemCat = (item.category || '').toUpperCase().trim();
      const matchesFilter = filter === 'ALL' || itemCat === filter || itemCat.startsWith(filter) || filter.startsWith(itemCat);
      
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [allArticles, filter, searchQuery]);

  // Find the featured article
  const featuredArticle = useMemo(() => {
    // Return first featured article that matches filters (if any), otherwise just the first matching article
    const featured = filteredArticles.find(item => item.featured);
    return featured || filteredArticles[0];
  }, [filteredArticles]);

  // Remaining articles excluding the featured one
  const remainingArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter(item => item.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  // Paginated/Sliced articles to show in the grid
  const visibleArticles = useMemo(() => {
    return remainingArticles.slice(0, visibleCount - 1);
  }, [remainingArticles, visibleCount]);

  const hasMore = remainingArticles.length > visibleArticles.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  const newsSchemas = useMemo(() => {
    return allArticles.map(item => 
      generateArticleSchema(
        item.title,
        item.excerpt || item.content?.slice(0, 150) || '',
        item.image,
        `https://geekayesports.com/news/${item.slug}`,
        item.date,
        'Geekay Command Center',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=200'
      )
    );
  }, [allArticles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081B3A] pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
      {/* Background Grid Pattern & Gradient Overlay */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#FFC400]/5 to-transparent pointer-events-none" />

      <SEOMeta 
        title="Geekay Esports News - Latest Updates & Esports Announcements"
        description="Stay updated with Geekay Esports. Read the latest announcements, team updates, roster shuffles, tournament reports, and regional esports coverage."
        ogType="website"
        schemas={newsSchemas}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <Breadcrumbs />
        {/* News Hero Header */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-[2px] bg-[#FFC400]" />
              <span className="font-syncopate text-[#FFC400] text-xs tracking-[0.5em] font-bold uppercase">COMMAND_FEED // INTEL</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-syncopate text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none"
            >
              GEEKAY ESPORTS <br /> <span className="text-[#FFC400]">NEWS</span>
            </motion.h1>
          </div>

          <div className="flex gap-4">
            <div className="border border-slate-800 p-4 bg-[#0A1A31]/80">
              <h2 className="font-syncopate text-xs font-black text-[#FFC400] tracking-wider uppercase mb-1">2026 NEWS</h2>
              <span className="text-slate-500 font-inter text-[10px] uppercase">Current Hub</span>
            </div>
            <div className="border border-slate-900 p-4 bg-[#0A1A31]/20 opacity-60">
              <h2 className="font-syncopate text-xs font-black text-slate-400 tracking-wider uppercase mb-1">2025 NEWS</h2>
              <span className="text-slate-500 font-inter text-[10px] uppercase">Archives</span>
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-16"
        >
          Official updates, roster moves, tournament news, and organization announcements from the GEEKAY command center.
        </motion.p>

        {/* Filters and Search Input */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 pb-8 border-b border-slate-800">
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setFilter(cat.value);
                  setVisibleCount(7); // Reset page size on filter change
                }}
                className={`px-5 py-2 font-syncopate text-[9px] font-bold tracking-widest transition-all skew-x-[-15deg] border
                  ${filter === cat.value 
                    ? 'bg-[#FFC400] text-black border-[#FFC400]' 
                    : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'}`}
              >
                <span className="block skew-x-[15deg]">{cat.label.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FFC400] transition-colors" size={18} />
            <input
              type="text"
              placeholder="SEARCH NEWS..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(7); // Reset pagination count on search
              }}
              className="w-full bg-slate-900/50 border border-slate-800 py-4 pl-12 pr-6 font-syncopate text-[10px] text-white tracking-widest focus:outline-none focus:border-[#FFC400] transition-all"
            />
          </div>
        </div>

        {/* Dynamic News Grid/Featured Story View */}
        {filteredArticles.length > 0 ? (
          <div className="space-y-16">
            
            {/* A) Large Featured Article Card */}
            {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative grid grid-cols-1 lg:grid-cols-12 bg-[#0A1A31] border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden"
              >
                <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden">
                  <img 
                    src={featuredArticle.image} 
                    alt={featuredArticle.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A31] via-transparent to-transparent hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A31] via-transparent to-transparent lg:hidden" />
                  
                  <div className="absolute top-8 left-8">
                    <span className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[10px] font-black tracking-widest skew-x-[-15deg]">
                      <span className="block skew-x-[15deg]">FEATURED STORY</span>
                    </span>
                  </div>
                </div>
                
                <div className="lg:col-span-5 p-10 md:p-16 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-[#FFC400] font-syncopate text-[10px] font-bold tracking-widest uppercase">
                      {featuredArticle.category}
                    </span>
                    <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                    <span className="text-slate-500 font-syncopate text-[10px] tracking-widest">{featuredArticle.date}</span>
                  </div>
                  
                  <Link to={`/news/${featuredArticle.slug}`}>
                    <h2 className="font-syncopate text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight hover:text-[#FFC400] transition-colors relative pb-2 group">
                      {featuredArticle.title}
                      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FFC400] group-hover:w-full transition-all duration-300" />
                    </h2>
                  </Link>
                  
                  <p className="text-slate-400 text-sm md:text-base mb-10 font-light leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-8">
                    <Link to={`/news/${featuredArticle.slug}`}>
                      <ArenaButton icon={<ArrowRight size={18} />}>
                        Read Article →
                      </ArenaButton>
                    </Link>
                    <div className="flex items-center gap-2 text-slate-500 font-syncopate text-[9px] tracking-widest">
                      <Clock size={12} className="text-[#FFC400]" />
                      {featuredArticle.readTime || '4 MIN READ'}
                    </div>
                  </div>
                </div>

                {/* Cyber/Esports Corner Accents */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-[#FFC400]/10 group-hover:border-[#FFC400]/40 transition-colors pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-[#FFC400]/10 group-hover:border-[#FFC400]/40 transition-colors pointer-events-none" />
              </motion.div>
            )}

            {/* B) News Grid */}
            {visibleArticles.length > 0 && (
              <div className="space-y-6 pt-12">
                <div className="border-l-4 border-[#FFC400] pl-4">
                  <h2 className="font-syncopate text-xl md:text-2xl font-black text-white uppercase tracking-wider">LATEST NEWS</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                <AnimatePresence mode="popLayout">
                  {visibleArticles.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-[#0A1A31]/40 border border-slate-800 hover:border-[#FFC400]/30 transition-all duration-300 flex flex-col hover:-translate-y-2"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-950">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-[#081B3A]/30 group-hover:bg-transparent transition-colors" />
                        <div className="absolute top-4 left-4">
                          <span className="bg-slate-900/90 text-[#FFC400] px-3 py-1 border border-[#FFC400]/20 font-syncopate text-[8px] font-bold tracking-widest uppercase">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex-grow flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-slate-500 font-syncopate text-[8px] tracking-widest">{item.date}</span>
                          <span className="text-slate-600 font-syncopate text-[8px] tracking-widest uppercase">{item.readTime || '4 MIN READ'}</span>
                        </div>
                        
                        <Link to={`/news/${item.slug}`}>
                          <h3 className="font-syncopate text-lg font-bold text-white mb-6 leading-tight hover:text-[#FFC400] transition-colors flex-grow relative pb-2 group/title">
                            {item.title}
                            <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#FFC400] group-hover/title:w-full transition-all duration-300" />
                          </h3>
                        </Link>
                        
                        <p className="text-slate-400 text-xs mb-8 font-light line-clamp-2 leading-relaxed">
                          {item.excerpt}
                        </p>
                        
                        <Link to={`/news/${item.slug}`} className="mt-auto inline-block">
                          <button className="flex items-center gap-3 text-[#FFC400] font-syncopate text-[9px] font-black tracking-[0.3em] uppercase group/btn text-left">
                            Read More →
                            <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform text-[#FFC400]" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

            {/* E) Load More / Pagination */}
            {hasMore && (
              <div className="flex justify-center pt-12">
                <ArenaButton variant="outline" className="min-w-[200px]" onClick={handleLoadMore}>
                  LOAD MORE INTEL
                </ArenaButton>
              </div>
            )}
          </div>
        ) : (
          <div className="py-40 text-center border border-dashed border-slate-800">
            <Newspaper className="mx-auto text-slate-800 mb-8" size={64} />
            <h3 className="font-syncopate text-2xl font-bold text-slate-600 uppercase tracking-widest">NO INTEL TRANSMISSIONS FOUND</h3>
            <p className="text-slate-500 mt-4 uppercase text-[10px] tracking-widest">Adjust filters or search parameters to unlock feed</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
