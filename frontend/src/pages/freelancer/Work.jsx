import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, FileUp, Gavel, Paperclip, Upload } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input,
  LoadingState, Modal, PageHeader, Progress, StatusBadge, Tabs, Textarea,
  useToast,
} from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import {
  getMyContracts,
  getContractDetail,
  submitWork,
  raiseDispute,
  uploadDeliverable,
} from '../../services/contractsService'
import { formatDate } from '../../data/mock'

// ─── ActiveProjects ────────────────────────────────────────────────────────────

export function ActiveProjects() {
  const { data: contracts = [], loading, error, reload } = useAsync(getMyContracts)

  if (loading) return <LoadingState label="Loading active projects…" />
  if (error)   return <ErrorState title="Could not load projects" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader title="Active projects" />
      {!contracts.length ? (
        <EmptyState
          title="No active projects"
          text="Accepted proposals appear here once a client hires you."
          action={<Button to="/freelancer/projects">Browse projects</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {contracts.map((c) => (
            <Card key={c.project_id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold">{c.title}</h2>
                  <p className="text-xs text-muted">
                    {c.client_name} · {c.deadline ? `Due ${formatDate(c.deadline)}` : 'No deadline'}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <Progress className="mt-4" value={c.progress} label="Progress" />
              <p className="mt-3 text-xs text-muted">
                {c.milestones_done} of {c.milestones_total} milestones complete
              </p>
              <Button className="mt-4" size="sm" to={`/freelancer/active/${c.project_id}`}>
                Open workspace
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Workspace ─────────────────────────────────────────────────────────────────

export function Workspace() {
  const { id } = useParams()
  const toast = useToast()
  const { data: contract, loading, error, reload } = useAsync(
    () => getContractDetail(id), [id]
  )

  const [tab, setTab] = useState('overview')
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeErr, setDisputeErr] = useState('')
  const [disputing, setDisputing] = useState(false)

  const submitDispute = async () => {
    if (disputeReason.trim().length < 20) {
      setDisputeErr('Describe the issue in at least 20 characters.')
      return
    }
    setDisputing(true)
    try {
      await raiseDispute(id, { reason: disputeReason })
      toast('Dispute raised. An admin will review it.')
      setDisputeOpen(false)
      setDisputeReason('')
      setDisputeErr('')
      reload()
    } catch (err) {
      toast(err.message || 'Failed to raise dispute.', 'error')
    } finally {
      setDisputing(false)
    }
  }

  if (loading) return <LoadingState label="Loading workspace…" />
  if (error)   return <ErrorState title="Could not load project" text={error.message} onRetry={reload} />
  if (!contract) return <ErrorState title="Project not found" />

  return (
    <>
      <PageHeader
        title={contract.title}
        back="/freelancer/active"
        subtitle={`${contract.client_name} · ${contract.deadline ? `Due ${formatDate(contract.deadline)}` : 'No deadline'}`}
        actions={
          <>
            {contract.status === 'in_progress' && (
              <Button to={`/freelancer/active/${id}/submit`}>Submit work</Button>
            )}
            <Button variant="outline" onClick={() => setDisputeOpen(true)}>
              <Gavel className="h-4 w-4" />Raise dispute
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview',    label: 'Overview' },
          { value: 'milestones',   label: 'Milestones' },
          { value: 'files',        label: 'Files & deliverables' },
          { value: 'activity',     label: 'Activity' },
        ]}
      />

      <div className="mt-6">
        {/* Overview */}
        {tab === 'overview' && (
          <Card className="space-y-4 p-6">
            <Progress value={contract.progress} label="Overall progress" />
            <p className="text-sm">
              Status: <StatusBadge status={contract.status} />
            </p>
            <p className="text-sm text-muted">
              {contract.milestones_done} of {contract.milestones_total} milestones complete
            </p>
            <Link to="/freelancer/messages" className="text-sm font-semibold text-brand">
              Message the client →
            </Link>
          </Card>
        )}

        {/* Milestones */}
        {tab === 'milestones' && (
          <Card className="p-6">
            <ul className="space-y-3">
              {contract.milestones.map((m) => (
                <li key={m.id} className="flex items-center gap-3 text-sm">
                  {m.done
                    ? <CheckCircle2 className="h-5 w-5 text-ok" />
                    : <Circle className="h-5 w-5 text-line" />}
                  <span className={m.done ? 'text-muted line-through' : 'font-medium'}>
                    {m.title}
                  </span>
                </li>
              ))}
              {!contract.milestones.length && (
                <li className="text-sm text-muted">No milestones defined for this project.</li>
              )}
            </ul>
          </Card>
        )}

        {/* Files & deliverables */}
        {tab === 'files' && (
          <>
            {contract.submissions.length ? (
              <div className="space-y-4">
                {contract.submissions.map((s) => (
                  <Card key={s.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{s.notes || 'No notes provided.'}</p>
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-sm text-brand">
                            <Paperclip className="h-3.5 w-3.5" />Open link
                          </a>
                        )}
                        {s.file_path && (
                          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
                            <FileUp className="h-3.5 w-3.5" />{s.file_path.split('/').pop()}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted">Submitted {formatDate(s.created_at)}</p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Paperclip}
                title="No files yet"
                text="Deliverables you submit will appear here."
                action={
                  contract.status === 'in_progress'
                    ? <Button to={`/freelancer/active/${id}/submit`}>Submit work</Button>
                    : null
                }
              />
            )}
          </>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <Card className="p-6">
            <ul className="space-y-3">
              {contract.activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    {a.text}
                    {a.actor_name && <span className="ml-1 text-xs text-muted">— {a.actor_name}</span>}
                    <p className="text-xs text-muted">{formatDate(a.created_at)}</p>
                  </div>
                </li>
              ))}
              {!contract.activity.length && (
                <li className="text-sm text-muted">No activity recorded yet.</li>
              )}
            </ul>
          </Card>
        )}
      </div>

      {/* Dispute modal */}
      <Modal
        open={disputeOpen}
        onClose={() => { setDisputeOpen(false); setDisputeErr('') }}
        title="Raise a dispute"
        footer={
          <>
            <Button variant="outline" onClick={() => { setDisputeOpen(false); setDisputeErr('') }}>
              Cancel
            </Button>
            <Button variant="danger" loading={disputing} onClick={submitDispute}>
              Submit dispute
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Textarea
            label="What is the issue?"
            required
            rows={5}
            value={disputeReason}
            onChange={(e) => { setDisputeReason(e.target.value); setDisputeErr('') }}
            error={disputeErr}
            hint="Describe the problem clearly. An admin will review this and get back to you."
          />
          <p className="text-xs text-muted">
            Raising a dispute does not freeze funds automatically — an admin will assess the situation
            and take appropriate action.
          </p>
        </div>
      </Modal>
    </>
  )
}

// ─── SubmitWork ────────────────────────────────────────────────────────────────

export function SubmitWork() {
  const { id } = useParams()
  const nav = useNavigate()
  const toast = useToast()

  const { data: contract, loading, error } = useAsync(
    () => getContractDetail(id), [id]
  )

  const [notes, setNotes]       = useState('')
  const [link, setLink]         = useState('')
  const [file, setFile]         = useState(null)
  const [err, setErr]           = useState('')
  const [busy, setBusy]         = useState(false)
  const [uploading, setUploading] = useState(false)

  if (loading) return <LoadingState label="Loading project…" />
  if (error)   return <ErrorState title="Could not load project" text={error.message} />
  if (!contract) return <ErrorState title="Project not found" />

  // Block submission if project isn't in_progress
  if (contract.status !== 'in_progress') {
    return (
      <>
        <PageHeader title="Submit work" subtitle={contract.title} back={`/freelancer/active/${id}`} />
        <Card className="p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-ok" />
          <h2 className="mt-2 text-lg font-bold">
            {contract.status === 'submitted' ? 'Already submitted' : 'Project completed'}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {contract.status === 'submitted'
              ? 'Your work has been submitted and is awaiting client review.'
              : 'This project is no longer accepting submissions.'}
          </p>
          <Button className="mt-4" onClick={() => nav('/freelancer/active')}>Back to projects</Button>
        </Card>
      </>
    )
  }

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
    setErr('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (notes.trim().length < 10) return setErr('Describe what you are submitting (at least 10 characters).')
    if (!file && !link.trim())    return setErr('Upload a file or provide a link to your work.')

    setBusy(true)
    try {
      let filePath = null

      // Upload file if selected
      if (file) {
        setUploading(true)
        filePath = await uploadDeliverable(id, file)
        setUploading(false)
      }

      // Submit work to backend
      await submitWork(id, {
        notes,
        file_path: filePath,
        link: link.trim() || null,
      })

      toast('Work submitted for client review.')
      nav(`/freelancer/active/${id}`)
    } catch (err) {
      toast(err.message || 'Failed to submit work.', 'error')
      setErr(err.message || 'Submission failed.')
    } finally {
      setBusy(false)
      setUploading(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Submit work"
        subtitle={contract.title}
        back={`/freelancer/active/${id}`}
      />

      <form onSubmit={submit} noValidate>
        <Card className="space-y-4 p-6">
          {/* File upload */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Upload deliverable</label>
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line text-sm text-muted hover:bg-brand-pale/30 transition-colors">
              {uploading ? (
                <>
                  <Upload className="h-5 w-5 animate-pulse" />
                  <span>Uploading…</span>
                </>
              ) : file ? (
                <>
                  <FileUp className="h-5 w-5 text-brand" />
                  <span className="text-navy font-medium">{file.name}</span>
                  <span className="text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB) — click to replace</span>
                </>
              ) : (
                <>
                  <FileUp className="h-5 w-5" />
                  <span>Click to upload (PDF, ZIP, images — max 50 MB)</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.zip,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading || busy}
              />
            </label>
          </div>

          {/* External link (optional alternative to file) */}
          <Input
            label="Or provide a link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://your-deliverable-link.com"
            hint="Use this if your work is hosted online (GitHub, Google Drive, etc.)"
          />

          {/* Notes */}
          <Textarea
            label="Submission notes"
            required
            rows={5}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setErr('') }}
            error={err}
            hint="Describe what you've delivered, how to use it, and any notes for the client."
          />
        </Card>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => nav(-1)}>Cancel</Button>
          <Button type="submit" loading={busy} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Submit for review'}
          </Button>
        </div>
      </form>
    </>
  )
}
