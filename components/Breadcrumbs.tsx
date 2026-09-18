import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { MOCK_NEWS, MOCK_JOBS } from '../constants';
import { generateBreadcrumbSchema } from './SEOMeta';

let globalTeamsCache: any[] | null = null;
let globalPlayersCache: any[] | null = null;

interface BreadcrumbsProps {
  currentLabel?: string;
}

export default function Breadcrumbs({ currentLabel }: BreadcrumbsProps = {}) {
  const location = useLocation();
  const [dbTeams, setDbTeams] = useState<any[]>(globalTeamsCache || []);
  const [dbPlayers, setDbPlayers] = useState<any[]>(globalPlayersCache || []);

  useEffect(() => {
    if (!globalTeamsCache || !globalPlayersCache) {
      Promise.all([
        fetch('/api/teams').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/players').then(r => r.ok ? r.json() : []).catch(() => [])
      ]).then(([teamsData, playersData]) => {
        if (Array.isArray(teamsData)) {
          globalTeamsCache = teamsData;
          setDbTeams(teamsData);
        }
        if (Array.isArray(playersData)) {
          globalPlayersCache = playersData;
          setDbPlayers(playersData);
        }
      });
    }
  }, []);

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0 || pathnames[0] === 'admin') {
      return [];
    }

    const allTeams = dbTeams || [];

    // Special Case: Player Profiles mapped to Home / Teams / [Team Name] / [Player Name]
    if (pathnames[0] === 'players' && pathnames[1]) {
      const value = pathnames[1];
      const cleanName = value.toLowerCase().replace(/[-_]/g, '');
      
      let foundTeam: any = null;
      let foundPlayer: any = null;
      
      // Check database players first
      for (const p of dbPlayers) {
        const pClean = (p.ign || p.nickname || '').toLowerCase().replace(/[-_]/g, '');
        if (pClean === cleanName || String(p.id).toLowerCase() === value.toLowerCase()) {
          foundPlayer = { nickname: p.ign || p.nickname || value, team_id: p.team_id };
          break;
        }
      }

      // If found in dbPlayers, find associated team
      if (foundPlayer && foundPlayer.team_id) {
        foundTeam = allTeams.find(t => String(t.id) === String(foundPlayer.team_id));
      }
      
      const list = [
        { label: 'HOME', to: '/', isLast: false },
        { label: 'TEAMS', to: '/teams', isLast: false }
      ];
      
      if (foundTeam) {
        const teamSlug = (foundTeam.name || foundTeam.game || String(foundTeam.id)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        list.push({
          label: (foundTeam.name || foundTeam.game || 'TEAM').toUpperCase(),
          to: `/teams/${teamSlug}`,
          isLast: false
        });
      }
      
      const playerLabel = currentLabel 
        ? currentLabel.toUpperCase()
        : (foundPlayer ? (foundPlayer.nickname || foundPlayer.name).toUpperCase() : value.toUpperCase().replace(/[-_]/g, ' '));

      list.push({
        label: playerLabel,
        to: `/players/${value}`,
        isLast: true
      });
      
      return list;
    }

    const items = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      let label = value.toUpperCase().replace(/[-_]/g, ' ');

      if (isLast && currentLabel) {
        label = currentLabel.toUpperCase();
      } else if (index === 0 && value === 'teams') {
        label = 'TEAMS';
      } else if (index === 0 && value === 'players') {
        label = 'PLAYERS';
      } else if (index === 1 && pathnames[0] === 'teams') {
        // Teams subcategory or teamId lookup from both DB and Mock
        const cleanVal = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchedTeam = allTeams.find(t => 
          String(t.id).toLowerCase() === value.toLowerCase() ||
          (t.name && t.name.toLowerCase() === value.toLowerCase()) ||
          (t.game && t.game.toLowerCase() === value.toLowerCase()) ||
          (t.name && t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanVal) ||
          (t.game && t.game.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanVal)
        );
        if (matchedTeam) {
          label = (matchedTeam.name || matchedTeam.game || 'TEAM').toUpperCase();
        } else if (/^\d+$/.test(value)) {
          const byId = allTeams.find(t => String(t.id) === value);
          label = byId ? (byId.name || byId.game || 'TEAM').toUpperCase() : 'TEAM';
        }
      } else if (index === 1 && pathnames[0] === 'players') {
        // Player Name
        const cleanName = value.toLowerCase().replace(/[-_]/g, '');
        let foundPlayer = '';
        for (const p of dbPlayers) {
          const pClean = (p.ign || p.nickname || '').toLowerCase().replace(/[-_]/g, '');
          if (pClean === cleanName || String(p.id).toLowerCase() === value.toLowerCase()) {
            foundPlayer = p.ign || p.nickname;
            break;
          }
        }
        if (foundPlayer) {
          label = foundPlayer.toUpperCase();
        }
      } else if (index === 1 && pathnames[0] === 'news') {
        // News detail slug
        const matchedNews = MOCK_NEWS.find(n => n.slug === value);
        if (matchedNews) {
          label = matchedNews.title.length > 25 ? `${matchedNews.title.slice(0, 25).toUpperCase()}...` : matchedNews.title.toUpperCase();
        }
      } else if (index === 1 && pathnames[0] === 'careers') {
        // Job detail slug
        const matchedJob = MOCK_JOBS.find(j => j.slug === value);
        if (matchedJob) {
          label = matchedJob.title.toUpperCase();
        }
      } else if (index === 1 && pathnames[0] === 'events') {
        // Event detail
        label = 'EVENT DETAILS';
      }

      return {
        label,
        to,
        isLast,
      };
    });

    return [
      { label: 'HOME', to: '/', isLast: false },
      ...items
    ];
  }, [location.pathname, dbTeams, dbPlayers, currentLabel]);

  if (breadcrumbs.length === 0) return null;

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav 
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-[10px] font-syncopate tracking-[0.2em] font-black uppercase text-slate-500 mb-8 border-b border-white/5 relative z-30"
      >
        {breadcrumbs.map((crumb, idx) => {
          const isLast = crumb.isLast;
          return (
            <React.Fragment key={crumb.to}>
              {idx > 0 && <ChevronRight size={10} className="text-slate-700" />}
              {isLast ? (
                <span className="text-[#FFC400] drop-shadow-[0_0_10px_rgba(255,196,0,0.3)] font-black">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
                >
                  {idx === 0 && <Home size={10} className="text-slate-500" />}
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
