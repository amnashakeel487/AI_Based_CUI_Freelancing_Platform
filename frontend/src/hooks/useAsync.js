/**
 * useAsync — shared hook for data-fetching.
 *
 * Usage:
 *   const { data, loading, error, reload } = useAsync(fetchFn, [dep1, dep2])
 *
 * - Runs fetchFn on mount and whenever deps change.
 * - `reload()` re-runs fetchFn manually (e.g. after a mutation).
 * - `loading` is true on the initial fetch and on any reload.
 * - `error` holds the thrown Error (or null).
 * - Ignores stale responses if the component unmounts or deps change before
 *   the fetch resolves (via AbortController / cancelled flag).
 */
import { useCallback, useEffect, useReducer, useRef } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return { loading: false, error: null, data: action.data }
    case 'ERROR':
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}

/**
 * @param {() => Promise<any>} fetchFn  async function that returns data
 * @param {any[]} deps  dependency array (like useEffect)
 */
export function useAsync(fetchFn, deps = []) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: true,
    error: null,
  })

  // Keep a stable ref to fetchFn so we don't re-subscribe on every render
  const fnRef = useRef(fetchFn)
  useEffect(() => { fnRef.current = fetchFn })

  // Bump this counter to trigger a reload without changing deps
  const [reloadKey, setReloadKey] = useReducer((n) => n + 1, 0)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'FETCH' })

    fnRef.current()
      .then((data) => {
        if (!cancelled) dispatch({ type: 'SUCCESS', data })
      })
      .catch((err) => {
        if (!cancelled) dispatch({ type: 'ERROR', error: err })
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  const reload = useCallback(() => setReloadKey(), [])

  return { ...state, reload }
}
