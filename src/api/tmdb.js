// ============================================================
//  TrangMix — TMDB API Layer
// ============================================================

const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const API_KEY  = import.meta.env.VITE_TMDB_API_KEY
const IMG_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p'

// ─── Image Helpers ──────────────────────────────────────────
export const imgUrl = {
  poster:   (path, size = 'w500')  => path ? `${IMG_BASE}/${size}${path}` : null,
  backdrop: (path, size = 'w1280') => path ? `${IMG_BASE}/${size}${path}` : null,
  thumb:    (path)                 => path ? `${IMG_BASE}/w300${path}` : null,
  original: (path)                 => path ? `${IMG_BASE}/original${path}` : null,
}

export function getImageUrl(path, size = 'w500') {
  if (!path) return null
  return `${IMG_BASE}/${size}${path}`
}

// ─── Core Fetcher ───────────────────────────────────────────
async function tmdbFetch(endpoint, params = {}) {
  if (!API_KEY) {
    console.error('[TrangMix] Missing VITE_TMDB_API_KEY in .env')
    throw new Error('API key not configured')
  }
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`)
  return res.json()
}

// ─── fetchDetails ────────────────────────────────────────────
export function fetchDetails(mediaType, id) {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  return tmdbFetch(`/${type}/${id}`, {
    append_to_response: 'credits,videos,similar,recommendations',
  })
}

// ─── getTrailer ──────────────────────────────────────────────
export function getTrailer(videos = []) {
  if (!videos.length) return null
  const yt = videos.filter(v => v.site === 'YouTube')
  return (
    yt.find(v => v.type === 'Trailer' && v.name?.toLowerCase().includes('official')) ||
    yt.find(v => v.type === 'Trailer') ||
    yt.find(v => v.type === 'Teaser') ||
    yt[0] ||
    null
  )
}

// ─── Trending ────────────────────────────────────────────────
export const fetchTrending = (mediaType = 'all', timeWindow = 'week') =>
  tmdbFetch(`/trending/${mediaType}/${timeWindow}`)

// ─── Popular / Top Rated ─────────────────────────────────────
export const fetchPopular    = (type = 'movie', page = 1) =>
  tmdbFetch(`/${type}/popular`, { page })

export const fetchTopRated   = (type = 'movie', page = 1) =>
  tmdbFetch(`/${type}/top_rated`, { page })

export const fetchNowPlaying = (page = 1) => tmdbFetch('/movie/now_playing', { page })
export const fetchUpcoming   = (page = 1) => tmdbFetch('/movie/upcoming', { page })
export const fetchOnAir      = (page = 1) => tmdbFetch('/tv/on_the_air', { page })

// ─── Search ──────────────────────────────────────────────────
export const fetchSearch = (query, page = 1) =>
  tmdbFetch('/search/multi', { query, page })

export const searchMulti = fetchSearch   // alias for Navbar.jsx

// ─── Genres ──────────────────────────────────────────────────
// Callable as fetchGenres("movie") or fetchGenres("tv")
// Also works as fetchGenres.movies() or fetchGenres.tv()
export function fetchGenres(mediaType = 'movie') {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  return tmdbFetch(`/genre/${type}/list`)
}
fetchGenres.movies = () => tmdbFetch('/genre/movie/list')
fetchGenres.tv     = () => tmdbFetch('/genre/tv/list')

// ─── Discover ────────────────────────────────────────────────
export const fetchDiscover = (mediaType = 'movie', filters = {}) =>
  tmdbFetch(`/discover/${mediaType}`, filters)

// discoverMedia alias — used by Discover.jsx
export const discoverMedia = fetchDiscover

// ─── Person ──────────────────────────────────────────────────
export const fetchPerson = (id) =>
  tmdbFetch(`/person/${id}`, { append_to_response: 'movie_credits,tv_credits' })

// ─── Namespaced objects (legacy) ─────────────────────────────
export const fetchMovies = {
  popular:    (page = 1) => fetchPopular('movie', page),
  topRated:   (page = 1) => fetchTopRated('movie', page),
  nowPlaying: (page = 1) => fetchNowPlaying(page),
  upcoming:   (page = 1) => fetchUpcoming(page),
  detail:     (id)       => fetchDetails('movie', id),
  byGenre:    (genreId, page = 1) => tmdbFetch('/discover/movie', { with_genres: genreId, page }),
  search:     (query, page = 1)   => tmdbFetch('/search/movie', { query, page }),
}

export const fetchTV = {
  popular:  (page = 1) => fetchPopular('tv', page),
  topRated: (page = 1) => fetchTopRated('tv', page),
  onAir:    (page = 1) => fetchOnAir(page),
  detail:   (id)       => fetchDetails('tv', id),
  byGenre:  (genreId, page = 1) => tmdbFetch('/discover/tv', { with_genres: genreId, page }),
  search:   (query, page = 1)   => tmdbFetch('/search/tv', { query, page }),
}