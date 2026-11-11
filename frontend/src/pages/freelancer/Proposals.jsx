import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'
import {
  Button, Card, Checkbox, ConfirmDialog, EmptyState, ErrorState, Input,
  LoadingState, PageHeader, Select, StatusBadge, TableWrap, Td, Textarea,
  Th, useToast,
} from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getMyBids, getBid, createBid, updateBid, withdrawBid } from '../../services/bidsService'
import { getProject } from '../../services/projectsService'
import { getPortfolio } from '../../services/portfolioService'
import { formatDate, formatPKR } from '../../data/mock'

// ─── MyProposals ──────────────────────────────────────────────────────────────

export function MyProposals() {
  const toast = useToast()
  const { data: bids = [], loading, error, reload } = useAsync(getMyBids)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const doWithdraw = async () => {
    setWithdrawing(true)
    try {
      await withdrawBid(withdrawTarget.id)
      toast('Proposal withdrawn.')
      setWithdrawTarget(null)
      reload()
    } catch (err) {
      toast(err.message || 'Failed to withdraw proposal.', 'error')
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) return <LoadingState label="Loading proposals…" />
  if (error)   return <ErrorState title="Could not load proposals" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader title="My proposals" />
      {!bids.length ? (
        <EmptyState icon={FileText} title="No proposals yet"
          text="Find a project and send your first proposal."
          action={<Button to="/freelancer/projects">Browse projects</Button>} />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Project</Th><Th>Amount</Th><Th>Delivery</Th><Th>Submitted</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {bids.map((b) => (
              <tr key={b.id}>
                <Td className="font-semibold">{b.project_title || '—'}</Td>
                <Td>{formatPKR(b.amount)}</Td>
                <Td>{b.delivery_days} days</Td>
                <Td>{formatDate(b.created_at)}</Td>
                <Td><StatusBadge status={b.status} /></Td>
                <Td>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" to={`/freelancer/proposals/${b.id}`}>View</Button>
                    {b.status === 'pending' && (
                      <Button size="sm" variant="ghost" onClick={() => setWithdrawTarget(b)}>Withdraw</Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <ConfirmDialog
        open={!!withdrawTarget}
        danger
        title="Withdraw proposal?"
        text="The client will no longer see this proposal. You can send a new one later."
        confirmLabel={withdrawing ? 'Withdrawing…' : 'Withdraw'}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={doWithdraw}
      />
    </>
  )
}

// ─── ProposalDetails ──────────────────────────────────────────────────────────

export function ProposalDetails() {
  const { id } = useParams()
  const { data: bid, loading, error, reload } = useAsync(() => getBid(id), [id])
  const { data: project } = useAsync(
    () => (bid?.project_id ? getProject(bid.project_id) : Promise.resolve(null)),
    [bid?.project_id]
  )

  if (loading) return <LoadingState label="Loading proposal…" />
  if (error)   return <ErrorState title="Could not load proposal" text={error.message} onRetry={reload} />
  if (!bid)    return <ErrorState title="Proposal not found" />

  return (
    <>
      <PageHeader title={bid.project_title || 'Proposal'} back="/freelancer/proposals"
        actions={<StatusBadge status={bid.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4 p-6 lg:col-span-2">
          <div>
            <h2 className="font-bold">Cover letter</h2>
            <p className="mt-1 text-sm text-muted whitespace-pre-wrap">{bid.cover_letter}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><p className="text-muted">Amount</p><strong>{formatPKR(bid.amount)}</strong></div>
            <div><p className="text-muted">Delivery</p><strong>{bid.delivery_days} days</strong></div>
            <div><p className="text-muted">Submitted</p><strong>{formatDate(bid.created_at)}</strong></div>
          </div>
          {bid.client_response && (
            <div>
              <h2 className="font-bold">Client response</h2>
              <p className="mt-1 text-sm text-muted">{bid.client_response}</p>
            </div>
          )}
          {!bid.client_response && bid.status === 'pending' && (
            <p className="text-sm text-muted italic">No response yet — you will be notified when the client replies.</p>
          )}
        </Card>

        <Card className="space-y-3 p-5 text-sm">
          <h2 className="font-bold">Project</h2>
          {project ? (
            <>
              <p className="text-muted">{project.description}</p>
              <Link className="font-semibold text-brand" to={`/freelancer/projects/${project.id}`}>View project</Link>
            </>
          ) : <p className="text-muted">Loading project details…</p>}
          <div className="flex flex-col gap-2 pt-2">
            {bid.status === 'pending' && (
              <Button variant="outline" to={`/freelancer/projects/${bid.project_id}/apply`}>Edit proposal</Button>
            )}
            {bid.status === 'accepted' && <Button to="/freelancer/active">Open active project</Button>}
            {bid.status === 'rejected' && <Button variant="outline" to="/freelancer/projects">Find other projects</Button>}
          </div>
        </Card>
      </div>
    </>
  )
}

// ─── SubmitProposal ───────────────────────────────────────────────────────────

export function SubmitProposal() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()

  const { data: project, loading: projLoading, error: projError } = useAsync(
    () => getProject(id), [id]
  )
  const { data: portfolioItems = [] } = useAsync(getPortfolio)

  // Check if user already has a bid on this project (edit mode)
  const { data: existingBids = [] } = useAsync(getMyBids)
  const existingBid = existingBids.find((b) => b.project_id === id && b.status === 'pending')

  const [v, setV] = useState(null)   // form state seeded once data loads
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  // Seed form from existing bid or blank
  if ((existingBid || project) && !v) {
    setV({
      cover:    existingBid?.cover_letter   ?? '',
      bid:      existingBid?.amount         ?? '',
      days:     existingBid?.delivery_days  ?? '',
      port:     existingBid?.portfolio_item_id ?? '',
      confirm:  false,
    })
  }

  const set = (k) => (e) =>
    setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const x = {}
    if (!v.cover.trim() || v.cover.trim().length < 50) x.cover = 'Write at least 50 characters about your approach.'
    if (!(Number(v.bid) > 0))  x.bid  = 'Enter a bid amount above zero.'
    if (!(Number(v.days) > 0)) x.days = 'Enter the estimated days.'
    if (!v.confirm)            x.confirm = 'Please confirm before submitting.'
    setErr(x)
    if (Object.keys(x).length) return

    setBusy(true)
    try {
      if (existingBid) {
        await updateBid(existingBid.id, {
          cover_letter:      v.cover,
          amount:            Number(v.bid),
          delivery_days:     Number(v.days),
          portfolio_item_id: v.port || null,
        })
        toast('Proposal updated.')
      } else {
        await createBid({
          project_id:        id,
          cover_letter:      v.cover,
          amount:            Number(v.bid),
          delivery_days:     Number(v.days),
          portfolio_item_id: v.port || null,
        })
        toast('Proposal submitted.')
      }
      nav('/freelancer/proposals')
    } catch (err) {
      // Specific errors (duplicate bid, closed project) from backend
      const msg = err.message || 'Failed to submit proposal.'
      if (msg.includes('already submitted')) {
        toast('You already have a proposal on this project.', 'error')
        nav('/freelancer/proposals')
      } else {
        toast(msg, 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  if (projLoading) return <LoadingState label="Loading project…" />
  if (projError)   return <ErrorState title="Could not load project" text={projError.message} />
  if (!project)    return <ErrorState title="Project not found" />
  if (!v)          return <LoadingState label="Loading…" />

  const isEdit = !!existingBid

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit proposal' : 'Submit proposal'}
        subtitle={project.title}
        back={`/freelancer/projects/${project.id}`}
      />
      <form onSubmit={submit} noValidate>
        <Card className="space-y-4 p-6">
          <Textarea
            label="Cover letter" required rows={6}
            value={v.cover} onChange={set('cover')} error={err.cover}
            hint="Describe your approach, relevant experience, and why you're the right fit. Min. 50 characters."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Bid amount (PKR)" required type="number" min="0"
              value={v.bid} onChange={set('bid')} error={err.bid}
              hint={`Client budget: ${formatPKR(project.budget)}`}
            />
            <Input
              label="Estimated completion (days)" required type="number" min="1"
              value={v.days} onChange={set('days')} error={err.days}
              hint={project.deadline ? `Deadline: ${formatDate(project.deadline)}` : undefined}
            />
          </div>
          {portfolioItems.length > 0 && (
            <Select
              label="Attach a portfolio project (optional)"
              value={v.port} onChange={set('port')}
              placeholder="None"
              options={portfolioItems.map((p) => ({ value: p.id, label: p.title }))}
            />
          )}
          <Checkbox
            checked={v.confirm} onChange={set('confirm')} error={err.confirm}
            label="I confirm this proposal is accurate and I can meet the deadline."
          />
        </Card>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => nav(-1)}>Cancel</Button>
          <Button type="submit" loading={busy}>{isEdit ? 'Update proposal' : 'Submit proposal'}</Button>
        </div>
      </form>
    </>
  )
}
