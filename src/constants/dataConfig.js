export const DATA_PATHS = {
  boundaries: '/data/ds_boundaries.geojson',
  modelA: '/data/model_a_clusters.csv',
  modelB: '/data/model_b_clusters.csv',
}

export const FIELD_ALIASES = {
  boundary: {
    dsId: ['ds_id', 'dsid', 'ds_code', 'dscode', 'gnd_id', 'adm3_pcode', 'id'],
    dsName: ['ds_name', 'dsname', 'dSDivision', 'division_name', 'adm3_name', 'name'],
    district: ['district', 'district_name', 'dist_name', 'adm2_name'],
    province: ['province', 'province_name', 'prov_name', 'adm1_name'],
  },
  cluster: {
    dsId: ['ds_id', 'dsid', 'ds_code', 'dscode', 'adm3_pcode', 'id'],
    clusterId: ['cluster_id', 'clusterid', 'cluster', 'class'],
    clusterK4: ['k4', 'cluster_k4', 'clusterk4', 'k_4'],
    clusterK5: ['k5', 'cluster_k5', 'clusterk5', 'k_5'],
    ndviMean: ['ndvi_mean', 'mean_ndvi', 'ndvi'],
    ndviSd: ['ndvi_sd', 'ndvi_std', 'ndvi_standard_deviation', 'std_ndvi'],
    ndwiMean: ['ndwi_mean', 'mean_ndwi', 'ndwi'],
    mndwiMean: ['mndwi_mean', 'mean_mndwi', 'mndwi'],
    waterCandidatePct: [
      'both_index_water_candidate_pct',
      'both_water_indices_candidate_pct_validS2',
      'both_water_indices_candidate_pct',
      'water_candidate_pct',
    ],
    elevationMean: ['elevation_mean', 'mean_elevation', 'elevation', 'elev_mean'],
    slopeMean: ['slope_mean', 'mean_slope', 'average_slope', 'slope'],
    sourceMetadata: ['adm1_name', 'adm2_name', 'adm3_name', 'longitude', 'latitude'],
  },
}

export const MODEL_OPTIONS = {
  modelA: {
    label: 'Model A',
    description: 'Static K = 4 and K = 5 clustering',
  },
  modelB: {
    label: 'Model B',
    description: 'Temporal & seasonal clustering',
  },
}

export const INDICATORS = [
  {
    key: 'ndviMean',
    label: 'NDVI mean',
    precision: 3,
    colors: ['#f4e7b2', '#70b962', '#14532d'],
  },
  {
    key: 'ndviSd',
    label: 'NDVI SD',
    precision: 3,
    colors: ['#f1eef6', '#9e9ac8', '#54278f'],
  },
  {
    key: 'mndwiMean',
    label: 'MNDWI mean',
    precision: 3,
    colors: ['#a66a43', '#f4e6bd', '#1261a0'],
  },
  {
    key: 'waterCandidatePct',
    label: 'Water-candidate percentage',
    unit: '%',
    precision: 2,
    validRange: [0, 100],
    colors: ['#eff6ff', '#60a5fa', '#1e3a8a'],
  },
  {
    key: 'elevationMean',
    label: 'Elevation mean',
    precision: 1,
    colors: ['#e8f3d6', '#c69c5b', '#6a3d2f'],
  },
  {
    key: 'slopeMean',
    label: 'Average slope',
    unit: '°',
    precision: 2,
    colors: ['#fff7bc', '#f59e0b', '#b91c1c'],
  },
]

export function getIndicatorDefinition(indicatorKey) {
  return INDICATORS.find(({ key }) => key === indicatorKey) || null
}

export function formatIndicatorValue(value, indicator) {
  if (!Number.isFinite(value)) return 'Not available'
  const definition = typeof indicator === 'string' ? getIndicatorDefinition(indicator) : indicator
  const precision = definition?.precision ?? 3
  const formatted = value.toLocaleString(undefined, { maximumFractionDigits: precision })
  if (definition?.unit === '%' || definition?.unit === '°') return `${formatted}${definition.unit}`
  return definition?.unit ? `${formatted} ${definition.unit}` : formatted
}

export const CLUSTER_COLORS = {
  1: '#2563eb',
  2: '#0f9f8f',
  3: '#84cc16',
  4: '#f59e0b',
  5: '#ea580c',
  6: '#9333ea',
}

export const DEFAULT_MODEL_A_CLASSIFICATION = 'k5'

export const MODEL_A_CLASSIFICATIONS = {
  k4: {
    label: 'Mathematical classification',
    shortLabel: 'Mathematical · K = 4',
    selectorLabel: 'Mathematical',
    selectorHint: 'K = 4 · score-based',
    description: 'Broader four-cluster solution selected as the strongest mathematical and score-based result.',
    clusters: {
      1: { name: 'Water-Candidate-Rich Lowlands', count: 35, color: '#2878b5' },
      2: { name: 'Mixed-Vegetation Lowlands', count: 190, color: '#76a95a' },
      3: { name: 'High-Elevation Vegetated Highlands', count: 33, color: '#7e57a2' },
      4: { name: 'Densely Vegetated Sloping Regions', count: 81, color: '#176b45' },
    },
  },
  k5: {
    label: 'Environmental classification',
    shortLabel: 'Environmental · K = 5',
    selectorLabel: 'Environmental',
    selectorHint: 'K = 5 · real-world detail',
    description: 'More detailed five-cluster solution selected for real-world environmental interpretation.',
    clusters: {
      1: {
        name: 'Moderately Vegetated Lowlands',
        count: 133,
        color: '#5aae61',
        description: 'Moderate-high vegetation, low elevation, limited water candidates.',
      },
      2: {
        name: 'Water-Candidate-Rich Lowlands',
        count: 33,
        color: '#2878b5',
        description: 'Higher detected water-candidate percentage, moderate-low vegetation, low elevation.',
      },
      3: {
        name: 'Densely Vegetated Sloping Regions',
        count: 77,
        color: '#176b45',
        description: 'Very high vegetation, steeper terrain, very low water-candidate percentage.',
      },
      4: {
        name: 'Low-Vegetation Lowlands',
        count: 63,
        color: '#d6a735',
        description: 'Lower vegetation, low elevation, generally gentle slopes.',
      },
      5: {
        name: 'High-Elevation Vegetated Highlands',
        count: 33,
        color: '#7e57a2',
        description: 'High elevation, steep slopes, high vegetation.',
      },
    },
  },
}

export function getClusterDefinition(classificationKey, clusterId) {
  return MODEL_A_CLASSIFICATIONS[classificationKey]?.clusters?.[clusterId] || null
}

export const MISSING_DATA_COLOR = '#cbd5e1'
export const BASEMAPS = {
  researchLight: {
    label: 'Research light · English labels',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    referenceUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Sources: Esri, HERE, Garmin, OpenStreetMap contributors, and the GIS User Community',
    maxZoom: 16,
  },
  englishStreets: {
    label: 'English streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Sources: Esri, TomTom, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors, and the GIS User Community',
    maxZoom: 19,
  },
  localOpenStreetMap: {
    label: 'OpenStreetMap · local labels',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
}
export const SRI_LANKA_CENTER = [7.8731, 80.7718]
export const SRI_LANKA_ZOOM = 7
