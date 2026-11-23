import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request, { params }) {
  const layer = params.layer
  const validLayers = {
    taluks: 'administrative_boundaries.geojson',
    geology: 'geological_formations.geojson',
    lineaments: 'structural_lineaments.geojson',
    drainage: 'drainage_network.geojson',
    monitoring_wells: 'cgwb_monitoring_wells.geojson',
    historical_wells: 'historical_borewell_observations.geojson'
  }

  const filename = validLayers[layer]
  if (!filename) {
    return NextResponse.json({ error: `Layer ${layer} not found` }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), 'public', 'data', filename)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const json = JSON.parse(raw)
    return NextResponse.json({
      type: "FeatureCollection",
      metadata: {
        layer,
        source: "Government of Karnataka / CGWB / GSI",
        crs: "EPSG:4326"
      },
      features: json.features
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to read layer file", detail: err.message }, { status: 500 })
  }
}
