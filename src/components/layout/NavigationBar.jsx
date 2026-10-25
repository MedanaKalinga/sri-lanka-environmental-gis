import { BarChart3, Info, Layers3, Leaf, Menu, Satellite, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/clustering', label: 'Clustering Analysis', icon: Layers3 },
  { to: '/seasonal', label: 'Seasonal Analysis', icon: Leaf, future: true },
  { to: '/satellite', label: 'Satellite Explorer', icon: Satellite, future: true },
  { to: '/about', label: 'About', icon: Info },
]

export default function NavigationBar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-[1200] border-b border-emerald-950/20 bg-[#0b3b35] text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center gap-4 px-4 lg:px-6">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 ring-1 ring-emerald-300/25">
            <Leaf className="size-5 text-emerald-300" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold tracking-wide sm:text-base">Sri Lanka Environmental GIS</span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-emerald-200/70 sm:block">Clustering & monitoring system</span>
          </span>
        </NavLink>

        <nav className="ml-auto hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {links.map(({ to, label, future }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {label}
              {future && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-emerald-100">Soon</span>}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto grid size-10 place-items-center rounded-lg text-emerald-50 hover:bg-white/10 xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="absolute inset-x-0 top-16 border-t border-white/10 bg-[#0b3b35] p-3 shadow-xl xl:hidden" aria-label="Mobile navigation">
          {links.map(({ to, label, icon: Icon, future }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${isActive ? 'bg-emerald-300/15 text-emerald-100' : 'text-emerald-50/80'}`}
            >
              <Icon className="size-4" />
              <span>{label}</span>
              {future && <span className="ml-auto text-[10px] uppercase tracking-wider text-emerald-200/60">Future</span>}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
