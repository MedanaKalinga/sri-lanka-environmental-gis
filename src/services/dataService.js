import Papa from 'papaparse'
import { DATA_PATHS } from '../constants/dataConfig'
import { normalizeBoundaryCollection, normalizeClusterRows } from '../utils/dataNormalization'

async function fetchFile(path) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) throw new Error(`${path} was not found (HTTP ${response.status}).`)
  const text = await response.text()
  if (!text.trim() || /^\s*<!doctype html/i.test(text)) {
    throw new Error(`${path} is missing or does not contain the expected dataset.`)
  }
  return text
}

export async function loadBoundaries() {
  const text = await fetchFile(DATA_PATHS.boundaries)
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`${DATA_PATHS.boundaries} is not valid JSON.`)
  }
  return normalizeBoundaryCollection(json)
}

export async function loadModelData(path) {
  const text = await fetchFile(path)
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy', transformHeader: (header) => header.trim() })
  if (parsed.errors.length) {
    throw new Error(`${path} could not be parsed: ${parsed.errors[0].message}`)
  }
  if (!parsed.data.length) throw new Error(`${path} contains no data rows.`)
  return normalizeClusterRows(parsed.data)
}

export async function loadAllEnvironmentalData() {
  const [boundaries, modelA, modelB] = await Promise.allSettled([
    loadBoundaries(),
    loadModelData(DATA_PATHS.modelA),
    loadModelData(DATA_PATHS.modelB),
  ])

  return {
    boundaries: boundaries.status === 'fulfilled' ? boundaries.value : null,
    models: {
      modelA: modelA.status === 'fulfilled' ? modelA.value : null,
      modelB: modelB.status === 'fulfilled' ? modelB.value : null,
    },
    errors: {
      boundaries: boundaries.status === 'rejected' ? boundaries.reason.message : null,
      modelA: modelA.status === 'rejected' ? modelA.reason.message : null,
      modelB: modelB.status === 'rejected' ? modelB.reason.message : null,
    },
  }
}
