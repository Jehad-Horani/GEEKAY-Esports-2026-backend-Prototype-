import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Clock, Globe, Trophy, Plus, Trash2, ArrowUp, ArrowDown, 
  ExternalLink, Layers, Crosshair, Users, Coins, MapPin, Eye, Play, Sparkles, CheckCircle2
} from 'lucide-react';
import ArenaButton from '../../../components/ui/ArenaButton';
import ImageUploader from '../../components/ImageUploader';
import FormSection from './FormSection';
import FormRepeater from './FormRepeater';
import { TIMEZONE_OPTIONS, getDetectedBrowserTimezone, formatMatchDateTimeForVisitor } from '../../utils/timezone';
import { BRStage, BRRound, BRPlacement } from '../../../types';

interface BREventEditorProps {
  initialData: any;
  onSave: (eventData: any) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

const BR_DEFAULT_GAMES = [
  'FORTNITE',
  'PUBG',
  'PUBG MOBILE',
  'APEX LEGENDS',
  'WARZONE',
  'FREE FIRE'
];

export const BREventEditor: React.FC<BREventEditorProps> = ({
  initialData,
  onSave,
  onCancel,
  saving
}) => {
  const detectedTz = getDetectedBrowserTimezone();
  
  // Event Details State
  const [formData, setFormData] = useState<any>({
    title: initialData?.title || '',
    game: initialData?.game || 'FORTNITE',
    banner: initialData?.banner || '',
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData?.end_date || '',
    time: initialData?.time || '18:00',
    timezone: initialData?.timezone || detectedTz,
    region: initialData?.region || 'GLOBAL',
    organizer: initialData?.organizer || '',
    status: initialData?.status || 'upcoming',
    prize_pool: initialData?.prize_pool || '$500,000',
    description: initialData?.description || '',
    published: initialData?.published !== undefined ? Number(initialData.published) : 1,
    featured: Number(initialData?.featured) === 1 ? 1 : 0,
    event_type: 'battle_royale'
  });

  // Stages State
  const [stages, setStages] = useState<BRStage[]>(() => {
    if (initialData?.stages) {
      if (typeof initialData.stages === 'string') {
        try {
          const parsed = JSON.parse(initialData.stages);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      } else if (Array.isArray(initialData.stages) && initialData.stages.length > 0) {
        return initialData.stages;
      }
    }
    // Default Battle Royale Stages setup
    return [
      {
        id: 'stage-1',
        name: 'Group Stage – Day 1',
        status: 'upcoming',
        order: 1,
        prize_money: '',
        date: initialData?.start_date || new Date().toISOString().split('T')[0],
        standings: [
          { id: 'st-1', placement: 1, participant: 'Geekay Esports', points: 64, prize: '$10,000', is_geekay: true },
          { id: 'st-2', placement: 2, participant: 'Falcons Esports', points: 52, prize: '$5,000', is_geekay: false },
          { id: 'st-3', placement: 3, participant: 'Natus Vincere', points: 45, prize: '$2,500', is_geekay: false }
        ],
        rounds: [
          {
            id: 'rnd-1',
            round_number: 1,
            name: 'Match 1 - Erangel',
            date: initialData?.start_date || new Date().toISOString().split('T')[0],
            time: '18:00',
            timezone: initialData?.timezone || detectedTz,
            map: 'Erangel',
            status: 'upcoming',
            stream_link: 'https://twitch.tv/geekayesports',
            placements: [
              { id: 'p-1', placement: 1, participant: 'Geekay Esports', points: 20, kills: 10, is_geekay: true },
              { id: 'p-2', placement: 2, participant: 'Falcons Esports', points: 14, kills: 6, is_geekay: false }
            ]
          }
        ]
      },
      {
        id: 'stage-2',
        name: 'Grand Finals',
        status: 'upcoming',
        order: 2,
        prize_money: '$250,000',
        date: initialData?.end_date || initialData?.start_date || '',
        standings: [],
        rounds: []
      }
    ];
  });

  const [activeStageId, setActiveStageId] = useState<string>(stages[0]?.id || 'stage-1');

  // Media & Socials (Optional)
  const [mediaList, setMediaList] = useState<any[]>(() => {
    try {
      const parsed = typeof initialData?.media === 'string' ? JSON.parse(initialData.media) : initialData?.media;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [socialList, setSocialList] = useState<any[]>(() => {
    try {
      const parsed = typeof initialData?.social === 'string' ? JSON.parse(initialData.social) : initialData?.social;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Stage Helpers
  const addStage = () => {
    const newOrder = stages.length + 1;
    const newStage: BRStage = {
      id: `stage-${Date.now()}`,
      name: `Stage ${newOrder}`,
      status: 'upcoming',
      order: newOrder,
      prize_money: '',
      date: formData.start_date || '',
      standings: [],
      rounds: []
    };
    setStages(prev => [...prev, newStage]);
    setActiveStageId(newStage.id);
  };

  const removeStage = (stageId: string) => {
    if (stages.length <= 1) {
      alert('A Battle Royale tournament requires at least one stage.');
      return;
    }
    setStages(prev => prev.filter(s => s.id !== stageId));
    if (activeStageId === stageId) {
      const remaining = stages.filter(s => s.id !== stageId);
      setActiveStageId(remaining[0]?.id || '');
    }
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const reordered = [...stages];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    // update orders
    reordered.forEach((s, idx) => {
      s.order = idx + 1;
    });
    setStages(reordered);
  };

  const updateStage = (stageId: string, patch: Partial<BRStage>) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, ...patch } : s));
  };

  const activeStage = stages.find(s => s.id === activeStageId) || stages[0];

  // Standings Helpers
  const addStandingRow = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    const nextPlacement = (stage.standings?.length || 0) + 1;
    const newPlacement: BRPlacement = {
      id: `pl-${Date.now()}-${Math.random()}`,
      placement: nextPlacement,
      participant: nextPlacement === 1 ? 'Geekay Esports' : `Squad #${nextPlacement}`,
      points: 0,
      kills: 0,
      prize: '',
      is_geekay: nextPlacement === 1
    };
    updateStage(stageId, {
      standings: [...(stage.standings || []), newPlacement]
    });
  };

  const updateStandingRow = (stageId: string, index: number, patch: Partial<BRPlacement>) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.standings) return;
    const updated = [...stage.standings];
    updated[index] = { ...updated[index], ...patch };
    updateStage(stageId, { standings: updated });
  };

  const removeStandingRow = (stageId: string, index: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.standings) return;
    const updated = stage.standings.filter((_, i) => i !== index);
    updateStage(stageId, { standings: updated });
  };

  // Rounds Helpers
  const addRound = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    const nextRoundNumber = (stage.rounds?.length || 0) + 1;
    const newRound: BRRound = {
      id: `rnd-${Date.now()}`,
      round_number: nextRoundNumber,
      name: `Match ${nextRoundNumber}`,
      date: stage.date || formData.start_date || '',
      time: '18:00',
      timezone: formData.timezone || detectedTz,
      map: formData.game === 'PUBG' || formData.game === 'PUBG MOBILE' ? 'Erangel' : (formData.game === 'APEX LEGENDS' ? 'Storm Point' : 'Battle Royale Island'),
      status: 'upcoming',
      stream_link: '',
      placements: [
        { id: `p-1`, placement: 1, participant: 'Geekay Esports', points: 20, kills: 8, is_geekay: true },
        { id: `p-2`, placement: 2, participant: 'Contender 2', points: 14, kills: 4, is_geekay: false }
      ]
    };
    updateStage(stageId, {
      rounds: [...(stage.rounds || []), newRound]
    });
  };

  const updateRound = (stageId: string, roundIndex: number, patch: Partial<BRRound>) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.rounds) return;
    const updated = [...stage.rounds];
    updated[roundIndex] = { ...updated[roundIndex], ...patch };
    updateStage(stageId, { rounds: updated });
  };

  const removeRound = (stageId: string, roundIndex: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.rounds) return;
    const updated = stage.rounds.filter((_, i) => i !== roundIndex);
    updateStage(stageId, { rounds: updated });
  };

  // Round Placements Helpers
  const addRoundPlacement = (stageId: string, roundIndex: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.rounds || !stage.rounds[roundIndex]) return;
    const rnd = stage.rounds[roundIndex];
    const nextPlacement = (rnd.placements?.length || 0) + 1;
    const newPl: BRPlacement = {
      id: `rp-${Date.now()}-${Math.random()}`,
      placement: nextPlacement,
      participant: `Team #${nextPlacement}`,
      points: 0,
      kills: 0,
      prize: '',
      is_geekay: false
    };
    const updatedRounds = [...stage.rounds];
    updatedRounds[roundIndex] = {
      ...rnd,
      placements: [...(rnd.placements || []), newPl]
    };
    updateStage(stageId, { rounds: updatedRounds });
  };

  const updateRoundPlacement = (stageId: string, roundIndex: number, plIndex: number, patch: Partial<BRPlacement>) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.rounds || !stage.rounds[roundIndex]) return;
    const rnd = stage.rounds[roundIndex];
    const pls = [...(rnd.placements || [])];
    pls[plIndex] = { ...pls[plIndex], ...patch };
    const updatedRounds = [...stage.rounds];
    updatedRounds[roundIndex] = { ...rnd, placements: pls };
    updateStage(stageId, { rounds: updatedRounds });
  };

  const removeRoundPlacement = (stageId: string, roundIndex: number, plIndex: number) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.rounds || !stage.rounds[roundIndex]) return;
    const rnd = stage.rounds[roundIndex];
    const pls = (rnd.placements || []).filter((_, i) => i !== plIndex);
    const updatedRounds = [...stage.rounds];
    updatedRounds[roundIndex] = { ...rnd, placements: pls };
    updateStage(stageId, { rounds: updatedRounds });
  };

  // Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter tournament title.');
      return;
    }

    const payload = {
      ...initialData,
      ...formData,
      event_type: 'battle_royale',
      stages: JSON.stringify(stages),
      media: JSON.stringify(mediaList),
      social: JSON.stringify(socialList)
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl bg-[#081B3A] border border-[#FFC400]/40 p-4 sm:p-8 relative my-auto shadow-[0_0_50px_rgba(255,196,0,0.15)] max-h-[92vh] flex flex-col"
      >
        {/* Top Cyber Accent Lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC400] via-yellow-300 to-[#FFC400]" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#FFC400]/10 border border-[#FFC400]/40 flex items-center justify-center text-[#FFC400]">
              <Crosshair size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#FFC400] text-black font-syncopate text-[7px] sm:text-[8px] font-black px-2 py-0.5 tracking-wider uppercase">
                  BATTLE ROYALE SYSTEM
                </span>
                <span className="text-slate-400 font-syncopate text-[7px] sm:text-[8px] font-bold tracking-widest uppercase">
                  FORTNITE / PUBG / APEX
                </span>
              </div>
              <h2 className="font-syncopate text-base sm:text-xl font-black text-white uppercase tracking-tight mt-1">
                {formData.title || 'NEW BATTLE ROYALE EVENT'}
              </h2>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-2 hover:bg-white/5 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 sm:pr-2 space-y-6 sm:space-y-8 py-4 flex-grow">
          
          {/* SECTION 1: TOURNAMENT INFORMATION */}
          <FormSection title="1. BR TOURNAMENT INFORMATION" subtitle="Core championship metadata and classification">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              
              {/* Event Name */}
              <div className="space-y-1.5 lg:col-span-8">
                <label className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest">
                  Event Name *
                </label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. PUBG MOBILE GLOBAL CHAMPIONSHIP 2026" 
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  required
                />
              </div>

              {/* Game Selector */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                  Game Title *
                </label>
                <select 
                  value={formData.game} 
                  onChange={e => setFormData({ ...formData, game: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                >
                  {BR_DEFAULT_GAMES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="CUSTOM">OTHER / CUSTOM</option>
                </select>
              </div>

              {/* Dates */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#FFC400]" />
                  <span>Start Date</span>
                </label>
                <input 
                  type="date" 
                  value={formData.start_date || ''} 
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={11} className="text-[#FFC400]" />
                  <span>End Date</span>
                </label>
                <input 
                  type="date" 
                  value={formData.end_date || ''} 
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                  Status
                </label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                >
                  <option value="upcoming">UPCOMING</option>
                  <option value="live">LIVE</option>
                  <option value="completed">COMPLETED</option>
                </select>
              </div>

              {/* Region */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={11} className="text-[#FFC400]" />
                  <span>Region</span>
                </label>
                <input 
                  type="text" 
                  value={formData.region} 
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g. EMEA, MENA, RIYADH, GLOBAL" 
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {/* Organizer */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={11} className="text-[#FFC400]" />
                  <span>Organizer</span>
                </label>
                <input 
                  type="text" 
                  value={formData.organizer} 
                  onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                  placeholder="e.g. KRAFTON / ESL / EPIC GAMES" 
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {/* Total Prize Pool */}
              <div className="space-y-1.5 lg:col-span-4">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Coins size={11} className="text-[#FFC400]" />
                  <span>Total Prize Pool</span>
                </label>
                <input 
                  type="text" 
                  value={formData.prize_pool} 
                  onChange={e => setFormData({ ...formData, prize_pool: e.target.value })}
                  placeholder="e.g. $1,000,000" 
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              {/* Banner / Image */}
              <div className="space-y-1.5 lg:col-span-12">
                <ImageUploader
                  label="Tournament Banner Image"
                  value={formData.banner || ''}
                  onChange={(url: string) => setFormData({ ...formData, banner: url })}
                  aspectRatio="banner"
                />
              </div>

              {/* Event Description */}
              <div className="space-y-1.5 lg:col-span-12">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                  Event Description & Tactical Intel
                </label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official Battle Royale championship featuring top global squads competing across multiple stages and high-stakes lobbies..." 
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

            </div>
          </FormSection>

          {/* SECTION 2: STAGES & ROUNDS MANAGEMENT */}
          <FormSection 
            title="2. TOURNAMENT STAGES & ROUNDS" 
            subtitle="Manage Group Stages, Semifinals, Grand Finals, lobbies, and points leaderboards"
          >
            <div className="space-y-6">
              
              {/* Stages Tab Strip & Add Button */}
              <div className="flex items-center justify-between gap-3 flex-wrap pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                  {stages.map((stage, idx) => {
                    const isActive = stage.id === activeStage.id;
                    return (
                      <div 
                        key={stage.id} 
                        className={`flex items-center border transition-all shrink-0 ${
                          isActive 
                            ? 'bg-[#FFC400] text-black border-[#FFC400] font-black' 
                            : 'bg-[#040E1E] text-slate-300 border-slate-800 hover:border-slate-700 font-bold'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveStageId(stage.id)}
                          className="px-3.5 py-2 font-syncopate text-[9px] uppercase tracking-wider flex items-center gap-2"
                        >
                          <Layers size={11} />
                          <span>{stage.name || `Stage ${idx + 1}`}</span>
                          <span className={`text-[7px] px-1.5 py-0.2 rounded font-mono ${
                            isActive ? 'bg-black text-[#FFC400]' : 'bg-white/10 text-slate-400'
                          }`}>
                            {stage.status?.toUpperCase() || 'UPCOMING'}
                          </span>
                        </button>

                        {/* Reorder Buttons */}
                        <div className="flex items-center border-l border-current/20 pr-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveStage(idx, 'up'); }}
                            disabled={idx === 0}
                            title="Move Stage Earlier"
                            className="p-1 hover:opacity-100 disabled:opacity-20 transition-opacity"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveStage(idx, 'down'); }}
                            disabled={idx === stages.length - 1}
                            title="Move Stage Later"
                            className="p-1 hover:opacity-100 disabled:opacity-20 transition-opacity"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ArenaButton 
                  type="button" 
                  variant="outline" 
                  onClick={addStage}
                  className="h-9 text-[9px] border-[#FFC400]/40 text-[#FFC400] hover:bg-[#FFC400]/10 shrink-0"
                >
                  <Plus size={14} className="mr-1.5" /> ADD STAGE
                </ArenaButton>
              </div>

              {/* Active Stage Config Card */}
              {activeStage && (
                <div className="bg-[#040E1E] border border-slate-800 p-4 sm:p-6 space-y-6">
                  
                  {/* Stage Meta Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
                    <div className="sm:col-span-5 space-y-1.5">
                      <label className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest">
                        Stage Name
                      </label>
                      <input 
                        type="text" 
                        value={activeStage.name} 
                        onChange={e => updateStage(activeStage.id, { name: e.target.value })}
                        placeholder="e.g. Group Stage – Day 1, Grand Finals" 
                        className="w-full bg-[#081B3A] border border-slate-800 p-2.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                        Stage Status
                      </label>
                      <select 
                        value={activeStage.status || 'upcoming'} 
                        onChange={e => updateStage(activeStage.id, { status: e.target.value as any })}
                        className="w-full bg-[#081B3A] border border-slate-800 p-2.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      >
                        <option value="upcoming">UPCOMING</option>
                        <option value="live">LIVE</option>
                        <option value="completed">COMPLETED</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                        Stage Prize Money
                      </label>
                      <input 
                        type="text" 
                        value={activeStage.prize_money || ''} 
                        onChange={e => updateStage(activeStage.id, { prize_money: e.target.value })}
                        placeholder="e.g. $50,000" 
                        className="w-full bg-[#081B3A] border border-slate-800 p-2.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeStage(activeStage.id)}
                        className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete this Stage"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* SUB-SECTION A: OVERALL STAGE STANDINGS / LEADERBOARD */}
                  <div className="p-4 bg-[#081B3A]/60 border border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-[#FFC400]" />
                        <h4 className="font-syncopate text-xs font-black text-white uppercase tracking-wider">
                          STAGE LEADERBOARD & PLACEMENTS (الترتيب العام للمرحلة)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => addStandingRow(activeStage.id)}
                        className="px-3 py-1.5 bg-[#FFC400] text-black font-syncopate text-[8px] font-black tracking-widest uppercase hover:bg-yellow-400 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} /> ADD PLACEMENT ROW
                      </button>
                    </div>

                    {/* Standings Table */}
                    {(!activeStage.standings || activeStage.standings.length === 0) ? (
                      <div className="p-6 text-center border border-dashed border-slate-800 text-slate-500 font-syncopate text-[9px] uppercase tracking-wider">
                        No placements entered for this stage yet. Click "Add Placement Row" to record team rankings and points.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-syncopate text-[9px]">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[8px]">
                              <th className="py-2.5 px-3 w-20">Rank / Place</th>
                              <th className="py-2.5 px-3">Player / Team Name</th>
                              <th className="py-2.5 px-3 w-28">Points</th>
                              <th className="py-2.5 px-3 w-32">Prize Money</th>
                              <th className="py-2.5 px-3 w-24 text-center">Geekay Squad?</th>
                              <th className="py-2.5 px-3 w-12 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {activeStage.standings.map((row, rIdx) => (
                              <tr 
                                key={row.id || rIdx} 
                                className={`${row.is_geekay ? 'bg-[#FFC400]/5 border-l-2 border-l-[#FFC400]' : 'hover:bg-white/[0.02]'}`}
                              >
                                <td className="py-2 px-3">
                                  <input 
                                    type="text" 
                                    value={row.placement} 
                                    onChange={e => updateStandingRow(activeStage.id, rIdx, { placement: e.target.value })}
                                    placeholder="1st"
                                    className="w-16 bg-[#040E1E] border border-slate-800 p-1.5 text-white font-syncopate text-[10px] text-center focus:outline-none focus:border-[#FFC400]"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input 
                                    type="text" 
                                    value={row.participant} 
                                    onChange={e => updateStandingRow(activeStage.id, rIdx, { participant: e.target.value })}
                                    placeholder="Team or Player Name"
                                    className="w-full bg-[#040E1E] border border-slate-800 p-1.5 text-white font-syncopate text-[10px] focus:outline-none focus:border-[#FFC400]"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input 
                                    type="number" 
                                    value={row.points !== undefined ? row.points : ''} 
                                    onChange={e => updateStandingRow(activeStage.id, rIdx, { points: Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-24 bg-[#040E1E] border border-slate-800 p-1.5 text-white font-mono text-xs text-center focus:outline-none focus:border-[#FFC400]"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input 
                                    type="text" 
                                    value={row.prize || ''} 
                                    onChange={e => updateStandingRow(activeStage.id, rIdx, { prize: e.target.value })}
                                    placeholder="e.g. $10,000"
                                    className="w-28 bg-[#040E1E] border border-slate-800 p-1.5 text-[#FFC400] font-syncopate text-[10px] focus:outline-none focus:border-[#FFC400]"
                                  />
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={Boolean(row.is_geekay)} 
                                    onChange={e => updateStandingRow(activeStage.id, rIdx, { is_geekay: e.target.checked })}
                                    className="w-4 h-4 bg-[#040E1E] border-slate-800 checked:bg-[#FFC400] rounded-none cursor-pointer"
                                  />
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => removeStandingRow(activeStage.id, rIdx)}
                                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* SUB-SECTION B: STAGE ROUNDS / MATCHES */}
                  <div className="p-4 bg-[#081B3A]/60 border border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Crosshair size={14} className="text-[#FFC400]" />
                        <h4 className="font-syncopate text-xs font-black text-white uppercase tracking-wider">
                          STAGE ROUNDS & MATCHES (الجولات والمباريات)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => addRound(activeStage.id)}
                        className="px-3 py-1.5 bg-[#FFC400] text-black font-syncopate text-[8px] font-black tracking-widest uppercase hover:bg-yellow-400 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} /> ADD ROUND / MATCH
                      </button>
                    </div>

                    {(!activeStage.rounds || activeStage.rounds.length === 0) ? (
                      <div className="p-6 text-center border border-dashed border-slate-800 text-slate-500 font-syncopate text-[9px] uppercase tracking-wider">
                        No matches/rounds scheduled in this stage. Click "Add Round / Match" to schedule matches, maps, and broadcast links.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeStage.rounds.map((round, rndIdx) => (
                          <div 
                            key={round.id || rndIdx}
                            className="bg-[#040E1E] border border-slate-800 p-4 space-y-4 relative"
                          >
                            {/* Round Header Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              {/* Round Name */}
                              <div className="sm:col-span-3 space-y-1">
                                <label className="font-syncopate text-[7px] text-[#FFC400] font-bold uppercase tracking-wider">
                                  Match / Round Name
                                </label>
                                <input 
                                  type="text" 
                                  value={round.name || `Match ${rndIdx + 1}`} 
                                  onChange={e => updateRound(activeStage.id, rndIdx, { name: e.target.value })}
                                  placeholder="e.g. Match 1 - Erangel" 
                                  className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                                />
                              </div>

                              {/* Date */}
                              <div className="sm:col-span-2 space-y-1">
                                <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                                  Date
                                </label>
                                <input 
                                  type="date" 
                                  value={round.date || ''} 
                                  onChange={e => updateRound(activeStage.id, rndIdx, { date: e.target.value })}
                                  className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-syncopate text-[10px] focus:outline-none focus:border-[#FFC400]"
                                />
                              </div>

                              {/* Time */}
                              <div className="sm:col-span-2 space-y-1">
                                <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                                  Time
                                </label>
                                <input 
                                  type="time" 
                                  value={round.time || '18:00'} 
                                  onChange={e => updateRound(activeStage.id, rndIdx, { time: e.target.value })}
                                  className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                                />
                              </div>

                              {/* Map */}
                              <div className="sm:col-span-2 space-y-1">
                                <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                                  Map / Location
                                </label>
                                <input 
                                  type="text" 
                                  value={round.map || ''} 
                                  onChange={e => updateRound(activeStage.id, rndIdx, { map: e.target.value })}
                                  placeholder="Erangel / Miramar" 
                                  className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-syncopate text-[10px] focus:outline-none focus:border-[#FFC400]"
                                />
                              </div>

                              {/* Status */}
                              <div className="sm:col-span-2 space-y-1">
                                <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                                  Status
                                </label>
                                <select 
                                  value={round.status || 'upcoming'} 
                                  onChange={e => updateRound(activeStage.id, rndIdx, { status: e.target.value as any })}
                                  className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-syncopate text-[10px] focus:outline-none focus:border-[#FFC400]"
                                >
                                  <option value="upcoming">UPCOMING</option>
                                  <option value="live">LIVE</option>
                                  <option value="completed">COMPLETED</option>
                                </select>
                              </div>

                              {/* Delete Round */}
                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeRound(activeStage.id, rndIdx)}
                                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Round"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Stream Link */}
                            <div className="flex items-center gap-2">
                              <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
                                Live Stream URL:
                              </label>
                              <input 
                                type="url" 
                                value={round.stream_link || ''} 
                                onChange={e => updateRound(activeStage.id, rndIdx, { stream_link: e.target.value })}
                                placeholder="https://twitch.tv/... or https://youtube.com/..." 
                                className="w-full bg-[#081B3A] border border-slate-800 p-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#FFC400]"
                              />
                            </div>

                            {/* Round Placements Repeater */}
                            <div className="pt-2 border-t border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                  Round Placements ({round.placements?.length || 0} teams)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addRoundPlacement(activeStage.id, rndIdx)}
                                  className="text-[#FFC400] hover:text-white font-syncopate text-[7px] font-black uppercase tracking-wider flex items-center gap-1"
                                >
                                  <Plus size={10} /> Add Team Result
                                </button>
                              </div>

                              {round.placements && round.placements.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {round.placements.map((pl, pIdx) => (
                                    <div 
                                      key={pl.id || pIdx}
                                      className={`p-2 bg-[#081B3A] border flex items-center gap-2 ${
                                        pl.is_geekay ? 'border-[#FFC400] bg-[#FFC400]/5' : 'border-slate-800'
                                      }`}
                                    >
                                      <input 
                                        type="text" 
                                        value={pl.placement} 
                                        onChange={e => updateRoundPlacement(activeStage.id, rndIdx, pIdx, { placement: e.target.value })}
                                        placeholder="#" 
                                        className="w-10 bg-[#040E1E] border border-slate-800 p-1 text-center font-syncopate text-[9px] text-[#FFC400]"
                                      />
                                      <input 
                                        type="text" 
                                        value={pl.participant} 
                                        onChange={e => updateRoundPlacement(activeStage.id, rndIdx, pIdx, { participant: e.target.value })}
                                        placeholder="Team Name" 
                                        className="w-full bg-[#040E1E] border border-slate-800 p-1 font-syncopate text-[9px] text-white"
                                      />
                                      <input 
                                        type="number" 
                                        value={pl.points !== undefined ? pl.points : ''} 
                                        onChange={e => updateRoundPlacement(activeStage.id, rndIdx, pIdx, { points: Number(e.target.value) })}
                                        placeholder="Pts" 
                                        className="w-14 bg-[#040E1E] border border-slate-800 p-1 text-center font-mono text-[10px] text-white"
                                        title="Points"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeRoundPlacement(activeStage.id, rndIdx, pIdx)}
                                        className="text-slate-500 hover:text-red-400 p-0.5"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          </FormSection>

          {/* SECTION 3: MEDIA FILES (OPTIONAL) */}
          <FormSection title="3. MEDIA & HIGHLIGHTS" subtitle="Official photography and highlight reels">
            <FormRepeater
              title="Media Assets"
              items={mediaList}
              onItemsChange={setMediaList}
              createDefaultItem={() => ({ type: 'photo', url: '' })}
              itemTitle={(item) => item.type?.toUpperCase() || 'MEDIA'}
              renderItemFields={(item, idx, onChange) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Type</label>
                    <select 
                      value={item.type || 'photo'}
                      onChange={e => onChange({ ...item, type: e.target.value })}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    >
                      <option value="photo">PHOTO</option>
                      <option value="video">VIDEO STREAM</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    {item.type === 'video' ? (
                      <input 
                        type="text" 
                        value={item.url || ''} 
                        onChange={e => onChange({ ...item, url: e.target.value })}
                        placeholder="https://..." 
                        className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    ) : (
                      <ImageUploader
                        label="Photo File"
                        value={item.url || ''}
                        onChange={(url: string) => onChange({ ...item, url })}
                        aspectRatio="banner"
                      />
                    )}
                  </div>
                </div>
              )}
            />
          </FormSection>

          {/* PUBLISHED TOGGLE & ACTIONS */}
          <div className="flex items-center gap-8 pt-4 border-t border-white/5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={formData.published === 1}
                onChange={e => setFormData({ ...formData, published: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
              />
              <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">
                Published to Website
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <ArenaButton type="submit" disabled={saving}>
              {saving ? 'SAVING BATTLE ROYALE EVENT...' : 'SAVE_BR_EVENT'}
            </ArenaButton>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default BREventEditor;
