import { Button, EmptyState } from '../../components/ui'
export default function NotFound() {
  return <div className="mx-auto max-w-lg p-10"><EmptyState title="Page not found" text="The page you are looking for does not exist or has moved." action={<Button to="/">Go to home</Button>} /></div>
}
