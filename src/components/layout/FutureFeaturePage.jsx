import { ArrowLeft, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FutureFeaturePage({ eyebrow, title, description, items, icon: Icon }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,_#d1fae5,_transparent_34%),linear-gradient(#f8fafc,#eef2f7)] px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800 ring-1 ring-amber-200">
              <Clock3 className="size-3.5" /> {eyebrow}
            </span>
            <div className="mt-7 grid size-14 place-items-center rounded-2xl bg-emerald-950 text-emerald-200"><Icon className="size-7" /></div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{description}</p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              <ArrowLeft className="size-4" /> Return to dashboard
            </Link>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Planned integration points</p>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item} className="flex gap-3 rounded-xl bg-white p-3 text-xs leading-5 text-slate-600 shadow-sm ring-1 ring-slate-100">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500" /> {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] leading-5 text-slate-500">This page is intentionally a placeholder. It does not simulate results or expose controls that are not backed by research data.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
