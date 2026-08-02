import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, User, Newspaper, Calendar, Briefcase, CornerDownLeft } from 'lucide-react';
import { MOCK_TEAMS, MOCK_EVENTS, MOCK_NEWS, MOCK_JOBS } from '../constants';
import { getEventSlug } from '../pages/Schedule';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when search opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Dynamic Multi-category search
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const list: {
      type: 'TEAM' | 'PLAYER' | 'NEWS' | 'EVENT' | 'CAREER';
      title: string;
      subtitle: string;
      link: string;
    }[] = [];

    // 1. Teams search
    MOCK_TEAMS.forEach(t => {
      if (t.name.toLowerCase().includes(q) || t.game.toLowerCase().includes(q)) {
        list.push({
          type: 'TEAM',
          title: `GEEKAY ${t.name.toUpperCase()}`,
          subtitle: `${t.game.toUpperCase()} // ${t.region || 'MENA'}`,
          link: `/teams/${t.id}`
        });
      }
    });

    // 2. Players search
    MOCK_TEAMS.forEach(t => {
      t.players.forEach(p => {
        if (p.nickname.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)) {
          list.push({
            type: 'PLAYER',
            title: p.nickname.toUpperCase(),
            subtitle: `${p.name.toUpperCase()} // ${p.role.toUpperCase()} (${t.game.toUpperCase()})`,
            link: `/players/${p.nickname.toLowerCase()}`
          });
        }
      });
    });

    // 3. News search
    MOCK_NEWS.forEach(n => {
      if (n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q) || n.category.toLowerCase().includes(q)) {
        list.push({
          type: 'NEWS',
          title: n.title,
          subtitle: `${n.category} // ${n.date} // ${n.readTime}`,
          link: `/news/${n.slug}`
        });
      }
    });

    // 4. Events search
    MOCK_EVENTS.forEach(e => {
      if (e.title.toLowerCase().includes(q) || e.game.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)) {
        list.push({
          type: 'EVENT',
          title: e.title,
          subtitle: `${e.game} // ${e.date} // ${e.location} // ${e.status}`,
          link: `/events/${getEventSlug(e.title)}`
        });
      }
    });

    // 5. Careers search
    MOCK_JOBS.forEach(j => {
      if (j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || j.summary.toLowerCase().includes(q)) {
        list.push({
          type: 'CAREER',
          title: j.title,
          subtitle: `${j.department} // ${j.location} // ${j.type}`,
          link: `/careers/${j.slug}`
        });
      }
    });

    return list.slice(0, 8); // Limit to top 8 results for ultra-clean interface
  }, [query]);

  // Handle keyboard navigation inside search overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          navigate(results[selectedIndex].link);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose, navigate]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'TEAM': return <Users size={16} className="text-[#FFC400]" />;
      case 'PLAYER': return <User size={16} className="text-[#FFC400]" />;
      case 'NEWS': return <Newspaper size={16} className="text-blue-400" />;
      case 'EVENT': return <Calendar size={16} className="text-emerald-400" />;
      case 'CAREER': return <Briefcase size={16} className="text-purple-400" />;
      default: return <Search size={16} className="text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#040e1e]/95 backdrop-blur-xl z-[999] flex flex-col items-center justify-start pt-32 px-6"
        >
          {/* Close button top-right */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-slate-400 hover:text-white border border-slate-800 p-3 hover:border-slate-500 transition-colors"
          >
            <X size={24} />
          </button>

          {/* Search container */}
          <div className="w-full max-w-3xl">
            {/* Input wrap */}
            <div className="relative border-b-2 border-[#FFC400] pb-4 mb-8 flex items-center">
              <Search size={28} className="text-[#FFC400] mr-4 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="SEARCH FOR TEAMS, OPERATIVES, NEWS, EVENTS..."
                className="w-full bg-transparent font-syncopate text-xl md:text-3xl font-black text-white border-none outline-none focus:ring-0 placeholder-slate-700 uppercase tracking-tighter"
              />
            </div>

            {/* Quick tips */}
            {!query && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-500 font-syncopate text-[9px] tracking-[0.3em] uppercase space-y-3"
              >
                <p className="text-slate-400">Popular Searches:</p>
                <div className="flex flex-wrap gap-3">
                  {['Rocket League', 'ApparentlyJack', 'Roster', 'Schedule', 'Careers'].map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 border border-slate-800 hover:border-[#FFC400] text-slate-400 hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results output */}
            {query && results.length > 0 && (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                {results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.link + idx}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        navigate(item.link);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-4 cursor-pointer transition-all border ${isSelected ? 'bg-[#FFC400]/10 border-[#FFC400]' : 'bg-[#081B3A]/40 border-slate-900 hover:border-slate-800'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 border ${isSelected ? 'border-[#FFC400] bg-[#FFC400]/10' : 'border-slate-800 bg-slate-950'}`}>
                          {getIcon(item.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-syncopate text-xs md:text-sm font-black transition-colors ${isSelected ? 'text-[#FFC400]' : 'text-white'}`}>
                            {item.title}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500 tracking-wider uppercase mt-1">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-syncopate text-[8px] tracking-[0.25em] text-slate-600 group-hover:text-slate-400 transition-colors uppercase">
                          {item.type}
                        </span>
                        {isSelected && (
                          <CornerDownLeft size={12} className="text-[#FFC400] animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* No results placeholder */}
            {query && results.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 border border-dashed border-slate-800"
              >
                <p className="font-syncopate text-xs text-slate-500 tracking-widest uppercase">
                  NO MATCHING TACTICAL INTEL FOUND
                </p>
                <p className="font-inter text-slate-600 text-xs mt-2">
                  Try checking spelling or using a different search query.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
