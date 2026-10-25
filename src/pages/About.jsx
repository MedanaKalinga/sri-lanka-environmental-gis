import { Database, Layers3, MapPinned, Workflow } from 'lucide-react'

const cards = [
  { icon: MapPinned, title: 'Geographic scope', text: 'DS Division polygons are loaded from a local, researcher-supplied GeoJSON file.' },
  { icon: Layers3, title: 'Phase 1', text: 'Interactive cluster and indicator visualization with linked filters and selection.' },
  { icon: Database, title: 'Data integrity', text: 'Boundaries and results join through stable DS identifiers. Missing values remain explicit.' },
  { icon: Workflow, title: 'Extension ready', text: 'Dedicated service and normalization layers prepare the UI for FastAPI and Earth Engine.' },
]

export default function About() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Research platform</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Sri Lanka Environmental Clustering and Monitoring System</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">A GIS interface for studying water, vegetation, land-cover, and elevation characteristics across Sri Lankan Divisional Secretariat Divisions. This release is the Phase 1 frontend skeleton; it does not generate or fabricate research results.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {cards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-50"><Icon className="size-5 text-emerald-700" /></span>
              <h2 className="mt-4 text-base font-bold text-slate-800">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
