import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { MOCK_TEAMS, MOCK_NEWS, MOCK_JOBS } from '../constants';
import { generateBreadcrumbSchema } from './SEOMeta';

export default function Breadcrumbs() {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    if (pathnames.length === 0 || pathnames[0] === 'admin') {
      return [];
    }

    // Special Case: Player Profiles mapped to Home / Teams / [Team Game] / [Player Name]
    if (pathnames[0] === 'players' && pathnames[1]) {
      const value = pathnames[1];
      const cleanName = value.toLowerCase().replace(/[-_]/g, '');
      
      let foundTeam: any = null;
      let foundPlayer: any = null;
      
      for (const team of MOCK_TEAMS) {
        const p = team.players.find(pl => 
          pl.nickname.toLowerCase().replace(/[-_]/g, '') === cleanName || 
          pl.id.toLowerCase() === value.toLowerCase()
        );
        if (p) {
          foundTeam = team;
          foundPlayer = p;
          break;
        }
      }
      
      const list = [
        { label: 'HOME', to: '/', isLast: false },
        { label: 'TEAMS', to: '/teams', isLast: false }
      ];
      
      if (foundTeam) {
        list.push({
          label: foundTeam.game.toUpperCase(),
          to: `/teams/${foundTeam.id}`,
          isLast: false
        });
      }
      
      list.push({
        label: foundPlayer ? foundPlayer.nickname.toUpperCase() : value.toUpperCase().replace(/[-_]/g, ' '),
        to: `/players/${value}`,
        isLast: true
      });
      
      return list;
    }

    const items = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      let label = value.toUpperCase().replace(/[-_]/g, ' ');

      // Sub-route lookups for highly descriptive, human-readable breadcrumb labels
      if (index === 0 && value === 'teams') {
        label = 'TEAMS';
      } else if (index === 0 && value === 'players') {
        label = 'PLAYERS';
      } else if (index === 1 && pathnames[0] === 'teams') {
        // Teams subcategory or teamId
        const matchedTeam = MOCK_TEAMS.find(t => t.id === value.toLowerCase());
        if (matchedTeam) {
          label = matchedTeam.game.toUpperCase();
        }
      } else if (index === 1 && pathnames[0] === 'players') {
        // Player Name
        const cleanName = value.toLowerCase().replace(/[-_]/g, '');
        // Search through rosters to find the active player
        let foundPlayer = '';
        for (const team of MOCK_TEAMS) {
          const p = team.players.find(pl => pl.nickname.toLowerCase().replace(/[-_]/g, '') === cleanName || pl.id.toLowerCase() === value.toLowerCase());
          if (p) {
            foundPlayer = p.nickname;
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
        isLast: index === pathnames.length - 1,
      };
    });

    return [
      { label: 'HOME', to: '/', isLast: false },
      ...items
    ];
  }, [location.pathname]);

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
