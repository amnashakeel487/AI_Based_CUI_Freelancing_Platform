import { useState } from 'react'
import { ExternalLink, FolderKanban, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState,
  Input, LoadingState, Modal, PageHeader, Textarea, useToast,
} from '../../components/ui'
import { useAsync } from '../../hooks/useAsync'
import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolio,
  updatePortfolioItem,
  uploadPortfolioImage,
} from '../../services/portfolioService'

const blank = { id: '', title: '', description: '', tech: '', link: '' }

/** Convert a PortfolioItemResponse from the API to the local form shape. */
const toForm = (p) => ({
  id: p.id,
  title: p.title,
  description: p.description || '',
  tech: (p.technologies || []).join(', '),
  link: p.link || '',
})

export default function Portfolio() {
  const toast = useToast()
  const { data: items = [], loading, error, reload } = useAsync(getPortfolio)

  const [form, setForm]   = useState(null)   // open add/edit modal
  const [view, setView]   = useState(null)   // open view modal
  const [del, setDel]     = useState(null)   // open delete confirm
  const [err, setErr]     = useState({})
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const openForm = (p) => {
    setErr({})
    setForm(p ? toForm(p) : blank)
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const save = async () => {
    const x = {}
    if (!form.title.trim()) x.title = 'Enter a title.'
    if (form.link && !/^https?:\/\//.test(form.link)) x.link = 'Start with http:// or https://'
    setErr(x)
    if (Object.keys(x).length) return

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      technologies: form.tech.split(',').map((t) => t.trim()).filter(Boolean),
      link: form.link || null,
    }

    setSaving(true)
    try {
      if (form.id) {
        await updatePortfolioItem(form.id, payload)
        toast('Project updated.')
      } else {
        await createPortfolioItem(payload)
        toast('Project added.')
      }
      setForm(null)
      reload()
    } catch (e) {
      toast(e.message || 'Failed to save project.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deletePortfolioItem(del.id)
      toast('Project deleted.')
      setDel(null)
      reload()
    } catch (e) {
      toast(e.message || 'Failed to delete project.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleImageUpload = async (e, item) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadPortfolioImage(item.id, file)
      toast('Image uploaded.')
      reload()
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingState label="Loading portfolio…" />
  if (error)   return <ErrorState title="Could not load portfolio" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Portfolio"
        actions={<Button onClick={() => openForm()}><Plus className="h-4 w-4" />Add project</Button>}
      />

      {!items.length ? (
        <EmptyState
          icon={FolderKanban}
          title="No portfolio projects"
          text="Add finished work to build trust with clients."
          action={<Button onClick={() => openForm()}>Add project</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {/* Image area */}
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.title}
                  className="h-28 w-full object-cover"
                />
              ) : (
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 bg-brand-pale text-xs text-muted hover:bg-brand-pale/70 transition-colors">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => handleImageUpload(e, p)}
                    disabled={uploading}
                  />
                </label>
              )}

              <div className="p-4">
                <h3 className="font-bold">{p.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(p.technologies || []).map((t) => <Badge key={t} tone="blue">{t}</Badge>)}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setView(p)}>View</Button>
                  <Button size="sm" variant="ghost" onClick={() => openForm(p)} aria-label={`Edit ${p.title}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDel(p)} aria-label={`Delete ${p.title}`}>
                    <Trash2 className="h-4 w-4 text-bad" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit project' : 'Add project'}
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save project</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-3">
            <Input label="Title" required value={form.title} onChange={set('title')} error={err.title} />
            <Textarea label="Description" rows={3} value={form.description} onChange={set('description')} />
            <Input label="Technologies" value={form.tech} onChange={set('tech')} hint="Separate with commas." />
            <Input label="Project link" value={form.link} onChange={set('link')} error={err.link} />
          </div>
        )}
      </Modal>

      {/* View modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.title}>
        {view && (
          <div className="space-y-3 text-sm">
            {view.image_url && (
              <img src={view.image_url} alt={view.title} className="w-full rounded-lg object-cover" />
            )}
            <p>{view.description}</p>
            <div className="flex flex-wrap gap-1">
              {(view.technologies || []).map((t) => <Badge key={t} tone="blue">{t}</Badge>)}
            </div>
            {view.link && (
              <a className="inline-flex items-center gap-1 font-semibold text-brand" href={view.link} target="_blank" rel="noreferrer">
                Open link <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!del}
        danger
        title="Delete project?"
        text={`"${del?.title}" will be removed from your portfolio.`}
        confirmLabel="Delete"
        onClose={() => setDel(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
