import { CLUSTER_COLORS, formatIndicatorValue, MISSING_DATA_COLOR, MODEL_A_CLASSIFICATIONS } from '../../constants/dataConfig'
import { gradientStyle } from '../../utils/colorScale'

export default function ClusterLegend({ mode, indicatorConfig, domain, classification }) {
  if (mode === 'indicator') {
    const hasRange = domain && Number.isFinite(domain.min) && Number.isFinite(domain.max)
    const validRange = indicatorConfig?.validRange
    return (
      <div className="map-legend">
        <p className="legend-title">{indicatorConfig?.label || 'Indicator value'}</p>
        {hasRange ? (
          <>
            <div className="mt-2 h-2.5 rounded-full" style={gradientStyle(indicatorConfig?.colors)} />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-600">
              <span>{formatIndicatorValue(domain.min, indicatorConfig)}</span>
              <span>{formatIndicatorValue(domain.max, indicatorConfig)}</span>
            </div>
            <p className="mt-1 text-[9px] leading-3.5 text-slate-500">Colors use the filtered observed range.</p>
            {validRange && (
              <p className="text-[9px] leading-3.5 text-slate-500">
                Valid range: {formatIndicatorValue(validRange[0], indicatorConfig)}–{formatIndicatorValue(validRange[1], indicatorConfig)}
              </p>
            )}
          </>
        ) : <p className="mt-2 text-[11px] text-slate-500">No numeric values available</p>}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500"><span className="size-2.5 rounded-sm" style={{ background: MISSING_DATA_COLOR }} /> Missing</div>
      </div>
    )
  }

  const classificationConfig = MODEL_A_CLASSIFICATIONS[classification]

  if (classificationConfig) {
    return (
      <div className="map-legend map-cluster-legend">
        <p className="legend-title">{classificationConfig.shortLabel}</p>
        <p className="mt-1 text-[9px] leading-3.5 text-slate-500">All-island cluster totals</p>
        <div className="mt-2.5 space-y-2">
          {Object.entries(classificationConfig.clusters).map(([id, cluster]) => (
            <div key={id} className="flex items-start gap-2 text-slate-700">
              <span className="mt-0.5 size-3 shrink-0 rounded-sm ring-1 ring-black/10" style={{ background: cluster.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold leading-3.5">Cluster {id} · {cluster.name}</p>
                <p className="text-[9px] text-slate-500">{cluster.count} DS Divisions</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-0.5 text-[9px] text-slate-500">
            <span className="size-3 rounded-sm ring-1 ring-black/10" style={{ background: MISSING_DATA_COLOR }} /> Missing assignment
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="map-legend">
      <p className="legend-title">Environmental clusters</p>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {Object.entries(CLUSTER_COLORS).map(([id, color]) => (
          <div key={id} className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
            <span className="size-2.5 rounded-sm" style={{ background: color }} /> Cluster {id}
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-2 text-[10px] text-slate-500">
          <span className="size-2.5 rounded-sm" style={{ background: MISSING_DATA_COLOR }} /> Missing assignment
        </div>
      </div>
    </div>
  )
}
