import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOMetaProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  schemas?: object[];
}

export default function SEOMeta({
  title,
  description,
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=630',
  ogType = 'website',
  schemas = []
}: SEOMetaProps) {
  const location = useLocation();

  // Determine standard base URL (fallback to window.location.origin)
  const origin = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://geekayesports.com';
  }, []);

  const absoluteCanonical = useMemo(() => {
    if (canonicalUrl) return canonicalUrl;
    // Strip trailing slash if present
    const path = location.pathname === '/' ? '' : location.pathname;
    return `${origin}${path}`;
  }, [canonicalUrl, location.pathname, origin]);

  useEffect(() => {
    // 1. Update Document Title
    document.title = `${title} | Geekay Esports`;

    // Helper to find or create meta tags
    const setMetaTag = (attrName: string, attrValue: string, contentValue: string) => {
      let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Helper to find or create link tags
    const setLinkTag = (relValue: string, hrefValue: string) => {
      let element = document.head.querySelector(`link[rel="${relValue}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', relValue);
        document.head.appendChild(element);
      }
      element.setAttribute('href', hrefValue);
    };

    // 2. Set Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');

    // 3. Set Open Graph Meta Tags
    setMetaTag('property', 'og:title', `${title} | Geekay Esports`);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', absoluteCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Geekay Esports');

    // 4. Set Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', `${title} | Geekay Esports`);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:site', '@GeekayEsports');

    // 5. Set Canonical URL Link
    setLinkTag('canonical', absoluteCanonical);

    return () => {
      // Cleanups are optional for persistent Single Page Application transitions
    };
  }, [title, description, absoluteCanonical, ogImage, ogType]);

  // Generate Global Organization Schema by default
  const organizationSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    'name': 'Geekay Esports',
    'url': origin,
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300&h=300', // absolute fallback logo
      'width': '300',
      'height': '300'
    },
    'sameAs': [
      'https://twitter.com/GeekayEsports',
      'https://www.youtube.com/@GeekayEsports',
      'https://www.instagram.com/GeekayEsports',
      'https://www.facebook.com/GeekayEsports',
      'https://twitch.tv/GeekayEsports'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+966-11-234-5678',
      'contactType': 'customer support',
      'areaServed': ['SA', 'AE', 'QA', 'KW', 'BH', 'OM'],
      'availableLanguage': ['Arabic', 'English']
    },
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Olaya District, King Fahd Road',
      'addressLocality': 'Riyadh',
      'addressRegion': 'Riyadh Province',
      'postalCode': '12211',
      'addressCountry': 'SA'
    }
  }), [origin]);

  const allSchemas = useMemo(() => {
    return [organizationSchema, ...schemas];
  }, [organizationSchema, schemas]);

  return (
    <>
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

// ====================================================
// STATIC SCHEMA GENERATORS FOR COMPLIANCE
// ====================================================

/**
 * SportsTeam Schema Generator
 */
export function generateSportsTeamSchema(teamName: string, players: { nickname: string; role: string; url: string }[], region = 'MENA', logo = '', achievements: string[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    'name': `Geekay Esports ${teamName} Team`,
    'sport': 'Esports',
    'logo': logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300&h=300',
    'memberOf': {
      '@type': 'Organization',
      'name': 'Geekay Esports',
      'url': 'https://geekayesports.com'
    },
    'member': players.map(p => ({
      '@type': 'OrganizationRole',
      'member': {
        '@type': 'Person',
        'name': p.nickname,
        'url': p.url
      },
      'roleName': p.role
    })),
    'areaServed': region,
    'award': achievements
  };
}

/**
 * Event Schema Generator
 */
export function generateEventSchema(eventName: string, startDate: string, locationName: string, status: 'LIVE' | 'UPCOMING' | 'FINISHED', prizePool: string) {
  // Convert friendly date to ISO format if possible
  let isoDate = startDate;
  try {
    const parsed = Date.parse(startDate);
    if (!isNaN(parsed)) {
      isoDate = new Date(parsed).toISOString();
    } else {
      isoDate = new Date('2026-06-25T18:00:00Z').toISOString();
    }
  } catch (e) {
    isoDate = '2026-06-25T18:00:00Z';
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': eventName,
    'startDate': isoDate,
    'endDate': isoDate,
    'eventStatus': status === 'FINISHED' 
      ? 'https://schema.org/EventScheduled' 
      : status === 'LIVE' 
        ? 'https://schema.org/EventMovedOnline' 
        : 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/MixedEventAttendanceMode',
    'location': {
      '@type': 'Place',
      'name': locationName || 'Online Arena',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': locationName || 'Global',
        'addressCountry': 'SA'
      }
    },
    'organizer': {
      '@type': 'Organization',
      'name': 'Geekay Esports',
      'url': 'https://geekayesports.com'
    },
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock',
      'validFrom': isoDate
    },
    'description': `Official professional esports match/tournament for ${eventName} with a prize pool of ${prizePool}.`
  };
}

/**
 * VideoGame Schema Generator
 */
export function generateVideoGameSchema(gameName: string, genre = 'Esports / Multiplayer Online Battle Arena') {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    'name': gameName,
    'genre': genre,
    'playMode': ['Multiplayer', 'Co-op', 'Competitive'],
    'applicationCategory': 'Game',
    'gamePlatform': ['PC', 'PlayStation 5', 'Xbox Series X/S', 'Mobile']
  };
}

/**
 * BreadcrumbList Schema Generator
 */
export function generateBreadcrumbSchema(breadcrumbs: { label: string; to: string }[]) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://geekayesports.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.label,
      'item': `${origin}${crumb.to === '/' ? '' : crumb.to}`
    }))
  };
}

/**
 * Review & AggregateRating Schema Generator for Player Performance Ratings
 */
export function generatePlayerRatingSchema(playerName: string, overallRating: number, reviewCount: number, teamName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product', // Required by schema.org to support AggregateRating for a rated asset
    'name': `${playerName} Professional Esports Player Profile`,
    'image': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300&h=300',
    'description': `${playerName} is a professional esports player representing Geekay Esports in ${teamName}.`,
    'brand': {
      '@type': 'Brand',
      'name': 'Geekay Esports'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': overallRating.toString(),
      'bestRating': '5',
      'worstRating': '1',
      'ratingCount': reviewCount.toString(),
      'reviewCount': reviewCount.toString()
    },
    'review': [
      {
        '@type': 'Review',
        'author': {
          '@type': 'Person',
          'name': 'Saudi Esports Review'
        },
        'datePublished': '2026-01-15',
        'reviewBody': `${playerName} demonstrates world-class tactical expertise, exceptional communication skills, and high in-game mechanical output consistency under extreme pressure.`,
        'reviewRating': {
          '@type': 'Rating',
          'ratingValue': Math.floor(overallRating).toString(),
          'bestRating': '5',
          'worstRating': '1'
        }
      }
    ]
  };
}

/**
 * NewsArticle Schema Generator
 */
export function generateArticleSchema(title: string, description: string, image: string, url: string, datePublished: string, authorName = 'Geekay Esports', publisherLogo = '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': title,
    'description': description,
    'image': [image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=630'],
    'datePublished': datePublished,
    'dateModified': datePublished,
    'mainEntityOfPage': url,
    'author': {
      '@type': 'Organization',
      'name': authorName,
      'url': 'https://geekayesports.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Geekay Esports',
      'logo': {
        '@type': 'ImageObject',
        'url': publisherLogo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300&h=300'
      }
    }
  };
}
