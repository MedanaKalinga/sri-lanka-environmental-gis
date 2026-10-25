import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

function parseDbf(buffer) {
  const recordCount = buffer.readUInt32LE(4)
  const headerLength = buffer.readUInt16LE(8)
  const recordLength = buffer.readUInt16LE(10)
  const fields = []

  for (let offset = 32; offset < headerLength - 1 && buffer[offset] !== 0x0d; offset += 32) {
    const end = buffer.indexOf(0, offset)
    fields.push({
      name: buffer.toString('ascii', offset, end > offset && end < offset + 11 ? end : offset + 11).trim(),
      type: String.fromCharCode(buffer[offset + 11]),
      length: buffer[offset + 16],
    })
  }

  const records = []
  for (let row = 0; row < recordCount; row += 1) {
    let cursor = headerLength + row * recordLength
    const deleted = buffer[cursor] === 0x2a
    cursor += 1
    const record = {}

    for (const field of fields) {
      const raw = buffer.toString('utf8', cursor, cursor + field.length).trim()
      cursor += field.length
      if (field.type === 'N' || field.type === 'F') {
        const value = Number(raw)
        record[field.name] = raw && Number.isFinite(value) ? value : null
      } else if (field.type === 'L') {
        record[field.name] = /^[YyTt]$/.test(raw) ? true : /^[NnFf]$/.test(raw) ? false : null
      } else {
        record[field.name] = raw || null
      }
    }

    records.push(deleted ? null : record)
  }

  return records
}

function signedArea(ring) {
  let area = 0
  for (let index = 0; index < ring.length - 1; index += 1) {
    area += ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1]
  }
  return area / 2
}

function pointInRing(point, ring) {
  let inside = false
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const [x1, y1] = ring[current]
    const [x2, y2] = ring[previous]
    const intersects = (y1 > point[1]) !== (y2 > point[1])
      && point[0] < ((x2 - x1) * (point[1] - y1)) / (y2 - y1) + x1
    if (intersects) inside = !inside
  }
  return inside
}

function orient(ring, counterClockwise) {
  const isCounterClockwise = signedArea(ring) > 0
  return isCounterClockwise === counterClockwise ? ring : [...ring].reverse()
}

function partsToGeometry(parts) {
  const rings = parts
    .filter((ring) => ring.length >= 4)
    .map((ring) => ({ ring, area: Math.abs(signedArea(ring)), parent: null, depth: 0 }))

  for (let index = 0; index < rings.length; index += 1) {
    let parent = null
    for (let candidate = 0; candidate < rings.length; candidate += 1) {
      if (candidate === index || rings[candidate].area <= rings[index].area) continue
      if (!pointInRing(rings[index].ring[0], rings[candidate].ring)) continue
      if (parent === null || rings[candidate].area < rings[parent].area) parent = candidate
    }
    rings[index].parent = parent
  }

  const depthOf = (index) => {
    if (rings[index].parent === null) return 0
    return depthOf(rings[index].parent) + 1
  }
  rings.forEach((item, index) => { item.depth = depthOf(index) })

  const polygons = []
  rings.forEach((item, index) => {
    if (item.depth % 2 !== 0) return
    const holes = rings
      .filter((candidate) => candidate.parent === index && candidate.depth % 2 === 1)
      .map((candidate) => orient(candidate.ring, false))
    polygons.push([orient(item.ring, true), ...holes])
  })

  if (polygons.length === 1) return { type: 'Polygon', coordinates: polygons[0] }
  return { type: 'MultiPolygon', coordinates: polygons }
}

function parseShp(buffer) {
  const fileType = buffer.readInt32LE(32)
  if (fileType !== 5) throw new Error(`Expected Polygon shapefile type 5, received ${fileType}.`)

  const geometries = []
  let offset = 100
  while (offset + 8 <= buffer.length) {
    const contentLength = buffer.readInt32BE(offset + 4) * 2
    const contentStart = offset + 8
    const shapeType = buffer.readInt32LE(contentStart)

    if (shapeType === 0) {
      geometries.push(null)
    } else {
      if (shapeType !== 5) throw new Error(`Unsupported record shape type ${shapeType}.`)
      const partCount = buffer.readInt32LE(contentStart + 36)
      const pointCount = buffer.readInt32LE(contentStart + 40)
      const partStart = contentStart + 44
      const pointStart = partStart + partCount * 4
      const partIndexes = Array.from({ length: partCount }, (_, index) => buffer.readInt32LE(partStart + index * 4))
      const points = Array.from({ length: pointCount }, (_, index) => {
        const pointOffset = pointStart + index * 16
        return [
          Number(buffer.readDoubleLE(pointOffset).toFixed(6)),
          Number(buffer.readDoubleLE(pointOffset + 8).toFixed(6)),
        ]
      })
      const parts = partIndexes.map((start, index) => {
        const end = partIndexes[index + 1] ?? points.length
        const ring = points.slice(start, end)
        const first = ring[0]
        const last = ring[ring.length - 1]
        if (first && last && (first[0] !== last[0] || first[1] !== last[1])) ring.push([...first])
        return ring
      })
      geometries.push(partsToGeometry(parts))
    }

    offset = contentStart + contentLength
  }
  return geometries
}

async function main() {
  const [shpPath, dbfPath, outputPath] = process.argv.slice(2)
  if (!shpPath || !dbfPath || !outputPath) {
    throw new Error('Usage: node scripts/convert-shapefile.mjs input.shp input.dbf output.geojson')
  }

  const [shp, dbf] = await Promise.all([readFile(shpPath), readFile(dbfPath)])
  const geometries = parseShp(shp)
  const records = parseDbf(dbf)
  if (geometries.length !== records.length) {
    throw new Error(`Geometry/attribute count mismatch: ${geometries.length} shapes and ${records.length} records.`)
  }

  const features = geometries.flatMap((geometry, index) => {
    if (!geometry || !records[index]) return []
    return [{ type: 'Feature', properties: records[index], geometry }]
  })
  const collection = {
    type: 'FeatureCollection',
    name: path.basename(shpPath, path.extname(shpPath)),
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features,
  }
  await writeFile(outputPath, JSON.stringify(collection))
  process.stdout.write(`Converted ${features.length} polygon features to ${outputPath}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
