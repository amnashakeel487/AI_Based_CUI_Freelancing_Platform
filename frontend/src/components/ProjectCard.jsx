import { Link } from 'react-router-dom'
import { Bookmark, Calendar } from 'lucide-react'
import { Badge, Card, cn } from './ui'
import { formatDate, formatPKR } from '../data/mock'

export default function ProjectCard({ p, showMatch, onSave, saved }) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/freelancer/projects/${p.id}`} className="font-bold leading-snug hover:text-brand">{p.title}</Link>
        {showMatch ? <Badge tone="blue">{p.match}% match</Badge> : onSave && (
          <button onClick={() => onSave(p.id)} aria-label={saved ? 'Remove bookmark' : 'Bookmark project'} aria-pressed={saved}><Bookmark className={cn('h-5 w-5', saved ? 'fill-brand text-brand' : 'text-muted')} /></button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">{p.client} · {p.category}</p>
      <p className="mt-3 line-clamp-2 text-sm text-muted">{p.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s} tone="blue">{s}</Badge>)}</div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
        <span className="font-bold">{formatPKR(p.budget)}{p.type === 'Hourly' && '/hr'}</span>
        <span className="flex items-center gap-1 text-muted"><Calendar className="h-4 w-4" />{formatDate(p.deadline)}</span>
      </div>
    </Card>
  )
}
