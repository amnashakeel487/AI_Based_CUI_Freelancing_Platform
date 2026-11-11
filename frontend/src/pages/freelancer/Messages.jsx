import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageSquare, Search, Send } from 'lucide-react'
import { Avatar, Card, EmptyState, ErrorState, LoadingState, PageHeader, cn } from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import { getConversations, getMessages, sendMessage, markConversationRead } from '../../services/messagesService'
import { supabase } from '../../lib/supabase'

export default function Messages() {
  const { data: conversations = [], loading, error, reload: reloadConvs } = useAsync(getConversations)
  const [sel, setSel] = useState(null)
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const cur = conversations.find((c) => c.id === sel)
  const filtered = conversations.filter((c) =>
    c.other_party_name.toLowerCase().includes(q.toLowerCase())
  )

  // Load messages when a conversation is selected
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return setMessages([])
    setMsgLoading(true)
    try {
      const msgs = await getMessages(convId)
      setMessages(msgs)
      // Mark as read
      await markConversationRead(convId)
      reloadConvs()  // refresh unread counts
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setMsgLoading(false)
    }
  }, [reloadConvs])

  useEffect(() => {
    if (sel) loadMessages(sel)
  }, [sel, loadMessages])

  // Supabase Realtime: subscribe to new messages
  useEffect(() => {
    if (!sel) return
    const channel = supabase
      .channel(`conversation:${sel}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${sel}`,
      }, (payload) => {
        // Add the new message to the list
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
        // If the message is from the other party, mark as read
        if (payload.new.sender_id !== sel) {
          markConversationRead(sel)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sel])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !sel) return
    setSending(true)
    try {
      const msg = await sendMessage(sel, text)
      setMessages((prev) => [...prev, msg])
      setText('')
      reloadConvs()  // refresh last message in list
    } catch (err) {
      console.error('Send failed:', err)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <LoadingState label="Loading conversations…" />
  if (error)   return <ErrorState title="Could not load messages" text={error.message} onRetry={reloadConvs} />

  return (
    <>
      <PageHeader title="Messages" />
      <Card className="grid h-[70vh] overflow-hidden md:grid-cols-[300px_1fr]">
        {/* Sidebar — conversation list */}
        <div className={cn('flex flex-col border-r border-line', cur && 'hidden md:flex')}>
          <div className="relative border-b border-line p-3">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              aria-label="Search conversations"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-lg border border-line pl-8 pr-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSel(c.id)}
                  className={cn(
                    'flex w-full items-center gap-3 p-3 text-left hover:bg-page',
                    sel === c.id && 'bg-brand-pale'
                  )}
                >
                  <Avatar name={c.other_party_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.other_party_name}</p>
                    <p className="truncate text-xs text-muted">{c.last_message || 'No messages yet'}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="rounded-full bg-brand px-2 text-xs font-bold text-white">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="p-4 text-sm text-muted">No conversations found.</li>
            )}
          </ul>
        </div>

        {/* Main — message view */}
        <div className={cn('flex flex-col', !cur && 'hidden md:flex')}>
          {!cur ? (
            <div className="m-auto">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                text="Choose a conversation to read and reply."
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-line p-3">
                <button
                  className="text-sm font-semibold text-brand md:hidden"
                  onClick={() => setSel(null)}
                >
                  Back
                </button>
                <Avatar name={cur.other_party_name} size="sm" />
                <div>
                  <p className="font-semibold">{cur.other_party_name}</p>
                  {cur.project_title && (
                    <p className="text-xs text-muted">{cur.project_title}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-2 overflow-y-auto bg-page p-4">
                {msgLoading ? (
                  <LoadingState label="Loading messages…" />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'max-w-[75%] rounded-xl px-3 py-2 text-sm',
                        m.is_mine || m.sender_id === cur.other_party_id
                          ? m.is_mine
                            ? 'ml-auto bg-brand text-white'
                            : 'bg-white shadow-card'
                          : 'bg-white shadow-card'
                      )}
                    >
                      {m.body}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
                <input
                  aria-label="Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message"
                  className="h-10 flex-1 rounded-lg border border-line px-3 text-sm focus:border-brand focus:outline-none"
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-brand p-2.5 text-white disabled:opacity-50"
                  aria-label="Send"
                  disabled={sending || !text.trim()}
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </Card>
    </>
  )
}
