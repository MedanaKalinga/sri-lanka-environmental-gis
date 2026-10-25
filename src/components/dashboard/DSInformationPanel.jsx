import { ChevronRight, MapPin, X } from 'lucide-react'
import { formatIndicatorValue, getClusterDefinition, INDICATORS, MODEL_A_CLASSIFICATIONS } from '../../constants/dataConfig'

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Not available'
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return String(value)
}

function DataRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="max-w-[58%] text-right text-xs font-semibold text-slate-800">{formatValue(value)}</dd>
    </div>
  )
}

function ClassificationCard({ classificationKey, clusterId, active }) {
  const config = MODEL_A_CLASSIFICATIONS[classificationKey]
  const cluster = getClusterDefinition(classificationKey, clusterId)

  return (
    <div className={`rounded-xl border bg-white p-3 ${active ? 'shadow-sm ring-1 ring-slate-900/5' : ''}`} style={active && cluster ? { borderColor: cluster.color } : undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{config.shortLabel}</p>
          <p className="mt-1 text-xs font-bold leading-4 text-slate-800">
            {cluster ? `Cluster ${clusterId} · ${cluster.name}` : 'Not available'}
          </p>
        </div>
        {cluster && <span className="mt-0.5 size-3 shrink-0 rounded-full ring-2 ring-white shadow" style={{ background: cluster.color }} />}
      </div>
      {cluster && <p className="mt-1.5 text-[10px] text-slate-500">{cluster.count} DS Divisions nationally</p>}
      {cluster?.description && <p className="mt-2 text-[10px] leading-4 text-slate-600">{cluster.description}</p>}
      {active && <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700">Active map classification</p>}
    </div>
  )
}

export default function DSInformationPanel({ feature, modelLabel, classification, onClose, onCollapse }) {
  const properties = feature?.properties
  const data = properties?.modelData
  const activeConfig = MODEL_A_CLASSIFICATIONS[classification]
  const activeCluster = getClusterDefinition(classification, data?.clusterId)
  const environmentalRows = INDICATORS.map((indicator) => [
    indicator.label,
    formatIndicatorValue(data?.[indicator.key], indicator),
  ])

  return (
    <aside className="panel-scroll relative z-[500] h-full w-[330px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white shadow-xl shadow-slate-900/5 max-xl:absolute max-xl:right-0 max-xl:top-0 max-xl:z-[900] max-xl:max-w-[90vw]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-800">DS information</h2>
        </div>
        <div className="flex gap-1">
          {feature && <button type="button" className="icon-button" onClick={onClose} aria-label="Clear selected DS Division"><X className="size-4" /></button>}
          <button type="button" className="icon-button" onClick={onCollapse} aria-label="Collapse information panel"><ChevronRight className="size-4" /></button>
        </div>
      </div>

      {!feature ? (
        <div className="grid min-h-[260px] place-items-center p-8 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100"><MapPin className="size-5 text-slate-400" /></span>
            <h3 className="mt-4 text-sm font-bold text-slate-700">No DS Division selected</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">Choose a division from the filters or click a polygon on the map.</p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-800 p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">Selected division</p>
            <h3 className="mt-1 text-lg font-bold">{formatValue(properties.dsName)}</h3>
            <p className="mt-1 text-xs text-emerald-100/75">{formatValue(properties.district)} · {formatValue(properties.province)}</p>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="section-label">{modelLabel} results</p>
              {data?.clusterId ? <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-sm" style={{ background: activeCluster?.color || '#047857' }}>Cluster {data.clusterId}</span> : null}
            </div>

            {data && activeConfig && (
              <div className="mt-3 rounded-xl border-l-4 bg-slate-50 p-3" style={{ borderColor: activeCluster?.color || '#94a3b8' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">Active interpretation</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{activeCluster ? activeCluster.name : 'Cluster assignment not available'}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-600">{activeCluster?.description || activeConfig.description}</p>
              </div>
            )}

            {data && (data.clusterK4 || data.clusterK5) && (
              <div className="mt-5">
                <p className="section-label">Classification comparison</p>
                <div className="mt-2 space-y-2">
                  <ClassificationCard classificationKey="k4" clusterId={data.clusterK4} active={classification === 'k4'} />
                  <ClassificationCard classificationKey="k5" clusterId={data.clusterK5} active={classification === 'k5'} />
                </div>
              </div>
            )}

            <p className="section-label mt-5">Location details</p>
            <dl className="mt-2">
              <DataRow label="DS identifier" value={properties.dsId} />
              <DataRow label="DS name" value={properties.dsName} />
              <DataRow label="District" value={properties.district} />
              <DataRow label="Province" value={properties.province} />
            </dl>

            <p className="section-label mt-5">Environmental indicators</p>
            <dl className="mt-2">
              {environmentalRows.map(([label, value]) => <DataRow key={label} label={label} value={value} />)}
            </dl>
          </div>

          {!data && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-200">No matching cluster record was found for this DS identifier.</p>
          )}
        </div>
      )}
    </aside>
  )
}
