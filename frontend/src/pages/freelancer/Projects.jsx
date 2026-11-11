import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Bookmark, Search, Star } from 'lucide-react'
import {
  Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState,
  PageHeader, Pagination, Select, StatusBadge, cn,
} from '../../components/ui'
import ProjectCard from '../../components/ProjectCard'
import { useAsync } from '../../hooks/useAsync'
import {
  getCategories, getProject, getProjects,
  getRecommendations, saveProject, unsaveProject,
} from '../../services/projectsService'
import { getMySkills } from '../../services/skillsService'
import { formatDate, formatPKR } from '../../data/mock'

const PROJECT_TYPES = ['Fixed price', 'Hourly']
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'budget',     label: 'Highest budget' },
  { value: 'deadline',   label: 'Soonest deadline' },
]

// ─── BrowseProjects ───────────────────────────────────────────────────────────

export function BrowseProjects() {
  const [searchParams] = useSearchParams()
  const { data: categories = [] } = useAsync(getCategories)

  const [f, setF] = useState({
    q:               searchParams.get('q') || '',
    category:        '',
    min_budget:      '',
    deadline_before: '',
    project_type:    '',
    sort:            'created_at',
  })
  const [page, setPage] = useState(1)
  const [savedOverrides, setSavedOverrides] = useState({})   // id → bool

  const fetchFn = useCallback(
    () => getProjects({ ...f, page, page_size: 9 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(f), page]
  )
  const { data, loading, error, reload } = useAsync(fetchFn, [JSON.stringify(f), page])

  const set = (k) => (e) => { setF((prev) => ({ ...prev, [k]: e.target.value })); setPage(1) }
  const clear = () => {
    setF({ q: '', category: '', min_budget: '', deadline_before: '', project_type: '', sort: 'created_at' })
    setPage(1)
  }

  const toggleSave = async (project) => {
    const nowSaved = savedOverrides[project.id] ?? project.saved
    setSavedOverrides((prev) => ({ ...prev, [project.id]: !nowSaved }))
    try {
      if (nowSaved) await unsaveProject(project.id)
      else          await saveProject(project.id)
    } catch {
      setSavedOverrides((prev) => ({ ...prev, [project.id]: nowSaved }))
    }
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const pages = data?.pages ?? 1

  return (
    <>
      <PageHeader
        title="Browse projects"
        subtitle={data ? `${total} project${total !== 1 ? 's' : ''} found` : 'Loading…'}
      />

      <Card className="mb-6 space-y-3 p-4">
        <Input icon={Search} aria-label="Search projects" placeholder="Search by title or keyword"
          value={f.q} onChange={set('q')} />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Select aria-label="Category" value={f.category} onChange={set('category')} placeholder="Category"
            options={categories.map((c) => ({ value: c.name, label: c.name }))} />
          <Input aria-label="Minimum budget" type="number" placeholder="Min budget (PKR)"
            value={f.min_budget} onChange={set('min_budget')} />
          <Input aria-label="Deadline before" type="date" value={f.deadline_before} onChange={set('deadline_before')} />
          <Select aria-label="Project type" value={f.project_type} onChange={set('project_type')} placeholder="Type"
            options={PROJECT_TYPES} />
          <Select aria-label="Sort" value={f.sort} onChange={set('sort')} options={SORT_OPTIONS} />
        </div>
        <Button variant="ghost" size="sm" onClick={clear}>Clear filters</Button>
      </Card>

      {loading ? (
        <LoadingState label="Loading projects…" />
      ) : error ? (
        <ErrorState title="Could not load projects" text={error.message} onRetry={reload} />
      ) : !items.length ? (
        <EmptyState icon={Search} title="No projects match"
          text="Try removing a filter or searching a different keyword."
          action={<Button onClick={clear}>Clear filters</Button>} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => {
              const isSaved = savedOverrides[p.id] ?? p.saved
              return (
                <ProjectCard key={p.id} p={{ ...p, saved: isSaved }}
                  onSave={() => toggleSave(p)} saved={isSaved} />
              )
            })}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </>
  )
}

// ─── ProjectDetails ───────────────────────────────────────────────────────────

export function ProjectDetails() {
  const { id } = useParams()
  const { data: p, loading, error, reload } = useAsync(() => getProject(id), [id])
  const { data: mySkills = [] } = useAsync(getMySkills)
  const [savedOverride, setSavedOverride] = useState(null)

  const isSaved = savedOverride !== null ? savedOverride : p?.saved

  const toggleSave = async () => {
    const next = !isSaved
    setSavedOverride(next)
    try {
      if (isSaved) await unsaveProject(id)
      else         await saveProject(id)
    } catch {
      setSavedOverride(isSaved)
    }
  }

  if (loading) return <LoadingState label="Loading project…" />
  if (error)   return <ErrorState title="Could not load project" text={error.message} onRetry={reload} />
  if (!p)      return <ErrorState title="Project not found" text="It may have been removed." />

  const mySkillNames = mySkills.map((s) => s.name.toLowerCase())

  return (
    <>
      <PageHeader
        title={p.title}
        back="/freelancer/projects"
        actions={
          <>
            <Button variant="outline" onClick={toggleSave} aria-pressed={!!isSaved}>
              <Bookmark className={cn('h-4 w-4', isSaved && 'fill-brand')} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            {p.status === 'open' && (
              <Button to={`/freelancer/projects/${p.id}/apply`}>Submit proposal</Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-bold">Description</h2>
            <p className="mt-2 text-sm text-muted">{p.description}</p>

            {p.requirements?.length > 0 && (
              <>
                <h2 className="mt-5 font-bold">Requirements</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                  {p.requirements.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </>
            )}

            {p.skills?.length > 0 && (
              <>
                <h2 className="mt-5 font-bold">Required skills</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.skills.map((s) => (
                    <Badge key={s} tone={mySkillNames.includes(s.toLowerCase()) ? 'success' : 'blue'}>
                      {s}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="space-y-3 p-5 text-sm">
            <div className="flex justify-between"><span className="text-muted">Budget</span><strong>{formatPKR(p.budget)}</strong></div>
            {p.deadline && <div className="flex justify-between"><span className="text-muted">Deadline</span><strong>{formatDate(p.deadline)}</strong></div>}
            <div className="flex justify-between"><span className="text-muted">Type</span><strong>{p.project_type}</strong></div>
            <div className="flex justify-between"><span className="text-muted">Status</span><StatusBadge status={p.status} /></div>
          </Card>

          <Card className="p-5 text-sm">
            <h2 className="font-bold">About the client</h2>
            <p className="mt-2">{p.client_name || 'CUI Community'}</p>
            {p.client_rating != null && (
              <p className="mt-1 flex items-center gap-1 text-muted">
                <Star className="h-4 w-4 fill-warn text-warn" />{p.client_rating.toFixed(1)}
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  )
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export function Recommendations() {
  const { data: categories = [] } = useAsync(getCategories)
  const [cat, setCat]   = useState('')
  const [sort, setSort] = useState('match')

  const { data: list = [], loading, error, reload } = useAsync(
    useCallback(() => getRecommendations({ category: cat, sort }), [cat, sort])
  )

  return (
    <>
      <PageHeader title="AI recommendations" subtitle="Projects ranked by fit with your skills." />
      <p className="mb-4 flex items-center gap-1.5 rounded-lg border border-dashed border-brand/40 bg-brand-pale px-3 py-2 text-sm text-brand">
        <span className="font-semibold">Rule-based recommendations</span> — scored by skill overlap and proficiency level.
      </p>

      <div className="my-5 grid max-w-md grid-cols-2 gap-3">
        <Select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}
          placeholder="All categories" options={categories.map((c) => ({ value: c.name, label: c.name }))} />
        <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}
          options={[{ value: 'match', label: 'Best match' }, { value: 'deadline', label: 'Soonest deadline' }]} />
      </div>

      {loading ? (
        <LoadingState label="Finding best matches…" />
      ) : error ? (
        <ErrorState title="Could not load recommendations" text={error.message} onRetry={reload} />
      ) : !list.length ? (
        <EmptyState title="No recommendations yet"
          text="Add more skills to improve your match results."
          action={<Button to="/freelancer/skills">Add skills</Button>} />
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/freelancer/projects/${p.id}`} className="text-lg font-bold hover:text-brand">{p.title}</Link>
                  <p className="text-xs text-muted">{p.client_name} · {formatPKR(p.budget)}</p>
                </div>
                <span className="rounded-full bg-brand-pale px-3 py-1 text-sm font-bold text-brand">
                  {p.match_percent}% match
                </span>
              </div>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted">Matched skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.matched_skills.length
                      ? p.matched_skills.map((s) => <Badge key={s} tone="success">{s}</Badge>)
                      : <span className="text-muted">None</span>}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted">Skills to add</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.missing_skills.length
                      ? p.missing_skills.map((s) => <Badge key={s} tone="warning">{s}</Badge>)
                      : <span className="text-muted">None</span>}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted">
                <strong className="text-navy">Why recommended:</strong> {p.reason}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
