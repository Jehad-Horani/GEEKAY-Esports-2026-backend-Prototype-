import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Medal, Crosshair, Layers, Coins, Clock, ExternalLink, Calendar, Users, MapPin, Play
} from 'lucide-react';
import { BRStage, BRRound, BRPlacement } from '../../types';
import { formatMatchDateTimeForVisitor } from '../utils/timezone';

interface BRTournamentViewProps {
  stages: BRStage[];
  event: any;
}

export const BRTournamentView: React.FC<BRTournamentViewProps> = ({ stages, event }) => {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [activeViewMode, setActiveViewMode] = useState<'standings' | 'matches'>('standings');

  if (!stages || stages.length === 0) {
    return (
      <div className="bg-[#081B3A]/90 border border-slate-800 p-8 text-center text-slate-400 font-syncopate text-xs tracking-wider uppercase mb-14">
        Tournament stages and lobbies are being finalized by tournament officials.
      </div>
    );
  }

  const currentStage: BRStage = stages[activeStageIdx] || stages[0];
  const stageStatus = (currentStage.status || 'upcoming').toLowerCase();
  const standings = currentStage.standings || [];
  const rounds = currentStage.rounds || [];

  return (
    <section className="mb-14 sm:mb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFC400] animate-pulse" />
          <h2 className="font-syncopate text-base sm:text-lg md:text-xl font-black text-white tracking-widest uppercase">
            TOURNAMENT STAGES & LEADERBOARDS
          </h2>
        </div>
        <span className="font-syncopate text-[8px] sm:text-[9px] text-[#FFC400] font-black uppercase tracking-widest bg-[#FFC400]/10 px-3 py-1 border border-[#FFC400]/30">
          {stages.length} {stages.length === 1 ? 'STAGE' : 'STAGES'} CONFIGURED
        </span>
      </div>

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {stages.map((stage: BRStage, idx: number) => {
          const isCurrent = idx === activeStageIdx;
          const status = (stage.status || 'upcoming').toLowerCase();
          return (
            <button
              key={stage.id || idx}
              onClick={() => {
                setActiveStageIdx(idx);
                setActiveViewMode('standings');
              }}
              className={`px-4 sm:px-6 py-3.5 font-syncopate text-[9px] sm:text-[10px] uppercase tracking-wider transition-all border shrink-0 flex items-center gap-2.5 ${
                isCurrent 
                  ? 'bg-[#FFC400] text-black border-[#FFC400] font-black shadow-[0_0_20px_rgba(255,196,0,0.3)]' 
                  : 'bg-[#081B3A] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white font-bold'
              }`}
            >
              <Layers size={13} className={isCurrent ? 'text-black' : 'text-[#FFC400]'} />
              <span>{stage.name || `Stage ${idx + 1}`}</span>
              <span className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold ${
                isCurrent 
                  ? 'bg-black text-[#FFC400]' 
                  : status === 'live' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' 
                    : status === 'completed'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-white/10 text-slate-400'
              }`}>
                {status === 'live' ? '● LIVE' : (status === 'completed' ? 'FINISHED' : 'UPCOMING')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage Container */}
      <div className="bg-[#081B3A]/90 border border-slate-800 backdrop-blur-md overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" />
        
        {/* Stage Intelligence Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#040E1E]/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest">
                STAGE {activeStageIdx + 1} OF {stages.length}
              </span>
              <span className={`px-2 py-0.5 font-syncopate text-[7px] font-black uppercase ${
                stageStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
                stageStatus === 'completed' ? 'bg-slate-800 text-slate-300' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {stageStatus === 'live' ? '● LIVE NOW' : (stageStatus === 'completed' ? 'COMPLETED' : 'SCHEDULED')}
              </span>
              {currentStage.date && (
                <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                  <Calendar size={11} className="text-slate-500" />
                  <span>{currentStage.date}</span>
                </span>
              )}
            </div>
            <h3 className="font-syncopate text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              {currentStage.name}
            </h3>
          </div>

          {/* Stage Prize & View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {currentStage.prize_money && (
              <div className="px-3.5 py-1.5 bg-[#FFC400]/10 border border-[#FFC400]/30 text-[#FFC400] font-syncopate text-[9px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <Coins size={12} />
                <span>STAGE PRIZE: {currentStage.prize_money}</span>
              </div>
            )}

            <div className="flex items-center bg-[#040E1E] border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setActiveViewMode('standings')}
                className={`px-3 sm:px-4 py-2 font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'standings' 
                    ? 'bg-[#FFC400] text-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy size={12} />
                <span>LEADERBOARD ({standings.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('matches')}
                className={`px-3 sm:px-4 py-2 font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  activeViewMode === 'matches' 
                    ? 'bg-[#FFC400] text-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crosshair size={12} />
                <span>ROUNDS ({rounds.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: STANDINGS / LEADERBOARD */}
        {activeViewMode === 'standings' && (
          <div className="p-4 sm:p-8">
            {standings.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-slate-800 text-slate-500 font-syncopate text-xs uppercase tracking-wider">
                No official placements or standings recorded for this stage yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-syncopate text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] bg-[#040E1E]/40">
                      <th className="py-3.5 px-4 w-28 sm:w-36">PLACEMENT</th>
                      <th className="py-3.5 px-4">CONTENDER / SQUAD</th>
                      <th className="py-3.5 px-4 text-center w-28 sm:w-36">POINTS</th>
                      <th className="py-3.5 px-4 text-right w-32 sm:w-44">PRIZE EARNED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {standings.map((st: BRPlacement, sIdx: number) => {
                      const rankNum = Number(String(st.placement).replace(/[^\d]/g, '')) || (sIdx + 1);
                      const isFirst = rankNum === 1 || String(st.placement).toLowerCase().includes('1');
                      const isSecond = rankNum === 2 || String(st.placement).toLowerCase().includes('2');
                      const isThird = rankNum === 3 || String(st.placement).toLowerCase().includes('3');
                      const isGeekay = Boolean(st.is_geekay || st.participant?.toLowerCase().includes('geekay'));

                      return (
                        <tr 
                          key={st.id || sIdx}
                          className={`transition-colors ${
                            isGeekay 
                              ? 'bg-[#FFC400]/10 border-l-4 border-l-[#FFC400] shadow-[0_0_20px_rgba(255,196,0,0.1)]' 
                              : isFirst 
                                ? 'bg-[#FFC400]/5 hover:bg-[#FFC400]/10' 
                                : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Placement */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              {isFirst ? (
                                <div className="w-8 h-8 rounded bg-[#FFC400]/20 border border-[#FFC400] flex items-center justify-center text-[#FFC400] font-black text-xs shadow-[0_0_10px_rgba(255,196,0,0.4)]">
                                  <Trophy size={15} />
                                </div>
                              ) : isSecond ? (
                                <div className="w-8 h-8 rounded bg-slate-400/20 border border-slate-300 flex items-center justify-center text-slate-200 font-black text-xs">
                                  <Medal size={15} />
                                </div>
                              ) : isThird ? (
                                <div className="w-8 h-8 rounded bg-amber-600/20 border border-amber-500 flex items-center justify-center text-amber-400 font-black text-xs">
                                  <Medal size={15} />
                                </div>
                              ) : (
                                <span className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 font-bold text-xs">
                                  #{rankNum}
                                </span>
                              )}
                              <span className={`font-black text-xs sm:text-sm tracking-wider ${isFirst ? 'text-[#FFC400]' : 'text-white'}`}>
                                {st.placement || `#${rankNum}`}
                              </span>
                            </div>
                          </td>

                          {/* Participant */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`font-black text-xs sm:text-base tracking-tight ${
                                isGeekay ? 'text-[#FFC400]' : 'text-white'
                              }`}>
                                {st.participant}
                              </span>
                              {isGeekay && (
                                <span className="bg-[#FFC400] text-black font-syncopate text-[7px] font-black px-2 py-0.5 tracking-widest uppercase rounded">
                                  GEEKAY SQUAD
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Points */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-mono text-sm sm:text-lg font-black text-white bg-white/5 px-3.5 py-1.5 rounded border border-white/10 inline-block min-w-[3.5rem]">
                              {st.points !== undefined && st.points !== null ? st.points : '—'}
                            </span>
                          </td>

                          {/* Prize */}
                          <td className="py-4 px-4 text-right">
                            <span className={`font-mono text-xs sm:text-base font-black ${
                              st.prize ? 'text-[#FFC400]' : 'text-slate-600'
                            }`}>
                              {st.prize || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROUNDS & MATCHES */}
        {activeViewMode === 'matches' && (
          <div className="p-4 sm:p-8 space-y-4">
            {rounds.length === 0 ? (
              <div className="py-14 text-center border border-dashed border-slate-800 text-slate-500 font-syncopate text-xs uppercase tracking-wider">
                No match rounds or lobbies scheduled for this stage yet.
              </div>
            ) : (
              <div className="space-y-4">
                {rounds.map((round: BRRound, rIdx: number) => {
                  const sourceTz = round.timezone || event.timezone || 'Asia/Riyadh';
                  const timeInfo = formatMatchDateTimeForVisitor(round.date || event.start_date, round.time || '18:00', sourceTz);
                  const rndStatus = (round.status || 'upcoming').toLowerCase();

                  return (
                    <div 
                      key={round.id || rIdx}
                      className="bg-[#040E1E] border border-slate-800 p-4 sm:p-6 transition-all hover:border-slate-700 space-y-4"
                    >
                      {/* Round Header Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-[#FFC400] text-black font-syncopate text-[8px] font-black px-2 py-0.5 tracking-wider uppercase">
                            {round.round_number ? `ROUND ${round.round_number}` : `MATCH ${rIdx + 1}`}
                          </span>
                          <h4 className="font-syncopate text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                            {round.name || `Round ${rIdx + 1}`}
                          </h4>
                          {round.map && (
                            <span className="text-slate-400 font-syncopate text-[8px] tracking-widest uppercase bg-white/5 px-2 py-0.5 border border-white/10 flex items-center gap-1">
                              <MapPin size={10} className="text-[#FFC400]" />
                              <span>{round.map}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-2.5 py-0.5 font-syncopate text-[7px] font-black uppercase ${
                            rndStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
                            rndStatus === 'completed' ? 'bg-slate-800 text-slate-400' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {rndStatus === 'live' ? '● LIVE NOW' : (rndStatus === 'completed' ? 'COMPLETED' : 'SCHEDULED')}
                          </span>

                          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
                            <Clock size={12} className="text-[#FFC400]" />
                            <span>{timeInfo.formattedDate} at {timeInfo.formattedTime} ({timeInfo.timezoneLabel})</span>
                          </div>

                          {round.stream_link && (
                            <a
                              href={round.stream_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 bg-[#FFC400] hover:bg-yellow-400 text-black font-syncopate text-[8px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,196,0,0.2)]"
                            >
                              <span>WATCH STREAM</span>
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Round Placements */}
                      {round.placements && round.placements.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-syncopate text-[10px]">
                            <thead>
                              <tr className="text-slate-500 font-bold uppercase text-[7px] border-b border-slate-800/60">
                                <th className="py-2 px-3 w-16">PLACE</th>
                                <th className="py-2 px-3">SQUAD / CONTENDER</th>
                                <th className="py-2 px-3 text-center w-24">POINTS</th>
                                {round.placements.some((p: any) => p.kills !== undefined && p.kills !== null) && (
                                  <th className="py-2 px-3 text-center w-24">KILLS</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                              {round.placements.map((pl: BRPlacement, pIdx: number) => {
                                const isGk = Boolean(pl.is_geekay || pl.participant?.toLowerCase().includes('geekay'));
                                return (
                                  <tr 
                                    key={pl.id || pIdx} 
                                    className={isGk ? 'bg-[#FFC400]/10 text-[#FFC400] font-black' : 'text-slate-300'}
                                  >
                                    <td className="py-2 px-3 font-black text-xs">{pl.placement}</td>
                                    <td className="py-2 px-3 flex items-center gap-2">
                                      <span>{pl.participant}</span>
                                      {isGk && (
                                        <span className="bg-[#FFC400] text-black text-[6px] px-1.5 py-0.2 rounded font-black">
                                          GEEKAY
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-center font-mono font-bold text-xs">{pl.points || 0}</td>
                                    {round.placements?.some((p: any) => p.kills !== undefined && p.kills !== null) && (
                                      <td className="py-2 px-3 text-center font-mono text-slate-400 text-xs">{pl.kills || 0}</td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};

export default BRTournamentView;
