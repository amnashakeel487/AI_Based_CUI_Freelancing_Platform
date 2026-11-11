import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Logo } from '../components/ui'

export default function AuthLayout({ wide }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden flex-col justify-between bg-navy p-10 text-white lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">Real projects for the CUI community.</h2>
          <ul className="mt-8 space-y-4 text-sm text-slate-300">
            <li className="flex gap-3"><Users className="h-5 w-5 text-brand" />Freelancers and clients from your own university</li>
            <li className="flex gap-3"><Sparkles className="h-5 w-5 text-brand" />Matching based on skills and project needs</li>
            <li className="flex gap-3"><ShieldCheck className="h-5 w-5 text-brand" />COMSATS email required to join</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">© CUI Freelance prototype</p>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 self-start text-sm font-medium text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Back to home</Link>
        <div className={`m-auto w-full ${wide ? 'max-w-4xl' : 'max-w-md'}`}><Outlet /></div>
      </main>
    </div>
  )
}
