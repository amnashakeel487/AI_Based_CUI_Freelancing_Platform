import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, Tabs, cn } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationsService'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../data/mock'

export default function Notifications() {
  const { data: items = [], loading, error, reload } = useAsync(getNotifications)
  const [tab, setTab] = useState('all')

  // Supabase Realtime: listen for new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => {
        reload()  // refetch to get the new notification
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reload])

  const mark = async (id) => {
    try {
      await markNotificationRead(id)
      reload()
    } catch (err) {
      console.error('Failed to mark notification:', err)
    }
  }

  const markAll = async () => {
    try {
      await markAllNotificationsRead()
      reload()
    } catch (err) {
      console.error('Failed to mark all notifications:', err)
    }
  }

  const unreadCount = items.filter((n) => !n.read).length
  const shown = items.filter((n) =>
    tab === 'all' ? true
    : tab === 'unread' ? !n.read
    : n.type.toLowerCase().includes(tab.toLowerCase())
  )

  if (loading) return <LoadingState label="Loading notifications…" />
  if (error)   return <ErrorState title="Could not load notifications" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Notifications"
        actions={
          <Button variant="outline" onClick={markAll} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread', count: unreadCount },
          { value: 'proposals', label: 'Proposals' },
          { value: 'messages', label: 'Messages' },
          { value: 'projects', label: 'Projects' },
          { value: 'submission', label: 'Submissions' },
          { value: 'dispute', label: 'Disputes' },
        ]}
      />
      <div className="mt-4 space-y-2">
        {!shown.length ? (
          <EmptyState icon={Bell} title="You are all caught up" text="New notifications will appear here." />
        ) : (
          shown.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'flex items-start gap-3 p-4 transition-colors',
                !n.read && 'border-brand/40 bg-brand-pale/50'
              )}
            >
              <span
                className={cn(
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  n.read ? 'bg-line' : 'bg-brand'
                )}
              />
              <div className="flex-1 text-sm">
                <p className={!n.read ? 'font-semibold' : ''}>{n.body}</p>
                <p className="text-xs text-muted">
                  {n.type} · {formatDate(n.created_at)}
                </p>
              </div>
              {!n.read && (
                <Button size="sm" variant="ghost" onClick={() => mark(n.id)}>
                  Mark as read
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  )
}
