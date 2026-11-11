import { Link } from 'react-router-dom'
import { Briefcase, CheckCircle2, Clock, FileText, Star } from 'lucide-react'
import { Button, Card, EmptyState, LoadingState, PageHeader, Progress, StatCard } from '../../components/ui'
import ProjectCard from '../../components/ProjectCard'
import { useAsync } from '../../hooks/useAsync'
import { useAuth } from '../../context/AuthContext'
import { getProfileCompletion } from '../../services/profileService'
import { getMyContracts } from '../../services/contractsService'
import { getMyBids } from '../../services/bidsService'
import { getRecommendations } from '../../services/projectsService'
import { getReviewSummary } from '../../services/reviewsService'
import { formatDate, formatPKR } from '../../data/mock'

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.full_name?.split(' ')[0] ?? 'there'

  // All API calls are best-effort — failures show empty state, not white screen
  const { data: completion }     = useAsync(getProfileCompletion)
  const { data: contracts = [] } = useAsync(getMyContracts)
  const { data: pendingBids = [] } = useAsync(() => getMyBids('pending').catch(() => []))
  const { data: recs = [] }      = useAsync(() => getRecommendations({ sort: 'match' }).catch(() => []))
  const { data: reviewSummary }  = useAsync(getReviewSummary)

  const completionPct = completion?.completion ?? user?.profile_completion ?? 0
  const activeCount = contracts.length
  const pendingCount = pendingBids.length
  const completedCount = reviewSummary?.total_reviews ?? 0
  const avgRating = reviewSummary?.avg_rating?.toFixed(1) ?? user?.avg_rating ?? '—'

  // Upcoming deadlines from active contracts
  const upcoming = contracts
    .filter((c) => c.deadline)
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 4)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here is what is happening with your work."
        actions={<Button to="/freelancer/projects">Browse projects</Button>}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} label="Active projects" value={activeCount} />
        <StatCard icon={FileText} label="Pending proposals" value={pendingCount} />
        <StatCard icon={CheckCircle2} label="Completed projects" value={completedCount} />
        <StatCard icon={Star} label="Average rating" value={avgRating} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Recommended projects */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Recommended projects</h2>
              <Link to="/freelancer/recommendations" className="text-sm font-semibold text-brand">View all</Link>
            </div>
            {!recs.length ? (
              <Card className="p-6">
                <EmptyState
                  icon={Star}
                  title="No recommendations yet"
                  text="Add skills to your profile to get matched projects."
                  action={<Button to="/freelancer/skills" size="sm">Add skills</Button>}
                />
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recs.slice(0, 2).map((p) => (
                  <ProjectCard key={p.id} p={{ ...p, match: p.match_percent }} showMatch />
                ))}
              </div>
            )}
          </section>

          {/* Recent activity */}
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Recent activity</h2>
            {!contracts.length ? (
              <p className="text-sm text-muted">No active projects yet. Once a client hires you, activity will appear here.</p>
            ) : (
              <ul className="space-y-3">
                {contracts.slice(0, 4).map((c) => (
                  <li key={c.project_id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div>
                      <Link to={`/freelancer/active/${c.project_id}`} className="font-semibold hover:text-brand">{c.title}</Link>
                      <p className="text-xs text-muted">
                        {c.status === 'in_progress' ? 'In progress' : 'Submitted for review'} · {c.milestones_done}/{c.milestones_total} milestones
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Profile completion */}
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Profile completion</h2>
            <Progress value={completionPct} />
            <Button to="/freelancer/profile/edit" variant="outline" size="sm" className="mt-4 w-full">
              Complete profile
            </Button>
          </Card>

          {/* Upcoming deadlines */}
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Upcoming deadlines</h2>
            {!upcoming.length ? (
              <p className="text-sm text-muted">No upcoming deadlines.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((c) => (
                  <li key={c.project_id} className="flex items-start gap-2 text-sm">
                    <Clock className="mt-0.5 h-4 w-4 text-warn" />
                    <div>
                      <Link to={`/freelancer/active/${c.project_id}`} className="font-semibold hover:text-brand">{c.title}</Link>
                      <p className="text-xs text-muted">{formatDate(c.deadline)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Quick actions */}
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Quick actions</h2>
            <div className="grid gap-2">
              <Button variant="outline" size="sm" to="/freelancer/portfolio">Add portfolio project</Button>
              <Button variant="outline" size="sm" to="/freelancer/skills">Update skills</Button>
              <Button variant="outline" size="sm" to="/freelancer/messages">Open messages</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
