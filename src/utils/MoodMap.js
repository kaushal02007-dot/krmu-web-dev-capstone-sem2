// ============================================================
//  moodMap — Maps TrangMix moods → TMDB discover filters
// ============================================================

export const MOODS = [
  {
    id: 'laugh',
    label: 'Need a Laugh',
    emoji: '😂',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
    description: 'Lighten up with comedy gold',
    filters: {
      movie: { with_genres: '35', sort_by: 'vote_average.desc', 'vote_count.gte': 500 },
      tv:    { with_genres: '35', sort_by: 'vote_average.desc', 'vote_count.gte': 200 },
    },
  },
  {
    id: 'cry',
    label: 'Ready to Cry',
    emoji: '😭',
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.3)',
    description: 'For when you need a good sob',
    filters: {
      movie: { with_genres: '18,10749', sort_by: 'vote_average.desc', 'vote_count.gte': 300 },
      tv:    { with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': 100 },
    },
  },
  {
    id: 'thrill',
    label: 'Edge of My Seat',
    emoji: '😱',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.3)',
    description: 'Heart-pounding suspense',
    filters: {
      movie: { with_genres: '53,27,80', sort_by: 'popularity.desc', 'vote_count.gte': 400 },
      tv:    { with_genres: '80,9648', sort_by: 'popularity.desc', 'vote_count.gte': 150 },
    },
  },
  {
    id: 'adventure',
    label: 'Take Me Away',
    emoji: '🚀',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.3)',
    description: 'Epic worlds to explore',
    filters: {
      movie: { with_genres: '12,14,878', sort_by: 'popularity.desc', 'vote_count.gte': 500 },
      tv:    { with_genres: '10759,10765', sort_by: 'popularity.desc', 'vote_count.gte': 200 },
    },
  },
  {
    id: 'romance',
    label: 'In My Feels',
    emoji: '💘',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.3)',
    description: 'Love, longing and heartbeats',
    filters: {
      movie: { with_genres: '10749', sort_by: 'vote_average.desc', 'vote_count.gte': 300 },
      tv:    { with_genres: '10749,18', sort_by: 'vote_average.desc', 'vote_count.gte': 100 },
    },
  },
  {
    id: 'chill',
    label: 'Just Chillin\'',
    emoji: '😌',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.3)',
    description: 'Easy watching, no stress',
    filters: {
      movie: { with_genres: '35,16,10751', sort_by: 'popularity.desc', 'vote_count.gte': 300 },
      tv:    { with_genres: '35,16', sort_by: 'popularity.desc', 'vote_count.gte': 100 },
    },
  },
  {
    id: 'mind-blown',
    label: 'Blow My Mind',
    emoji: '🤯',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.3)',
    description: 'Twists, sci-fi and mindbenders',
    filters: {
      movie: { with_genres: '878,9648', sort_by: 'vote_average.desc', 'vote_count.gte': 400 },
      tv:    { with_genres: '10765,9648', sort_by: 'vote_average.desc', 'vote_count.gte': 150 },
    },
  },
  {
    id: 'dark',
    label: 'Dark & Gritty',
    emoji: '🖤',
    color: '#6b7280',
    glow: 'rgba(107, 114, 128, 0.3)',
    description: 'Neo-noir, crime, and shadows',
    filters: {
      movie: { with_genres: '80,53,18', sort_by: 'vote_average.desc', 'vote_count.gte': 500 },
      tv:    { with_genres: '80,18', sort_by: 'vote_average.desc', 'vote_count.gte': 200 },
    },
  },
]

export const getMoodById = (id) => MOODS.find(m => m.id === id) || null

export const getMoodFilters = (id, mediaType = 'movie') => {
  const mood = getMoodById(id)
  return mood?.filters?.[mediaType] || {}
}