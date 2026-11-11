import { Star } from 'lucide-react'
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, Progress } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getReviewSummary } from '../../services/reviewsService'
import { formatDate } from '../../data/mock'

const Stars = ({ n }) => (
  <span className="flex" aria-label={`${n} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-4 w-4 ${i <= n ? 'fill-warn text-warn' : 'text-line'}`} />
    ))}
  </span>
)

export default function Reviews() {
  const { data: summary, loading, error, reload } = useAsync(getReviewSummary)

  if (loading) return <LoadingState label="Loading reviews…" />
  if (error)   return <ErrorState title="Could not load reviews" text={error.message} onRetry={reload} />
  if (!summary) return null

  const { avg_rating, total_reviews, breakdown = {}, recent_reviews = [] } = summary

  return (
    <>
      <PageHeader title="Reviews and feedback" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <Card className="p-6">
          <p className="text-4xl font-extrabold">{avg_rating.toFixed(1)}</p>
          <Stars n={Math.round(avg_rating)} />
          <p className="mt-1 text-sm text-muted">{total_reviews} review{total_reviews !== 1 ? 's' : ''}</p>

          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3">{s}</span>
                <div className="flex-1">
                  <Progress
                    value={total_reviews ? Math.round((breakdown[s] || 0) / total_reviews * 100) : 0}
                  />
                </div>
                <span className="w-4 text-muted">{breakdown[s] || 0}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Review list */}
        <div className="space-y-3 lg:col-span-2">
          {!recent_reviews.length ? (
            <EmptyState
              icon={Star}
              title="No reviews yet"
              text="Reviews from clients will appear here after you complete projects."
            />
          ) : (
            recent_reviews.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between">
                  <Stars n={r.rating} />
                  <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                <p className="mt-2 text-xs text-muted">
                  {r.client_name || 'Anonymous client'}
                  {r.project_title ? ` · ${r.project_title}` : ''}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
