// ============================================================
//  useFetch — Generic data fetching hook
//  Usage: const { data, loading, error } = useFetch(fetchFn, [deps])
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * @param {Function} fetchFn   — async function that returns data
 * @param {Array}    deps      — dependency array (like useEffect)
 * @param {Object}   options
 *   @param {boolean} options.immediate — run on mount (default: true)
 *   @param {*}       options.fallback  — initial data value (default: null)
 */
export function useFetch(fetchFn, deps = [], { immediate = true, fallback = null } = {}) {
  const [data, setData]       = useState(fallback)
  const [loading, setLoading] = useState(immediate)
  const [error, setError]     = useState(null)
  const abortRef              = useRef(null)
  const mountedRef            = useRef(true)

  const execute = useCallback(async () => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current && err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    if (immediate) execute()
    return () => {
      mountedRef.current = false
      if (abortRef.current) abortRef.current.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  // Expose refetch for manual trigger
  return { data, loading, error, refetch: execute }
}

export default useFetch