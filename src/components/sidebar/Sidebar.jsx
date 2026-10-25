import { ChevronLeft, Database, Eye, EyeOff, LocateFixed, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { BASEMAPS, INDICATORS, MODEL_A_CLASSIFICATIONS, MODEL_OPTIONS } from '../../constants/dataConfig'

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const Select = (props) => <select {...props} className="control-select" />

export default function Sidebar({
  state,
  options,
  availability,
  availableIndicators,
  onChange,
  onReset,
  onFitSriLanka,
  onCollapse,
}) {
  const indicators = availableIndicators.length ? availableIndicators : INDICATORS
  const hasIndicators = availableIndicators.length > 0

  return (
    <aside className="panel-scroll relative z-[500] h-full w-[310px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 max-lg:absolute max-lg:left-0 max-lg:top-0 max-lg:z-[900] max-lg:max-w-[88vw]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-emerald-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Map controls</h2>
            <p className="text-[11px] text-slate-500">Filter and visualize DS divisions</p>
          </div>
        </div>
        <button type="button" className="icon-button" onClick={onCollapse} aria-label="Collapse filter panel">
          <ChevronLeft className="size-4" />
        </button>
      </div>

      <div className="space-y-6 p-4">
        <section className="space-y-3">
          <div className="section-label"><Database className="size-3.5" /> Analysis model</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(MODEL_OPTIONS).map(([key, model]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange('model', key)}
                className={`rounded-xl border p-3 text-left transition ${state.model === key ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <span className="block text-xs font-bold text-slate-800">{model.label}</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500">{key === 'modelB' && !availability.modelB ? 'Awaiting temporal results' : model.description}</span>
              </button>
            ))}
          </div>
          {!availability[state.model] && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800 ring-1 ring-amber-200">
              No dataset is loaded for {MODEL_OPTIONS[state.model].label}. Add the matching CSV to enable results.
            </p>
          )}
          {state.model === 'modelA' && availability.modelA && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Classification approach</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MODEL_A_CLASSIFICATIONS).map(([key, classification]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange('classification', key)}
                    className={`rounded-xl border p-2.5 text-left transition ${state.classification === key ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <span className="block text-[11px] font-bold text-slate-800">{classification.selectorLabel}</span>
                    <span className="mt-1 block text-[9px] leading-3.5 text-slate-500">{classification.selectorHint}</span>
                  </button>
                ))}
              </div>
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] leading-4 text-slate-600">
                {MODEL_A_CLASSIFICATIONS[state.classification].description}
              </p>
            </div>
          )}
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-5">
          <div className="section-label">Location filters</div>
          <Field label="Province">
            <Select value={state.province} onChange={(event) => onChange('province', event.target.value)}>
              <option value="">All Sri Lanka</option>
              {options.provinces.map((value) => <option key={value}>{value}</option>)}
            </Select>
          </Field>
          <Field label="District">
            <Select value={state.district} onChange={(event) => onChange('district', event.target.value)}>
              <option value="">All districts</option>
              {options.districts.map((value) => <option key={value}>{value}</option>)}
            </Select>
          </Field>
          <Field label="DS Division">
            <Select value={state.selectedDsId || ''} onChange={(event) => onChange('selectedDsId', event.target.value || null)}>
              <option value="">Select a DS Division</option>
              {options.divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
          </Field>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-5">
          <div className="section-label">Visualization</div>
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button type="button" className={`segmented ${state.visualization === 'cluster' ? 'segmented-active' : ''}`} onClick={() => onChange('visualization', 'cluster')}>Clusters</button>
            <button type="button" disabled={!hasIndicators} className={`segmented disabled:cursor-not-allowed disabled:opacity-45 ${state.visualization === 'indicator' ? 'segmented-active' : ''}`} onClick={() => onChange('visualization', 'indicator')}>Indicator</button>
          </div>
          <Field label="Environmental indicator">
            <Select value={state.indicator} disabled={state.visualization !== 'indicator' || !hasIndicators} onChange={(event) => onChange('indicator', event.target.value)}>
              {indicators.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
            </Select>
          </Field>
          {hasIndicators ? (
            <p className="text-[10px] leading-4 text-slate-500">{availableIndicators.length} numeric indicator layers are available from the current dataset.</p>
          ) : (
            <p className="text-[10px] leading-4 text-slate-500">The current CSV contains cluster labels only. Numeric environmental indicators were not supplied.</p>
          )}
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-5">
          <div className="section-label">Map layers</div>
          <Field label="Basemap language & style">
            <Select value={state.basemap} disabled={!state.basemapVisible} onChange={(event) => onChange('basemap', event.target.value)}>
              {Object.entries(BASEMAPS).map(([key, basemap]) => <option key={key} value={key}>{basemap.label}</option>)}
            </Select>
          </Field>
          <button type="button" className="toggle-row" onClick={() => onChange('basemapVisible', !state.basemapVisible)}>
            <span>Basemap visibility</span>
            {state.basemapVisible ? <Eye className="size-4 text-emerald-700" /> : <EyeOff className="size-4 text-slate-400" />}
          </button>
          <button type="button" className="toggle-row" onClick={() => onChange('boundariesVisible', !state.boundariesVisible)}>
            <span>DS boundaries</span>
            {state.boundariesVisible ? <Eye className="size-4 text-emerald-700" /> : <EyeOff className="size-4 text-slate-400" />}
          </button>
          <Field label={`Polygon opacity · ${Math.round(state.opacity * 100)}%`}>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={state.opacity}
              onChange={(event) => onChange('opacity', Number(event.target.value))}
              className="w-full accent-emerald-700"
            />
          </Field>
        </section>

        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-5">
          <button type="button" className="secondary-button" onClick={onFitSriLanka}><LocateFixed className="size-4" /> Fit country</button>
          <button type="button" className="secondary-button" onClick={onReset}><RotateCcw className="size-4" /> Reset</button>
        </div>
      </div>
    </aside>
  )
}
