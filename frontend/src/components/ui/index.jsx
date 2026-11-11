import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2, X, Inbox } from 'lucide-react'

export const cn = (...c) => c.filter(Boolean).join(' ')

/* ---------- Buttons ---------- */
const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  navy: 'bg-navy text-white hover:bg-navy-700',
  outline: 'bg-white text-navy border border-line hover:bg-brand-pale',
  ghost: 'text-navy hover:bg-brand-pale',
  danger: 'bg-bad text-white hover:bg-red-600',
}
const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }

export function Button({ variant = 'primary', size = 'md', to, loading, className, children, ...rest }) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
    variants[variant], sizes[size], className
  )
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}{children}
    </button>
  )
}

/* ---------- Form fields ---------- */
export function Field({ label, error, hint, required, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-navy">
          {label}{required && <span className="text-bad"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="flex items-center gap-1 text-xs text-bad"><AlertCircle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  )
}
const control = (err) => cn(
  'w-full rounded-lg border bg-white px-3 text-sm text-navy placeholder:text-slate-400 transition-colors',
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
  err ? 'border-bad' : 'border-line'
)
export function Input({ label, error, hint, required, id, className, icon: Icon, ...rest }) {
  const _id = id || rest.name
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={_id}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />}
        <input id={_id} aria-invalid={!!error} className={cn(control(error), 'h-10', Icon && 'pl-9', className)} {...rest} />
      </div>
    </Field>
  )
}
export function Select({ label, error, hint, required, id, options = [], placeholder, ...rest }) {
  const _id = id || rest.name
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={_id}>
      <select id={_id} className={cn(control(error), 'h-10')} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </Field>
  )
}
export function Textarea({ label, error, hint, required, id, rows = 4, ...rest }) {
  const _id = id || rest.name
  return (
    <Field label={label} error={error} hint={hint} required={required} htmlFor={_id}>
      <textarea id={_id} rows={rows} className={cn(control(error), 'py-2')} {...rest} />
    </Field>
  )
}
export function Checkbox({ label, error, ...rest }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-navy">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand" {...rest} />
        <span>{label}</span>
      </label>
      {error && <p role="alert" className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  )
}

/* ---------- Surfaces ---------- */
export const Card = ({ className, children, ...rest }) => (
  <div className={cn('rounded-xl border border-line bg-white shadow-card', className)} {...rest}>{children}</div>
)
const tones = {
  neutral: 'bg-slate-100 text-slate-600', blue: 'bg-brand-pale text-brand',
  success: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', danger: 'bg-red-50 text-red-700',
}
export const Badge = ({ tone = 'neutral', children, className }) => (
  <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>{children}</span>
)
export const statusTone = (s) => ({
  pending: 'warning', accepted: 'success', rejected: 'danger', withdrawn: 'neutral',
  completed: 'success', released: 'success', 'in progress': 'blue', 'in review': 'warning', open: 'blue',
  resolved: 'success', 'under review': 'warning',
}[String(s).toLowerCase()] || 'neutral')
export const StatusBadge = ({ status }) => <Badge tone={statusTone(status)}>{status}</Badge>

export const DemoBadge = ({ children = 'Demo data' }) => (
  <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-warn/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
    <Info className="h-3 w-3" />{children}
  </span>
)
export const DemoNotice = ({ children }) => (
  <div role="note" className="flex items-start gap-2 rounded-lg border border-dashed border-warn/60 bg-amber-50 px-3 py-2 text-sm text-amber-800">
    <Info className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span>
  </div>
)

export function Avatar({ name = '?', size = 'md', className }) {
  const s = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-20 w-20 text-2xl' }[size]
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-bold text-white', s, className)} aria-hidden="true">{initials}</span>
}

export const PageHeader = ({ title, subtitle, actions, back }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div>
      {back && <Link to={back} className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"><ChevronLeft className="h-4 w-4" />Back</Link>}
      <h1 className="text-2xl font-extrabold tracking-tight text-navy">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
)

export const StatCard = ({ icon: Icon, label, value, note }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-pale text-brand"><Icon className="h-5 w-5" /></span>
      <div><p className="text-sm text-muted">{label}</p><p className="text-2xl font-extrabold">{value}</p></div>
    </div>
    {note && <p className="mt-2 text-xs text-muted">{note}</p>}
  </Card>
)

export function Progress({ value, label, className }) {
  return (
    <div className={className}>
      {label && <div className="mb-1 flex justify-between text-xs font-medium text-muted"><span>{label}</span><span>{value}%</span></div>}
      <div className="h-2 overflow-hidden rounded-full bg-brand-pale" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

/* ---------- States ---------- */
export const EmptyState = ({ icon: Icon = Inbox, title, text, action }) => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand"><Icon className="h-6 w-6" /></span>
    <h3 className="font-bold">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)
export const LoadingState = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted" role="status"><Loader2 className="h-4 w-4 animate-spin" />{label}</div>
)
export const ErrorState = ({ title = 'Something went wrong', text, onRetry }) => (
  <div role="alert" className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
    <AlertCircle className="mb-2 h-7 w-7 text-bad" /><h3 className="font-bold">{title}</h3>
    {text && <p className="mt-1 text-sm text-muted">{text}</p>}
    {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>}
  </div>
)

/* ---------- Overlays ---------- */
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[90vh] w-full max-w-lg animate-pop overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-muted hover:bg-brand-pale"><X className="h-5 w-5" /></button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
export const ConfirmDialog = ({ open, onClose, onConfirm, title, text, confirmLabel = 'Confirm', danger }) => (
  <Modal open={open} onClose={onClose} title={title}
    footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button></>}>
    <p className="text-sm text-muted">{text}</p>
  </Modal>
)

export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button key={t.value} role="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}
          className={cn('whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
            value === t.value ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-navy')}>
          {t.label}{t.count != null && <span className="ml-1.5 rounded-full bg-brand-pale px-1.5 text-xs">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
      <span className="text-sm text-muted">Page {page} of {pages}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
    </nav>
  )
}

export const TableWrap = ({ children }) => (
  <Card className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">{children}</table></Card>
)
export const Th = ({ children }) => <th className="border-b border-line bg-page px-4 py-3 text-xs font-semibold text-muted">{children}</th>
export const Td = ({ children, className }) => <td className={cn('border-b border-line px-4 py-3 last:border-0', className)}>{children}</td>

export function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open])
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="rounded-lg">{trigger}</button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div role="menu" onClick={() => setOpen(false)}
            className={cn('absolute z-40 mt-2 w-56 animate-pop rounded-xl border border-line bg-white p-1.5 shadow-lg', align === 'right' ? 'right-0' : 'left-0')}>
            {children}
          </div>
        </>
      )}
    </div>
  )
}
export const MenuItem = ({ to, onClick, icon: Icon, children, danger }) => {
  const cls = cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-pale', danger ? 'text-bad' : 'text-navy')
  const inner = <>{Icon && <Icon className="h-4 w-4" />}{children}</>
  return to ? <Link role="menuitem" to={to} className={cls}>{inner}</Link> : <button role="menuitem" onClick={onClick} className={cls}>{inner}</button>
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setItems((i) => [...i, { id, message, type }])
    setTimeout(() => setItems((i) => i.filter((t) => t.id !== id)), 4000)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] space-y-2">
        {items.map((t) => (
          <div key={t.id} className="flex animate-pop items-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm font-medium text-white shadow-lg">
            {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-ok" /> : t.type === 'error' ? <AlertCircle className="h-4 w-4 text-bad" /> : <Info className="h-4 w-4 text-brand" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Brand ---------- */
export const Logo = ({ light, to = '/' }) => (
  <Link to={to} className="inline-flex items-center gap-2 font-extrabold tracking-tight">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm text-white">CF</span>
    <span className={light ? 'text-white' : 'text-navy'}>CUI Freelance</span>
  </Link>
)
