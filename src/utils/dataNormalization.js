import { FIELD_ALIASES, INDICATORS } from '../constants/dataConfig'

const canonical = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '')

function buildKeyIndex(record) {
  return Object.keys(record || {}).reduce((index, key) => {
    index[canonical(key)] = key
    return index
  }, {})
}

function pick(record, aliases) {
  const index = buildKeyIndex(record)
  for (const alias of aliases) {
    const sourceKey = index[canonical(alias)]
    if (sourceKey !== undefined) {
      const value = record[sourceKey]
      if (value !== undefined && value !== null && String(value).trim() !== '') return value
    }
  }
  return null
}

const asText = (value) => (value === null || value === undefined ? null : String(value).trim() || null)

const asNumber = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const asCluster = (value, maximum) => {
  const parsed = asNumber(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= maximum ? parsed : null
}

export function normalizeBoundaryCollection(raw) {
  if (!raw || raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) {
    throw new Error('The boundary file must be a GeoJSON FeatureCollection.')
  }

  const warnings = []
  const seen = new Set()
  const features = []

  raw.features.forEach((feature, index) => {
    const geometryType = feature?.geometry?.type
    if (!['Polygon', 'MultiPolygon'].includes(geometryType)) {
      warnings.push(`Feature ${index + 1} was skipped because it is not a Polygon or MultiPolygon.`)
      return
    }

    const source = feature.properties || {}
    const dsId = asText(pick(source, FIELD_ALIASES.boundary.dsId))
    if (!dsId) {
      warnings.push(`Feature ${index + 1} was skipped because it has no DS identifier.`)
      return
    }
    if (seen.has(dsId)) {
      warnings.push(`Duplicate DS identifier "${dsId}" was skipped.`)
      return
    }
    seen.add(dsId)

    features.push({
      ...feature,
      properties: {
        ...source,
        dsId,
        dsName: asText(pick(source, FIELD_ALIASES.boundary.dsName)),
        district: asText(pick(source, FIELD_ALIASES.boundary.district)),
        province: asText(pick(source, FIELD_ALIASES.boundary.province)),
      },
    })
  })

  if (!features.length && raw.features.length) {
    throw new Error('No usable DS polygons were found. Check the configured identifier and geometry fields.')
  }

  return { collection: { type: 'FeatureCollection', features }, warnings }
}

export function normalizeClusterRows(rows) {
  const records = new Map()
  const warnings = []
  const knownAliases = new Set(
    Object.values(FIELD_ALIASES.cluster).flat().map(canonical),
  )

  rows.forEach((row, index) => {
    const dsId = asText(pick(row, FIELD_ALIASES.cluster.dsId))
    if (!dsId) {
      warnings.push(`CSV row ${index + 2} was skipped because it has no DS identifier.`)
      return
    }

    const clusterId = asCluster(pick(row, FIELD_ALIASES.cluster.clusterId), 6)
    const clusterK4 = asCluster(pick(row, FIELD_ALIASES.cluster.clusterK4), 4)
    const clusterK5 = asCluster(pick(row, FIELD_ALIASES.cluster.clusterK5), 5)
    const extraIndicators = {}

    Object.entries(row).forEach(([key, value]) => {
      if (knownAliases.has(canonical(key))) return
      const numericValue = asNumber(value)
      if (numericValue !== null) extraIndicators[key] = numericValue
    })

    records.set(dsId, {
      dsId,
      clusterId,
      clusterK4,
      clusterK5,
      ndviMean: asNumber(pick(row, FIELD_ALIASES.cluster.ndviMean)),
      ndviSd: asNumber(pick(row, FIELD_ALIASES.cluster.ndviSd)),
      ndwiMean: asNumber(pick(row, FIELD_ALIASES.cluster.ndwiMean)),
      mndwiMean: asNumber(pick(row, FIELD_ALIASES.cluster.mndwiMean)),
      waterCandidatePct: asNumber(pick(row, FIELD_ALIASES.cluster.waterCandidatePct)),
      elevationMean: asNumber(pick(row, FIELD_ALIASES.cluster.elevationMean)),
      slopeMean: asNumber(pick(row, FIELD_ALIASES.cluster.slopeMean)),
      extraIndicators,
    })
  })

  return { records, warnings }
}

export function joinBoundariesWithModel(collection, modelRecords, classificationKey = null) {
  if (!collection) return null
  return {
    ...collection,
    features: collection.features.map((feature) => {
      const record = modelRecords?.get(feature.properties.dsId) || null
      const activeClusterId = classificationKey === 'k4'
        ? record?.clusterK4
        : classificationKey === 'k5'
          ? record?.clusterK5
          : record?.clusterId

      return {
        ...feature,
        properties: {
          ...feature.properties,
          modelData: record ? { ...record, clusterId: activeClusterId ?? null, classificationKey } : null,
        },
      }
    }),
  }
}

export function getAvailableIndicators(modelRecords) {
  const available = INDICATORS.filter(({ key }) =>
    [...modelRecords.values()].some((record) => Number.isFinite(record[key])),
  )
  const extras = new Map()
  modelRecords.forEach((record) => {
    Object.keys(record.extraIndicators || {}).forEach((key) => extras.set(key, key.replace(/[_-]+/g, ' ')))
  })
  return [...available, ...[...extras].map(([key, label]) => ({ key: `extra:${key}`, label }))]
}

export function getIndicatorValue(modelData, indicatorKey) {
  if (!modelData || !indicatorKey) return null
  if (indicatorKey.startsWith('extra:')) return modelData.extraIndicators?.[indicatorKey.slice(6)] ?? null
  return modelData[indicatorKey] ?? null
}
