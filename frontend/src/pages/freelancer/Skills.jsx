import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader, useToast } from '../../components/ui'
import SkillPicker from '../../components/SkillPicker'
import { useAsync } from '../../hooks/useAsync'
import { getMySkills, replaceSkills } from '../../services/skillsService'

export default function Skills() {
  const toast = useToast()
  // Load initial skills from backend
  const { data: savedSkills, loading, error, reload } = useAsync(getMySkills)
  // Local edit state: keep edits until the user explicitly saves
  const [skills, setSkills] = useState(null)
  const [saving, setSaving] = useState(false)

  // Once loaded, seed local state once
  const displayed = skills ?? savedSkills ?? []

  const save = async () => {
    setSaving(true)
    try {
      await replaceSkills(displayed)
      // Reset local edits, reload from server to confirm
      setSkills(null)
      await reload()
      toast('Skills saved.')
    } catch (err) {
      toast(err.message || 'Failed to save skills.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const isDirty = skills !== null

  if (loading) return <LoadingState label="Loading skills…" />
  if (error)   return <ErrorState title="Could not load skills" text={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Skills"
        subtitle="Skills drive your project recommendations."
        actions={
          <Button onClick={save} loading={saving} disabled={!isDirty}>
            Save skills
          </Button>
        }
      />
      <Card className="p-6">
        <SkillPicker
          value={displayed}
          onChange={(updated) => setSkills(updated)}
        />
        {!displayed.length && (
          <div className="mt-4">
            <EmptyState
              icon={Wrench}
              title="No skills yet"
              text="Search above and add the skills you want to be matched on."
            />
          </div>
        )}
      </Card>
    </>
  )
}
