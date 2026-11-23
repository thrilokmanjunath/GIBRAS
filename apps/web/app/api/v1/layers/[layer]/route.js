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

  // Attempt reading from potential paths
  const candidatePaths = [
    path.join(process.cwd(), 'public', 'data', filename),
    path.join(process.cwd(), 'apps', 'web', 'public', 'data', filename),
    path.join(process.cwd(), 'data', 'curated', filename)
  ]

  for (const fp of candidatePaths) {
    try {
      if (fs.existsSync(fp)) {
        const raw = fs.readFileSync(fp, 'utf-8')
        const json = JSON.parse(raw)
        return NextResponse.json({
          type: "FeatureCollection",
          metadata: {
            layer,
            source: "Survey of India / KSRSAC / CGWB / GSI",
            crs: "EPSG:4326"
          },
          features: json.features
        }, {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
          }
        })
      }
    } catch (e) {
      // Continue to next path
    }
  }

  // Fallback redirect to static public asset
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/data/${filename}`)
}
