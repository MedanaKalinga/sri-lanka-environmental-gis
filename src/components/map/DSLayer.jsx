import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import { CLUSTER_COLORS, formatIndicatorValue, getClusterDefinition, MISSING_DATA_COLOR } from '../../constants/dataConfig'
import { continuousColor } from '../../utils/colorScale'
import { getIndicatorValue } from '../../utils/dataNormalization'

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
})[character])

export default function DSLayer({
  data,
  selectedDsId,
  visualization,
  indicator,
  indicatorConfig,
  opacity,
  classification,
  onSelect,
  layerKey,
}) {
  const domain = useMemo(() => {
    if (visualization !== 'indicator') return null
    const values = data.features
      .map((feature) => getIndicatorValue(feature.properties.modelData, indicator))
      .filter(Number.isFinite)
    return values.length ? { min: Math.min(...values), max: Math.max(...values) } : null
  }, [data, indicator, visualization])

  const style = (feature) => {
    const selected = feature.properties.dsId === selectedDsId
    const modelData = feature.properties.modelData
    const hasModelData = Boolean(modelData)
    const clusterDefinition = getClusterDefinition(classification, modelData?.clusterId)
    const fillColor = visualization === 'indicator'
      ? continuousColor(getIndicatorValue(modelData, indicator), domain, indicatorConfig?.colors) || MISSING_DATA_COLOR
      : clusterDefinition?.color || CLUSTER_COLORS[modelData?.clusterId] || MISSING_DATA_COLOR

    return {
      color: selected ? '#0f172a' : '#334155',
      weight: selected ? 3.5 : 1.2,
      opacity: 1,
      fillColor,
      fillOpacity: hasModelData ? opacity : Math.min(opacity, 0.2),
    }
  }

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.dsName || feature.properties.dsId
    const district = feature.properties.district || 'District not available'
    const clusterId = feature.properties.modelData?.clusterId
    const cluster = getClusterDefinition(classification, clusterId)
    const clusterLine = cluster ? `<br><span>Cluster ${clusterId} · ${cluster.name}</span>` : ''
    const indicatorValue = getIndicatorValue(feature.properties.modelData, indicator)
    const indicatorLine = visualization === 'indicator'
      ? `<br><span>${escapeHtml(indicatorConfig?.label || 'Indicator')}: <strong>${escapeHtml(formatIndicatorValue(indicatorValue, indicatorConfig))}</strong></span>`
      : ''
    layer.bindTooltip(`<strong>${escapeHtml(name)}</strong><br><span>${escapeHtml(district)}</span>${clusterLine}${indicatorLine}`, { sticky: true, direction: 'top' })
    layer.on({
      click: () => onSelect(feature.properties.dsId),
      mouseover: () => {
        if (feature.properties.dsId !== selectedDsId) layer.setStyle({ weight: 2.4, color: '#047857' })
      },
      mouseout: () => {
        if (feature.properties.dsId !== selectedDsId) layer.setStyle(style(feature))
      },
    })
  }

  return <GeoJSON key={layerKey} data={data} style={style} onEachFeature={onEachFeature} />
}
