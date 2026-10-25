import { ChevronLeft, ChevronRight, PanelLeftOpen, PanelRightOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DEFAULT_MODEL_A_CLASSIFICATION, getIndicatorDefinition, MODEL_A_CLASSIFICATIONS, MODEL_OPTIONS } from '../../constants/dataConfig'
import useEnvironmentalData from '../../hooks/useEnvironmentalData'
import { getAvailableIndicators, joinBoundariesWithModel } from '../../utils/dataNormalization'
import MapView from '../map/MapView'
import Sidebar from '../sidebar/Sidebar'
import DSInformationPanel from './DSInformationPanel'

const initialControls = {
  model: 'modelA',
  classification: DEFAULT_MODEL_A_CLASSIFICATION,
  province: '',
  district: '',
  selectedDsId: null,
  visualization: 'cluster',
  indicator: 'ndviMean',
  basemap: 'researchLight',
  basemapVisible: true,
  boundariesVisible: true,
  opacity: 0.72,
}

const EMPTY_MODEL_RECORDS = new Map()
const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })
const prefersCompactLayout = (query) => typeof window !== 'undefined' && window.matchMedia(query).matches

export default function AnalysisWorkspace({ title, description }) {
  const { loading, boundaries, models, errors } = useEnvironmentalData()
  const [controls, setControls] = useState(initialControls)
  const [leftOpen, setLeftOpen] = useState(() => !prefersCompactLayout('(max-width: 720px)'))
  const [rightOpen, setRightOpen] = useState(() => !prefersCompactLayout('(max-width: 1279px)'))
  const [viewVersion, setViewVersion] = useState(0)

  const modelRecords = models[controls.model]?.records || EMPTY_MODEL_RECORDS
  const classificationKey = controls.model === 'modelA' ? controls.classification : null
  const joined = useMemo(
    () => joinBoundariesWithModel(boundaries?.collection, modelRecords, classificationKey),
    [boundaries, classificationKey, modelRecords],
  )

  const provinces = useMemo(() => {
    const values = new Set((joined?.features || []).map((feature) => feature.properties.province).filter(Boolean))
    return [...values].sort(byName)
  }, [joined])

  const districts = useMemo(() => {
    const values = new Set((joined?.features || [])
      .filter((feature) => !controls.province || feature.properties.province === controls.province)
      .map((feature) => feature.properties.district)
      .filter(Boolean))
    return [...values].sort(byName)
  }, [controls.province, joined])

  const filteredData = useMemo(() => {
    if (!joined) return null
    return {
      ...joined,
      features: joined.features.filter((feature) => {
        const { province, district } = feature.properties
        return (!controls.province || province === controls.province)
          && (!controls.district || district === controls.district)
      }),
    }
  }, [controls.district, controls.province, joined])

  const divisions = useMemo(() => (filteredData?.features || [])
    .map((feature) => ({
      id: feature.properties.dsId,
      name: feature.properties.dsName || feature.properties.dsId,
    }))
    .sort((a, b) => byName(a.name, b.name)), [filteredData])

  const availableIndicators = useMemo(() => getAvailableIndicators(modelRecords), [modelRecords])
  const selectedFeature = joined?.features.find((feature) => feature.properties.dsId === controls.selectedDsId) || null
  const indicatorConfig = availableIndicators.find((item) => item.key === controls.indicator)
    || getIndicatorDefinition(controls.indicator)

  const changeControl = (key, value) => {
    setControls((current) => {
      if (key === 'province') return { ...current, province: value, district: '', selectedDsId: null }
      if (key === 'district') return { ...current, district: value, selectedDsId: null }
      if (key === 'model') return { ...current, model: value }
      if (key === 'classification') return { ...current, classification: value }
      return { ...current, [key]: value }
    })
  }

  const reset = () => {
    setControls(initialControls)
    setViewVersion((value) => value + 1)
  }

  const fitSriLanka = () => {
    setControls((current) => ({ ...current, province: '', district: '', selectedDsId: null }))
    setViewVersion((value) => value + 1)
  }

  const layoutToken = `${leftOpen}-${rightOpen}`
  const activeClassification = classificationKey ? MODEL_A_CLASSIFICATIONS[classificationKey] : null
  const modelLabel = activeClassification
    ? `${MODEL_OPTIONS[controls.model].label} · ${activeClassification.shortLabel}`
    : MODEL_OPTIONS[controls.model].label

  return (
    <section className="flex h-[calc(100vh-4rem)] min-h-[560px] min-w-0 flex-col">
      <div className="flex w-full min-w-0 shrink-0 items-center justify-between gap-4 overflow-hidden border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">{title}</h1>
          <p className="hidden text-xs text-slate-500 sm:block">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`status-dot hidden sm:inline-flex ${boundaries?.collection?.features.length ? 'status-ready' : 'status-waiting'}`}>
            {boundaries?.collection?.features.length ? 'Boundaries loaded' : 'Awaiting boundaries'}
          </span>
          <span className={`status-dot hidden sm:inline-flex ${models[controls.model] ? 'status-ready' : 'status-waiting'}`}>
            {models[controls.model] ? `${modelLabel} loaded` : `${modelLabel} awaiting data`}
          </span>
        </div>
      </div>

      <div className="relative flex w-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {leftOpen ? (
          <Sidebar
            state={controls}
            options={{ provinces, districts, divisions }}
            availability={{ modelA: Boolean(models.modelA), modelB: Boolean(models.modelB) }}
            availableIndicators={availableIndicators}
            onChange={changeControl}
            onReset={reset}
            onFitSriLanka={fitSriLanka}
            onCollapse={() => setLeftOpen(false)}
          />
        ) : (
          <button type="button" className="panel-open-button left-3" onClick={() => setLeftOpen(true)} aria-label="Open map controls">
            <PanelLeftOpen className="size-4" /> <span>Filters</span> <ChevronRight className="size-3.5" />
          </button>
        )}

        <MapView
          data={filteredData}
          loading={loading}
          boundaryError={errors.boundaries}
          modelError={errors[controls.model]}
          modelLabel={modelLabel}
          classification={classificationKey}
          selectedDsId={controls.selectedDsId}
          visualization={controls.visualization}
          indicator={controls.indicator}
          indicatorConfig={indicatorConfig}
          opacity={controls.opacity}
          basemap={controls.basemap}
          basemapVisible={controls.basemapVisible}
          boundariesVisible={controls.boundariesVisible}
          onSelect={(id) => changeControl('selectedDsId', id)}
          viewVersion={viewVersion}
          layoutToken={layoutToken}
        />

        {rightOpen ? (
          <DSInformationPanel
            feature={selectedFeature}
            modelLabel={modelLabel}
            classification={classificationKey}
            onClose={() => changeControl('selectedDsId', null)}
            onCollapse={() => setRightOpen(false)}
          />
        ) : (
          <button type="button" className="panel-open-button right-3" onClick={() => setRightOpen(true)} aria-label="Open DS information">
            <ChevronLeft className="size-3.5" /> <span>Details</span> <PanelRightOpen className="size-4" />
          </button>
        )}
      </div>
    </section>
  )
}
