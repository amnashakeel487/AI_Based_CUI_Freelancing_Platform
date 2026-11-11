import { useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader,
  Select, StatusBadge, TableWrap, Td, Textarea, Th, cn, useToast,
} from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getMyComplaints, createComplaint } from '../../services/complaintsService'
import { formatDate } from '../../data/mock'

const FAQ_ITEMS = [
  { q: 'Who can use CUI Freelance?', a: 'The platform is built for the CUI community. Registration uses a COMSATS email address.' },
  { q: 'How does AI matching work?', a: 'Recommendations compare project requirements with your skills and profile. The current engine is rule-based, scoring by skill overlap and proficiency level.' },
  { q: 'Is payment handled on the platform?', a: 'Payment handling is planned for a later phase. Earnings screens show transaction records once escrow is connected.' },
  { q: 'Can I be both a freelancer and a client?', a: 'Each account has one role for now. Role switching can be added later.' },
  { q: 'How do disputes work?', a: 'If you raise a dispute from an active project workspace, an admin will review it and take appropriate action. Funds are not frozen automatically.' },
  { q: 'How long does admin approval take?', a: 'Admin approval typically takes 1-2 business days. You will be notified via email once approved.' },
]

export default function Help() {
  const toast = useToast()
  const { data: complaints = [], loading, error, reload } = useAsync(getMyComplaints)

  const [open, setOpen] = useState(0)
  const [v, setV] = useState({ subject: '', project: '', desc: '' })
  const [err, setErr] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    const x = {}
    if (!v.subject.trim()) x.subject = 'Enter a subject.'
    if (v.desc.trim().length < 20) x.desc = 'Describe the issue in at least 20 characters.'
    setErr(x)
    if (Object.keys(x).length) return

    setBusy(true)
    try {
      await createComplaint({
        subject: v.subject,
        description: v.desc,
        project_id: null,
      })
      toast('Complaint submitted. Support will get back to you.')
      setV({ subject: '', project: '', desc: '' })
      reload()
    } catch (err) {
      toast(err.message || 'Failed to submit complaint.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Help and complaints" />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQ */}
        <section>
          <h2 className="mb-3 font-bold">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((f, i) => (
              <Card key={f.q}>
                <button
                  className="flex w-full items-center justify-between gap-2 p-4 text-left text-sm font-semibold"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  {f.q}
                  <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open === i && 'rotate-180')} />
                </button>
                {open === i && (
                  <p className="px-4 pb-4 text-sm text-muted">{f.a}</p>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Complaints */}
        <section>
          <h2 className="mb-3 font-bold">Submit a complaint</h2>
          <form onSubmit={submit} noValidate>
            <Card className="space-y-4 p-5">
              <Input
                label="Subject"
                required
                value={v.subject}
                onChange={set('subject')}
                error={err.subject}
                placeholder="Briefly describe the issue"
              />
              <Textarea
                label="Describe the issue"
                required
                rows={4}
                value={v.desc}
                onChange={set('desc')}
                error={err.desc}
                hint="Provide enough detail for our team to understand the problem. Min. 20 characters."
              />
              <Button type="submit" loading={busy}>Submit complaint</Button>
            </Card>
          </form>

          <h2 className="mb-3 mt-6 font-bold">Your complaints</h2>
          {loading ? (
            <LoadingState label="Loading complaints…" />
          ) : error ? (
            <ErrorState title="Could not load complaints" text={error.message} onRetry={reload} />
          ) : !complaints.length ? (
            <EmptyState
              title="No complaints filed"
              text="Your submitted complaints will appear here."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Subject</Th><Th>Date</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id}>
                    <Td className="font-semibold">{c.subject}</Td>
                    <Td>{formatDate(c.created_at)}</Td>
                    <Td><StatusBadge status={c.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </section>
      </div>
    </>
  )
}
