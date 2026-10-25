import L from 'leaflet'
import { LoaderCircle, Map, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { BASEMAPS, SRI_LANKA_CENTER, SRI_LANKA_ZOOM } from '../../constants/dataConfig'
import { getIndicatorValue } from '../../utils/dataNormalization'
import ClusterLegend from './ClusterLegend'
import DSLayer from './DSLayer'

function MapViewport({ data, selectedDsId, viewVersion, layoutToken }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 180)
    return () => window.clearTimeout(timer)
  }, [layoutToken, map])

  useEffect(() => {
    if (selectedDsId && data?.features?.length) {
      const selected = data.features.find((feature) => feature.properties.dsId === selectedDsId)
      if (selected) {
        const bounds = L.geoJSON(selected).getBounds()
        if (bounds.isValid()) map.flyToBounds(bounds, { padding: [42, 42], maxZoom: 12, duration: 0.55 })
        return
      }
    }

    if (data?.features?.length) {
      const bounds = L.geoJSON(data).getBounds()
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 })
    } else {
      map.setView(SRI_LANKA_CENTER, SRI_LANKA_ZOOM)
    }
  }, [data, map, selectedDsId, viewVersion])

  return null
}

export default function MapView({
  data,
  loading,
  boundaryError,
  modelError,
  modelLabel,
  classification,
  selectedDsId,
  visualization,
  indicator,
  indicatorConfig,
  opacity,
  basemap,
  basemapVisible,
  boundariesVisible,
  onSelect,
  viewVersion,
  layoutToken,
}) {
  const domain = useMemo(() => {
    if (!data || visualization !== 'indicator') return null
    const values = data.features.map((feature) => getIndicatorValue(feature.properties.modelData, indicator)).filter(Number.isFinite)
    return values.length ? { min: Math.min(...values), max: Math.max(...values) } : null
  }, [data, indicator, visualization])

  const mappedCount = data?.features.filter((feature) => feature.properties.modelData).length || 0
  const basemapConfig = BASEMAPS[basemap] || BASEMAPS.researchLight
  const featureIdentity = data?.features.map((feature) => feature.properties.dsId).join(',') || 'empty'
  const layerKey = [selectedDsId, visualization, indicator, opacity, modelLabel, classification, featureIdentity].join('|')

  return (
    <div className="relative h-full min-h-[420px] min-w-0 flex-1 overflow-hidden bg-[#dfeae7]">
      <MapContainer center={SRI_LANKA_CENTER} zoom={SRI_LANKA_ZOOM} className="h-full w-full" zoomControl preferCanvas>
        {basemapVisible && (
          <TileLayer
            key={basemap}
            attribution={basemapConfig.attribution}
            url={basemapConfig.url}
            maxZoom={basemapConfig.maxZoom}
          />
        )}
        {boundariesVisible && data?.features?.length > 0 && (
          <DSLayer
            data={data}
            selectedDsId={selectedDsId}
            visualization={visualization}
            indicator={indicator}
            indicatorConfig={indicatorConfig}
            opacity={opacity}
            classification={classification}
            onSelect={onSelect}
            layerKey={layerKey}
          />
        )}
        {basemapVisible && basemapConfig.referenceUrl && (
          <TileLayer
            key={`${basemap}-reference`}
            attribution={basemapConfig.attribution}
            url={basemapConfig.referenceUrl}
            maxZoom={basemapConfig.maxZoom}
            pane="overlayPane"
          />
        )}
        <MapViewport data={data} selectedDsId={selectedDsId} viewVersion={viewVersion} layoutToken={layoutToken} />
      </MapContainer>

      <div className="absolute bottom-7 left-3 z-[500] rounded-lg bg-slate-950/75 px-2.5 py-1.5 text-[10px] font-medium text-white shadow backdrop-blur">
        {data?.features.length || 0} polygons · {mappedCount} matched to {modelLabel}
      </div>
      <ClusterLegend mode={visualization} indicatorConfig={indicatorConfig} domain={domain} classification={classification} />

      {loading && (
        <div className="map-message"><LoaderCircle className="size-6 animate-spin text-emerald-700" /><p className="font-semibold">Loading local datasets…</p></div>
      )}

      {!loading && !data?.features?.length && (
        <div className="map-data-notice">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50"><Map className="size-4.5 text-emerald-700" /></span>
          <div className="min-w-0">
            <p className="font-bold text-slate-800">Basemap ready · DS boundaries not loaded</p>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-600">Provide the real Sri Lanka DS boundary file before cluster results. Expected: <code>public/data/ds_boundaries.geojson</code>.</p>
            {boundaryError && <p className="mt-1.5 text-[10px] text-amber-800"><TriangleAlert className="mr-1 inline size-3" />{boundaryError}</p>}
          </div>
        </div>
      )}

      {!loading && data?.features?.length > 0 && modelError && (
        <div className="absolute left-1/2 top-3 z-[500] flex max-w-[88%] -translate-x-1/2 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900 shadow-lg ring-1 ring-amber-200">
          <TriangleAlert className="size-4 shrink-0" /> {modelError}
        </div>
      )}
    </div>
  )
}
