import { useState } from 'react'
import { Clock, Wallet, CheckCircle2 } from 'lucide-react'
import { Card, EmptyState, ErrorState, LoadingState, Modal, PageHeader, StatCard, StatusBadge, TableWrap, Td, Th, Button } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getEarningsSummary, getTransactions } from '../../services/earningsService'
import { formatDate, formatPKR } from '../../data/mock'

export function Earnings() {
  const { data: summary, loading, error, reload } = useAsync(getEarningsSummary)

  if (loading) return <LoadingState label="Loading earnings…" />
  if (error)   return <ErrorState title="Could not load earnings" text={error.message} onRetry={reload} />
  if (!summary) return null

  const recent = summary.recent_transactions || []

  return (
    <>
      <PageHeader title="Earnings" />
      <div className="my-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Wallet} label="Total earned" value={formatPKR(summary.total_earned)} />
        <StatCard icon={CheckCircle2} label="Released" value={formatPKR(summary.released)} />
        <StatCard icon={Clock} label="In escrow" value={formatPKR(summary.held_in_escrow)} />
      </div>

      <h2 className="mb-3 font-bold">Payment history</h2>
      {!recent.length ? (
        <EmptyState
          icon={Wallet}
          title="No transactions yet"
          text="Payments will appear here once you complete projects."
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Project</Th><Th>Amount</Th><Th>Date</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t.id}>
                <Td className="font-semibold">{t.project_title || '—'}</Td>
                <Td>{formatPKR(t.amount)}</Td>
                <Td>{formatDate(t.created_at)}</Td>
                <Td><StatusBadge status={t.status} /></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  )
}

export function Transactions() {
  const { data: transactions = [], loading, error, reload } = useAsync(getTransactions)
  const [sel, setSel] = useState(null)

  if (loading) return <LoadingState label="Loading transactions…" />
  if (error)   return <ErrorState title="Could not load transactions" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader title="Transactions" />
      {!transactions.length ? (
        <EmptyState
          icon={Clock}
          title="No transactions yet"
          text="Your payment history will appear here."
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Project</Th><Th>Amount</Th><Th>Date</Th><Th>Status</Th><Th> </Th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <Td className="font-semibold">{t.project_title || '—'}</Td>
                <Td>{formatPKR(t.amount)}</Td>
                <Td>{formatDate(t.created_at)}</Td>
                <Td><StatusBadge status={t.status} /></Td>
                <Td>
                  <Button size="sm" variant="ghost" onClick={() => setSel(t)}>Details</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Modal open={!!sel} onClose={() => setSel(null)} title="Transaction details">
        {sel && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Project</dt>
              <dd className="font-semibold">{sel.project_title || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Amount</dt>
              <dd className="font-semibold">{formatPKR(sel.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Date</dt>
              <dd className="font-semibold">{formatDate(sel.created_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Status</dt>
              <dd className="font-semibold"><StatusBadge status={sel.status} /></dd>
            </div>
            {sel.released_at && (
              <div className="flex justify-between">
                <dt className="text-muted">Released on</dt>
                <dd className="font-semibold">{formatDate(sel.released_at)}</dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </>
  )
}
