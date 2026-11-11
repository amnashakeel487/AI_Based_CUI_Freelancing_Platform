import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button, Select, cn } from './ui'
import { getSkillsCatalog } from '../services/skillsService'

export const levels = ['Beginner', 'Intermediate', 'Advanced']

/**
 * Searchable skill selector with duplicate prevention.
 *
 * value: [{ name, level }]  — same shape as the backend FreelancerSkillItem
 * onChange: (skills) => void
 *
 * Catalog suggestions come from the backend /freelancer/skills/catalog endpoint.
 * Falls back gracefully if the request fails (suggestions simply stay empty).
 */
export default function SkillPicker({ value, onChange, withLevel = true }) {
  const [q, setQ]         = useState('')
  const [level, setLevel] = useState('Intermediate')
  const [msg, setMsg]     = useState('')
  const [catalog, setCatalog] = useState([])   // suggestions from API

  // Fetch suggestions whenever the search term changes (debounced 250 ms)
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getSkillsCatalog(q)
        .then((items) => { if (active) setCatalog(items || []) })
        .catch(() => { /* silent — suggestions just stay empty */ })
    }, 250)
    return () => { active = false; clearTimeout(timer) }
  }, [q])

  const has = (n) => value.some((s) => s.name.toLowerCase() === n.toLowerCase())

  // Suggestions: catalog items that are not already selected
  const matches = catalog.filter((s) => !has(s.name)).slice(0, 6)

  const add = (name) => {
    const n = name.trim()
    if (!n) return
    if (has(n)) return setMsg(`"${n}" is already in your list.`)
    onChange([...value, { name: n, level }])
    setQ('')
    setMsg('')
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="skill-search" className="mb-1.5 block text-sm font-semibold">
            Search or add a skill
          </label>
          <input
            id="skill-search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setMsg('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(q) } }}
            placeholder="e.g. React"
            className="h-10 w-full rounded-lg border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        {withLevel && (
          <div className="w-40">
            <Select label="Level" value={level} onChange={(e) => setLevel(e.target.value)} options={levels} />
          </div>
        )}
        <Button type="button" onClick={() => add(q)} disabled={!q.trim()}>
          <Plus className="h-4 w-4" />Add
        </Button>
      </div>

      {msg && <p role="alert" className="text-xs text-bad">{msg}</p>}

      {/* Catalog suggestions */}
      {q && matches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matches.map((m) => (
            <button
              type="button"
              key={m.id}
              onClick={() => add(m.name)}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium hover:bg-brand-pale"
            >
              + {m.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected skills */}
      <ul className="flex flex-wrap gap-2" aria-label="Selected skills">
        {value.map((s) => (
          <li
            key={s.name}
            className="flex items-center gap-1.5 rounded-full bg-brand-pale py-1 pl-3 pr-1.5 text-sm font-medium text-brand"
          >
            {s.name}
            {withLevel && <span className="text-xs text-muted">· {s.level}</span>}
            <button
              type="button"
              aria-label={`Remove ${s.name}`}
              onClick={() => onChange(value.filter((x) => x.name !== s.name))}
              className="rounded-full p-0.5 hover:bg-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
