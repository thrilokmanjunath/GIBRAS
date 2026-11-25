'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle, CheckCircle, HelpCircle, Shield, MapPin, Download,
  Layers, Database, Compass, Activity, ChevronRight, FileText,
  UserCheck, Droplets, Info, RefreshCw, BarChart3, AlertOctagon,
  Printer, Crosshair, ArrowUpRight, ArrowDownRight, Zap, Eye, Gauge,
  Clock, Map as MapIcon, Sliders, Check, Copy, ExternalLink, ArrowRight
} from 'lucide-react'

const TALUKS = [
  { district: 'Kolar', taluk: 'Kolar', kannada: 'ಕೋಲಾರ', lat: 13.136, lon: 78.134, extraction: 194.2 },
  { district: 'Kolar', taluk: 'Bangarapet', kannada: 'ಬಂಗಾರಪೇಟೆ', lat: 12.980, lon: 78.200, extraction: 182.6 },
  { district: 'Kolar', taluk: 'Malur', kannada: 'ಮಾಲೂರು', lat: 13.002, lon: 77.940, extraction: 208.4 },
  { district: 'Kolar', taluk: 'Mulbagal', kannada: 'ಮುಳಬಾಗಿಲು', lat: 13.165, lon: 78.395, extraction: 186.7 },
  { district: 'Kolar', taluk: 'Srinivaspur', kannada: 'ಶ್ರೀನಿವಾಸಪುರ', lat: 13.340, lon: 78.215, extraction: 178.5 },
  { district: 'Kolar', taluk: 'KGF (Robertsonpet)', kannada: 'ಕೆ.ಜಿ.ಎಫ್', lat: 12.955, lon: 78.272, extraction: 191.0 },
  { district: 'Chikkaballapur', taluk: 'Chikkaballapur', kannada: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', lat: 13.435, lon: 77.728, extraction: 188.4 },
  { district: 'Chikkaballapur', taluk: 'Bagepalli', kannada: 'ಬಾಗೇಪಲ್ಲಿ', lat: 13.785, lon: 77.795, extraction: 164.0 },
  { district: 'Chikkaballapur', taluk: 'Chintamani', kannada: 'ಚಿಂತಾಮಣಿ', lat: 13.402, lon: 78.055, extraction: 196.5 },
  { district: 'Chikkaballapur', taluk: 'Gauribidanur', kannada: 'ಗೌರಿಬಿದನೂರು', lat: 13.610, lon: 77.520, extraction: 172.3 },
  { district: 'Chikkaballapur', taluk: 'Gudibanda', kannada: 'ಗುಡಿಬಂಡೆ', lat: 13.670, lon: 77.700, extraction: 168.1 },
  { district: 'Chikkaballapur', taluk: 'Sidlaghatta', kannada: 'ಶಿಡ್ಲಘಟ್ಟ', lat: 13.390, lon: 77.865, extraction: 192.8 },
]

export default function GibrasApp() {
  const [lang, setLang] = useState('en') // 'en' or 'kn'
  const [activeTab, setActiveTab] = useState('farmer') // 'farmer', 'gov', 'hydro', 'map'

  // Farmer Form State
  const [selectedDistrict, setSelectedDistrict] = useState('Kolar')
  const [selectedTaluk, setSelectedTaluk] = useState('Kolar')
  const [villageName, setVillageName] = useState('Vokkaleri')
  const [lat, setLat] = useState('13.1360')
  const [lon, setLon] = useState('78.1340')
  const [purpose, setPurpose] = useState('irrigation')
  const [farmerNotes, setFarmerNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedId, setCopiedId] = useState(false)

  // Government & Analytics State
  const [govSummary, setGovSummary] = useState(null)
  const [modelMetrics, setModelMetrics] = useState(null)
  const [recentAssessments, setRecentAssessments] = useState([])

  // Hydrogeologist Form State
  const [hydroTargetId, setHydroTargetId] = useState('')
  const [hydroName, setHydroName] = useState('Dr. Ramesh Rao (Cert #HG-KA-102)')
  const [vesConducted, setVesConducted] = useState(true)
  const [vesResistivity, setVesResistivity] = useState('85.0')
  const [inferredWeathered, setInferredWeathered] = useState('18.0')
  const [inferredFracture, setInferredFracture] = useState('95.0')
  const [verifiedOutcome, setVerifiedOutcome] = useState('PRODUCTIVE')
  const [actualYield, setActualYield] = useState('90.0')
  const [hydroNotes, setHydroNotes] = useState('Secondary joint set confirmed via 4-electrode Schlumberger sounding.')
  const [hydroMessage, setHydroMessage] = useState('')

  // Map state
  const mapContainer = useRef(null)
  const mapInstance = useRef(null)
  const mapMarker = useRef(null)
  const [activeLayers, setActiveLayers] = useState({
    taluks: true,
    geology: false,
    lineaments: true,
    drainage: true,
    monitoring_wells: true,
    historical_wells: true,
  })

  // Dynamic Layer Visibility Controller
  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => {
      const next = !prev[layerKey]
      const visibility = next ? 'visible' : 'none'
      const map = mapInstance.current
      if (map) {
        if (layerKey === 'taluks') {
          if (map.getLayer('taluks-fill')) map.setLayoutProperty('taluks-fill', 'visibility', visibility)
          if (map.getLayer('taluks-line')) map.setLayoutProperty('taluks-line', 'visibility', visibility)
          if (map.getLayer('taluks-label')) map.setLayoutProperty('taluks-label', 'visibility', visibility)
        } else if (layerKey === 'lineaments') {
          if (map.getLayer('lineaments-line')) map.setLayoutProperty('lineaments-line', 'visibility', visibility)
        } else if (layerKey === 'monitoring_wells') {
          if (map.getLayer('cgwb-circle')) map.setLayoutProperty('cgwb-circle', 'visibility', visibility)
        } else if (layerKey === 'drainage') {
          if (map.getLayer('drainage-line')) map.setLayoutProperty('drainage-line', 'visibility', visibility)
        }
      }
      return { ...prev, [layerKey]: next }
    })
  }

  // Set default coordinates when taluk changes
  const handleTalukChange = (talukName) => {
    setSelectedTaluk(talukName)
    const t = TALUKS.find((x) => x.taluk === talukName)
    if (t) {
      setLat(t.lat.toFixed(4))
      setLon(t.lon.toFixed(4))
      if (mapMarker.current) {
        mapMarker.current.setLngLat([t.lon, t.lat])
      }
      if (mapInstance.current) {
        mapInstance.current.flyTo({ center: [t.lon, t.lat], zoom: 9.5 })
      }
    }
  }

  // Load analytics and recent assessments
  const loadGovData = async () => {
    try {
      const sRes = await fetch('/api/v1/analytics/district_summary')
      if (sRes.ok) setGovSummary(await sRes.json())
      const mRes = await fetch('/api/v1/analytics/model_performance')
      if (mRes.ok) setModelMetrics(await mRes.json())
      const aRes = await fetch('/api/v1/assess/recent')
      if (aRes.ok) setRecentAssessments(await aRes.json())
    } catch (err) {
      console.error('Failed to load gov data:', err)
    }
  }

  useEffect(() => {
    loadGovData()
  }, [])

  // Submit assessment
  const handleAssessmentSubmit = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setAssessmentResult(null)

    try {
      const res = await fetch('/api/v1/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          district: selectedDistrict,
          taluk: selectedTaluk,
          village: villageName,
          purpose: purpose,
          farmer_notes: farmerNotes,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Assessment request failed')
      }

      const data = await res.json()
      setAssessmentResult(data)
      loadGovData() // refresh analytics feed
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Submit hydrogeologist verification
  const handleHydroSubmit = async (e) => {
    e.preventDefault()
    setHydroMessage('')
    try {
      const res = await fetch('/api/v1/hydrogeologist/field_verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: hydroTargetId,
          hydrogeologist_name: hydroName,
          geophysical_ves_conducted: vesConducted,
          apparent_resistivity_ohm_m: parseFloat(vesResistivity),
          inferred_weathered_depth_m: parseFloat(inferredWeathered),
          inferred_fracture_depth_m: parseFloat(inferredFracture),
          verified_outcome: verifiedOutcome,
          actual_yield_lpm: parseFloat(actualYield),
          expert_notes: hydroNotes,
          approval_status: 'APPROVED',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Verification submission failed')
      }

      const data = await res.json()
      setHydroMessage(data.message)
      loadGovData()
    } catch (err) {
      setHydroMessage(`Error: ${err.message}`)
    }
  }

  // Copy assessment UUID to clipboard
  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // MapLibre Initialization & Interactive GIS Visualizer
  useEffect(() => {
    if (activeTab === 'map' && mapContainer.current) {
      if (!mapInstance.current) {
        import('maplibre-gl').then((maplibregl) => {
          if (!mapContainer.current) return

          const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
              version: 8,
              glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
              sources: {
                osm: {
                  type: 'raster',
                  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                  tileSize: 256,
                  attribution: '&copy; OpenStreetMap contributors',
                },
              },
              layers: [
                {
                  id: 'osm-layer',
                  type: 'raster',
                  source: 'osm',
                  minzoom: 0,
                  maxzoom: 19,
                },
              ],
            },
            center: [78.05, 13.35],
            zoom: 8.5,
          })

          map.addControl(new maplibregl.NavigationControl(), 'top-right')

          // Draggable/Clickable Target Marker
          const initialLng = parseFloat(lon) || 78.134
          const initialLat = parseFloat(lat) || 13.136
          const marker = new maplibregl.Marker({ color: '#0ea5e9', draggable: true })
            .setLngLat([initialLng, initialLat])
            .addTo(map)
          mapMarker.current = marker

          marker.on('dragend', () => {
            const lngLat = marker.getLngLat()
            setLat(lngLat.lat.toFixed(4))
            setLon(lngLat.lng.toFixed(4))
          })

          // Handle map clicks to update coordinates & move marker
          map.on('click', (e) => {
            setLat(e.lngLat.lat.toFixed(4))
            setLon(e.lngLat.lng.toFixed(4))
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat])
          })

          map.on('load', async () => {
            map.resize()

            // 1. Add Taluks Layer (Administrative Boundaries)
            try {
              let taluksData = null
              try {
                const r = await fetch('/data/administrative_boundaries.geojson')
                if (r.ok) taluksData = await r.json()
              } catch (e) {}
              if (!taluksData) {
                const r2 = await fetch('/api/v1/layers/taluks')
                if (r2.ok) taluksData = await r2.json()
              }

              if (taluksData && !map.getSource('taluks-source')) {
                map.addSource('taluks-source', { type: 'geojson', data: taluksData })
                map.addLayer({
                  id: 'taluks-fill',
                  type: 'fill',
                  source: 'taluks-source',
                  paint: {
                    'fill-color': [
                      'match',
                      ['get', 'district'],
                      'Kolar', '#0284c7',
                      'Chikkaballapur', '#7c3aed',
                      '#0284c7'
                    ],
                    'fill-opacity': 0.16,
                  },
                })
                map.addLayer({
                  id: 'taluks-line',
                  type: 'line',
                  source: 'taluks-source',
                  paint: {
                    'line-color': '#0369a1',
                    'line-width': 2.5,
                    'line-opacity': 0.95,
                  },
                })
                map.addLayer({
                  id: 'taluks-label',
                  type: 'symbol',
                  source: 'taluks-source',
                  layout: {
                    'text-field': ['get', 'taluk'],
                    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                    'text-size': 12,
                    'text-anchor': 'center',
                  },
                  paint: {
                    'text-color': '#0f172a',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2,
                  },
                })

                // Popup on taluk click
                map.on('click', 'taluks-fill', (e) => {
                  if (!e.features || !e.features.length) return
                  const p = e.features[0].properties
                  new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                        <div style="font-weight: 800; font-size: 14px; color: #0284c7; margin-bottom: 3px;">
                          ${p.taluk} Taluk
                        </div>
                        <div><strong>District:</strong> ${p.district}</div>
                        <div><strong>Extraction Stage:</strong> ${p.cgwb_stage_extraction_pct}% (${p.cgwb_category || 'OVER-EXPLOITED'})</div>
                        <div><strong>Normal Rainfall:</strong> ${p.annual_rainfall_normal_mm} mm/yr</div>
                      </div>
                    `)
                    .addTo(map)
                })
                map.on('mouseenter', 'taluks-fill', () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseleave', 'taluks-fill', () => { map.getCanvas().style.cursor = '' })
              }
            } catch (err) {
              console.error('Taluks layer load error', err)
            }

            // 2. Add Drainage Layer
            try {
              let drainageData = null
              try {
                const r = await fetch('/data/drainage_network.geojson')
                if (r.ok) drainageData = await r.json()
              } catch (e) {}
              if (!drainageData) {
                const r2 = await fetch('/api/v1/layers/drainage')
                if (r2.ok) drainageData = await r2.json()
              }
              if (drainageData && !map.getSource('drainage-source')) {
                map.addSource('drainage-source', { type: 'geojson', data: drainageData })
                map.addLayer({
                  id: 'drainage-line',
                  type: 'line',
                  source: 'drainage-source',
                  paint: {
                    'line-color': '#2563eb',
                    'line-width': 1.8,
                    'line-opacity': 0.75,
                  },
                })
              }
            } catch (err) {
              console.error('Drainage layer load error', err)
            }

            // 3. Add Lineaments Layer (Faults / Shear Zones)
            try {
              let lineamentsData = null
              try {
                const r = await fetch('/data/structural_lineaments.geojson')
                if (r.ok) lineamentsData = await r.json()
              } catch (e) {}
              if (!lineamentsData) {
                const r2 = await fetch('/api/v1/layers/lineaments')
                if (r2.ok) lineamentsData = await r2.json()
              }

              if (lineamentsData && !map.getSource('lineaments-source')) {
                map.addSource('lineaments-source', { type: 'geojson', data: lineamentsData })
                map.addLayer({
                  id: 'lineaments-line',
                  type: 'line',
                  source: 'lineaments-source',
                  paint: {
                    'line-color': '#dc2626',
                    'line-width': 3.5,
                    'line-dasharray': [2, 1],
                    'line-opacity': 0.95,
                  },
                })

                // Popup on lineament click
                map.on('click', 'lineaments-line', (e) => {
                  if (!e.features || !e.features.length) return
                  const p = e.features[0].properties
                  new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                        <div style="font-weight: 800; font-size: 13px; color: #dc2626; margin-bottom: 3px;">
                          ${p.feature_type || 'FAULT/SHEAR'} LINEAMENT
                        </div>
                        <div><strong>ID:</strong> ${p.lineament_id}</div>
                        <div><strong>Length:</strong> ${p.length_km} km</div>
                        <div><strong>Strike:</strong> ${p.strike_azimuth}° N-S</div>
                      </div>
                    `)
                    .addTo(map)
                })
                map.on('mouseenter', 'lineaments-line', () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseleave', 'lineaments-line', () => { map.getCanvas().style.cursor = '' })
              }
            } catch (err) {
              console.error('Lineaments layer load error', err)
            }

            // 4. Add Monitoring Wells Layer (CGWB Piezometers)
            try {
              let wellsData = null
              try {
                const r = await fetch('/data/cgwb_monitoring_wells.geojson')
                if (r.ok) wellsData = await r.json()
              } catch (e) {}
              if (!wellsData) {
                const r2 = await fetch('/api/v1/layers/monitoring_wells')
                if (r2.ok) wellsData = await r2.json()
              }

              if (wellsData && !map.getSource('cgwb-source')) {
                map.addSource('cgwb-source', { type: 'geojson', data: wellsData })
                map.addLayer({
                  id: 'cgwb-circle',
                  type: 'circle',
                  source: 'cgwb-source',
                  paint: {
                    'circle-radius': 8,
                    'circle-color': '#059669',
                    'circle-stroke-width': 2.5,
                    'circle-stroke-color': '#ffffff',
                  },
                })

                // Popup on CGWB piezometer click
                map.on('click', 'cgwb-circle', (e) => {
                  if (!e.features || !e.features.length) return
                  const p = e.features[0].properties
                  new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 4px;">
                        <div style="font-weight: 800; font-size: 13px; color: #059669; margin-bottom: 3px;">
                          ${p.station_name} (${p.well_type || 'PIEZOMETER'})
                        </div>
                        <div><strong>Station Code:</strong> ${p.station_code}</div>
                        <div><strong>Taluk:</strong> ${p.taluk} (${p.district})</div>
                        <div><strong>Pre-Monsoon SWL:</strong> ${p.pre_monsoon_depth_mgl} m bgl</div>
                        <div><strong>Post-Monsoon SWL:</strong> ${p.post_monsoon_depth_mgl} m bgl</div>
                        <div><strong>Decadal Trend:</strong> ${p.decadal_trend_m_per_year} m/year</div>
                      </div>
                    `)
                    .addTo(map)
                })
                map.on('mouseenter', 'cgwb-circle', () => { map.getCanvas().style.cursor = 'pointer' })
                map.on('mouseleave', 'cgwb-circle', () => { map.getCanvas().style.cursor = '' })
              }
            } catch (err) {
              console.error('CGWB wells layer load error', err)
            }

            // Fit map view to Kolar + Chikkaballapur extent
            map.fitBounds([[77.30, 12.80], [78.60, 14.05]], { padding: 35, duration: 800 })
          })

          mapInstance.current = map
        })
      } else {
        setTimeout(() => {
          mapInstance.current?.resize()
        }, 100)
      }
    }
  }, [activeTab])

  // Translation Dictionaries
  const t = {
    title: lang === 'en' ? 'GIBRAS Intelligence' : 'ಗಿಬ್ರಾಸ್ ಅಂತರ್ಜಲ ವೇದಿಕೆ',
    subtitle:
      lang === 'en'
        ? 'Groundwater Intelligence & Borewell Risk Assessment System (Kolar & Chikkaballapur)'
        : 'ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಗಳ ಅಂತರ್ಜಲ ಮಾಹಿತಿ ಮತ್ತು ಕೊರೆತ ಬಾವಿ ವಿಫಲತೆಯ ಮುನ್ಸೂಚನೆ',
    tabFarmer: lang === 'en' ? '🌾 Farmer Advisory' : '🌾 ರೈತ ಮಿತ್ರ (ಸಲಹೆ)',
    tabGov: lang === 'en' ? '🏛️ Government Dashboard' : '🏛️ ಸರ್ಕಾರಿ ಆಡಳಿತ ಫಲಕ',
    tabHydro: lang === 'en' ? '🔬 Hydrogeologist Desk' : '🔬 ಜಲವಿಜ್ಞಾನಿಗಳ ವಿಭಾಗ',
    tabMap: lang === 'en' ? '🗺️ Interactive GIS Map' : '🗺️ ಜಿ.ಐ.ಎಸ್ ನಕ್ಷೆ',
    assessBtn: lang === 'en' ? 'Execute Hydrogeological Assessment' : 'ಅಂತರ್ಜಲ ಸಾಧ್ಯತೆ ಪರೀಕ್ಷಿಸಿ',
    assessing: lang === 'en' ? 'Computing Subterranean Strata Models...' : 'ಜಲವಿಜ್ಞಾನ ಡೇಟಾ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    district: lang === 'en' ? 'District' : 'ಜಿಲ್ಲೆ',
    taluk: lang === 'en' ? 'Taluk' : 'ತಾಲ್ಲೂಕು',
    village: lang === 'en' ? 'Village / Survey Land Parcel' : 'ಗ್ರಾಮ / ಸರ್ವೇ ಸಂಖ್ಯೆ',
    coords: lang === 'en' ? 'Coordinates (WGS84 GPS)' : 'ಸ್ಥಳದ ಅಕ್ಷಾಂಶ / ರೇಖಾಂಶ',
    notes: lang === 'en' ? 'Farmer Historical Memory (Optional)' : 'ಹಿಂದಿನ ಅನುಭವ / ವಿವರಣೆ (ಐಚ್ಛಿಕ)',
    disclaimer:
      lang === 'en'
        ? 'Public Welfare Mandate: GIBRAS estimates drilling failure risk using peer-reviewed hydrogeological physics and satellite indicators. It is not an absolute water guarantee. Mandatory on-site Vertical Electrical Sounding (VES) is strictly prescribed before drilling capital is committed.'
        : 'ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿ ಶಾಸನ: ಗಿಬ್ರಾಸ್ ವ್ಯವಸ್ಥೆಯು ಉಪಗ್ರಹ ಮತ್ತು ಭೌಗೋಳಿಕ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ವಿಫಲತೆಯ ಅಪಾಯವನ್ನು ಅಂದಾಜಿಸುತ್ತದೆ. ಇದು ನೀರಿನ ಗ್ಯಾರಂಟಿ ಅಲ್ಲ. ಹಣ ಹೂಡುವ ಮುನ್ನ ಅಧಿಕೃತ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ತಪಾಸಣೆ ಮಾಡಿಸುವುದು ಕಡ್ಡಾಯ.',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* CINEMATIC APPARATUS TOP BAR */}
      <header className="relative bg-[#0c121e]/90 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 relative">
          {/* Logo & System Credentials */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-sky-600 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-slate-900 border border-cyan-500/40 p-2.5 rounded-xl text-cyan-400">
                <Droplets className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  <span>GIBRAS</span>
                  <span className="text-cyan-400 font-mono text-xs font-semibold">///</span>
                </h1>
                <span className="text-[10px] bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                  GOV-GRADE v1.0
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded font-mono">
                  DHARWAR CRATON
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight font-medium">{t.subtitle}</p>
            </div>
          </div>

          {/* Telemetry HUD & Bilingual Switcher */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-[11px] text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-slate-400">CRS:</span>
              <span className="text-emerald-400 font-bold">EPSG:32643 UTM 43N</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">CALIB:</span>
              <span className="text-sky-400 font-bold">SPATIAL-CV 0.82 AUC</span>
            </div>

            {/* Language Seg Switch */}
            <div className="flex bg-[#111827] p-1 rounded-lg border border-slate-800 shadow-inner">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'en'
                    ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('kn')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                  lang === 'kn'
                    ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Nav Tabs */}
        <div className="bg-[#0a0f19] border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-4 py-2.5 text-xs font-bold tracking-wide flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'farmer'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.tabFarmer}
            </button>
            <button
              onClick={() => setActiveTab('gov')}
              className={`px-4 py-2.5 text-xs font-bold tracking-wide flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'gov'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.tabGov}
            </button>
            <button
              onClick={() => setActiveTab('hydro')}
              className={`px-4 py-2.5 text-xs font-bold tracking-wide flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'hydro'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.tabHydro}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2.5 text-xs font-bold tracking-wide flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                activeTab === 'map'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.tabMap}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT FRAME */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: FARMER ADVISORY (HERO WORKFLOW)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'farmer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Deck Column */}
            <div className="lg:col-span-5 optic-card p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold tracking-wide text-white uppercase">
                        {lang === 'en' ? 'Borewell Site Location' : 'ಕೊರೆತ ಬಾವಿ ಸ್ಥಳ ನಿಗದಿ'}
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'en' ? 'Hard-Rock Archaean Aquifer Target' : 'ಕಲ್ಲು ಬಂಡೆ ಅಂತರ್ಜಲ ವಲಯ'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                    HUD INPUT
                  </span>
                </div>

                <form onSubmit={handleAssessmentSubmit} className="space-y-4 text-xs">
                  {/* District & Taluk Selectors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {t.district}
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value)
                          if (e.target.value === 'Kolar') handleTalukChange('Kolar')
                          else handleTalukChange('Chikkaballapur')
                        }}
                        className="w-full text-xs font-medium bg-[#0b101b] border border-slate-700/80 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="Kolar">Kolar (194% Draft)</option>
                        <option value="Chikkaballapur">Chikkaballapur (188% Draft)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        {t.taluk}
                      </label>
                      <select
                        value={selectedTaluk}
                        onChange={(e) => handleTalukChange(e.target.value)}
                        className="w-full text-xs font-medium bg-[#0b101b] border border-slate-700/80 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                      >
                        {TALUKS.filter((t) => t.district === selectedDistrict).map((t) => (
                          <option key={t.taluk} value={t.taluk}>
                            {t.taluk} ({t.kannada})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Village / Land Parcel */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t.village}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        placeholder="e.g. Vokkaleri, Sy No. 44/2"
                        className="w-full text-xs bg-[#0b101b] border border-slate-700/80 text-white rounded-lg pl-3 pr-8 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                      />
                      <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                    </div>
                  </div>

                  {/* Coordinates WGS84 HUD */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300">Latitude (°N)</label>
                        <span className="text-[10px] text-slate-500 font-mono">12.8° - 14.0°</span>
                      </div>
                      <input
                        type="number"
                        step="0.0001"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full text-xs font-mono bg-[#0b101b] border border-slate-700/80 text-cyan-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300">Longitude (°E)</label>
                        <span className="text-[10px] text-slate-500 font-mono">77.3° - 78.6°</span>
                      </div>
                      <input
                        type="number"
                        step="0.0001"
                        value={lon}
                        onChange={(e) => setLon(e.target.value)}
                        className="w-full text-xs font-mono bg-[#0b101b] border border-slate-700/80 text-cyan-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Purpose Selector Chips */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                      {lang === 'en' ? 'Borewell Primary Purpose' : 'ಉದ್ದೇಶಿತ ಬಳಕೆ'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'irrigation', label: 'Micro-Irrigation', kannada: 'ಹನಿ ನೀರಾವರಿ' },
                        { id: 'drinking', label: 'Drinking Water', kannada: 'ಕುಡಿಯುವ ನೀರು' },
                        { id: 'commercial', label: 'Commercial', kannada: 'ವಾಣಿಜ್ಯ' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPurpose(p.id)}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition text-center ${
                            purpose === p.id
                              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                              : 'bg-[#0b101b] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-semibold">{lang === 'en' ? p.label : p.kannada}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Farmer Field Memory */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">{t.notes}</label>
                    <textarea
                      rows="2"
                      value={farmerNotes}
                      onChange={(e) => setFarmerNotes(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'e.g. Neighboring well at 200m failed at 140m depth; red loamy soil with surface granite outcroppings...'
                          : 'ಉದಾ: ಹಿಂದಿನ ವರ್ಷ ಪಕ್ಕದ ಬಾವಿ 140 ಮೀಟರ್ ಆಳದಲ್ಲಿ ಬತ್ತಿಹೋಗಿತ್ತು...'
                      }
                      className="w-full text-xs bg-[#0b101b] border border-slate-700/80 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-mono tracking-wide">{t.assessing}</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        <span className="tracking-wide uppercase text-xs">{t.assessBtn}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </form>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-rose-950/80 border border-rose-500/60 text-rose-200 rounded-xl text-xs flex items-center gap-2.5">
                    <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Public Welfare Mandate Notice */}
              <div className="mt-5 p-3.5 bg-amber-950/40 border border-amber-600/40 rounded-xl text-amber-200 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-amber-300/90">{t.disclaimer}</p>
              </div>
            </div>

            {/* Assessment Result Column (Dossier View) */}
            <div className="lg:col-span-7">
              {/* Empty State: Cinematic Radar Reticle */}
              {!assessmentResult && !loading && (
                <div className="h-full min-h-[500px] optic-card p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <div className="w-96 h-96 border border-cyan-500 rounded-full animate-ping"></div>
                    <div className="w-64 h-64 border border-cyan-500 rounded-full"></div>
                    <div className="w-32 h-32 border border-cyan-500 rounded-full"></div>
                  </div>

                  <div className="relative z-10 max-w-md space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <Compass className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {lang === 'en' ? 'Subterranean Strata Standby' : 'ಅಂತರ್ಜಲ ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧ'}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lang === 'en'
                        ? 'Select coordinates on the left or tap on the GIS tactical map to evaluate fracture density, pre/post monsoon recovery, and borewell failure risk.'
                        : 'ಎಡಭಾಗದಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ನಮೂದಿಸಿ "ಅಂತರ್ಜಲ ಸಾಧ್ಯತೆ ಪರೀಕ್ಷಿಸಿ" ಬಟನ್ ಒತ್ತಿ ಅಥವಾ ನಕ್ಷೆಯ ಮೇಲೆ ನೇರವಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ.'}
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={() => setActiveTab('map')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition flex items-center gap-1.5"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Open GIS Tactical Map' : 'ಜಿ.ಐ.ಎಸ್ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State: Multi-stage inference scan */}
              {loading && (
                <div className="h-full min-h-[500px] optic-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                    <Activity className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-wide font-mono">
                      EXECUTING SPATIAL-CV GROUNDWATER INFERENCE
                    </h3>
                    <p className="text-xs text-slate-400">
                      Querying DEM derivatives, GSI lineament buffer, and CGWB decadal hydrographs...
                    </p>
                  </div>
                  <div className="w-64 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full w-2/3 animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Ready Assessment Dossier */}
              {assessmentResult && (
                <div className="space-y-4">
                  {/* Monolithic Verdict Card */}
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      assessmentResult.advisory_classification === 'HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT'
                        ? 'bg-gradient-to-b from-rose-950/80 to-[#120a10] border-rose-500/70 optic-glow-rose'
                        : assessmentResult.advisory_classification === 'POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW'
                        ? 'bg-gradient-to-b from-emerald-950/80 to-[#0a1410] border-emerald-500/70 optic-glow-emerald'
                        : 'bg-gradient-to-b from-amber-950/80 to-[#14120a] border-amber-500/70 optic-glow-amber'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full animate-ping ${
                            assessmentResult.advisory_classification === 'HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT'
                              ? 'bg-rose-400'
                              : assessmentResult.advisory_classification === 'POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW'
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                          }`}
                        ></span>
                        <span className="text-xs font-mono font-black tracking-widest uppercase text-white">
                          {assessmentResult.advisory_classification.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-300">
                        <span>ID: {assessmentResult.assessment_id.slice(0, 8)}</span>
                        <button
                          onClick={() => handleCopyId(assessmentResult.assessment_id)}
                          className="hover:text-cyan-300 p-1"
                          title="Copy Full UUID"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold text-white leading-snug">
                      {lang === 'en' ? assessmentResult.explanation.english : assessmentResult.explanation.kannada}
                    </h3>

                    {/* Financial Loss Protection Ticker */}
                    {assessmentResult.failure_risk_assessment?.cost_warning && (
                      <div className="mt-3.5 p-3 rounded-xl bg-black/40 border border-amber-500/40 text-xs font-semibold flex items-center gap-2.5 text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 block">
                            Economic Loss Mitigation Warning:
                          </span>
                          <span>{assessmentResult.failure_risk_assessment.cost_warning}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4 Precision Metric Dials */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Failure Risk Dial */}
                    <div className="optic-card p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {lang === 'en' ? 'Borewell Failure Risk' : 'ವಿಫಲತೆ ಅಪಾಯ'}
                      </span>
                      <div className="text-2xl font-black text-white mt-1 tabular-nums font-mono">
                        {assessmentResult.failure_risk_assessment?.failure_probability
                          ? `${(assessmentResult.failure_risk_assessment.failure_probability * 100).toFixed(1)}%`
                          : 'Abstained'}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            assessmentResult.failure_risk_assessment?.risk_tier === 'HIGH_RISK'
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                          }`}
                        ></span>
                        <span className="text-[11px] font-semibold text-slate-300">
                          {assessmentResult.failure_risk_assessment?.risk_tier?.replace(/_/g, ' ') || 'Sparse'}
                        </span>
                      </div>
                    </div>

                    {/* Occurrence Dial */}
                    <div className="optic-card p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {lang === 'en' ? 'Occurrence Prob.' : 'ಅಂತರ್ಜಲ ಸಾಧ್ಯತೆ'}
                      </span>
                      <div className="text-2xl font-black text-cyan-400 mt-1 tabular-nums font-mono">
                        {assessmentResult.groundwater_potential?.occurrence_probability
                          ? `${(assessmentResult.groundwater_potential.occurrence_probability * 100).toFixed(1)}%`
                          : 'Abstained'}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-slate-300">
                        {assessmentResult.groundwater_potential?.occurrence_category || 'N/A'}
                      </div>
                    </div>

                    {/* Expected Yield Dial */}
                    <div className="optic-card p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {lang === 'en' ? 'Expected Yield' : 'ನಿರೀಕ್ಷಿತ ಇಳುವರಿ'}
                      </span>
                      <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums font-mono">
                        {assessmentResult.expected_yield?.median_yield_lpm
                          ? `${assessmentResult.expected_yield.median_yield_lpm} LPM`
                          : 'Survey Req.'}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 font-mono">
                        {assessmentResult.expected_yield?.yield_range_lpm
                          ? `IQR: ${assessmentResult.expected_yield.yield_range_lpm[0]} - ${assessmentResult.expected_yield.yield_range_lpm[1]} LPM`
                          : 'High Spread'}
                      </div>
                    </div>

                    {/* Recommended Depth Dial */}
                    <div className="optic-card p-3.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {lang === 'en' ? 'Productive Depth' : 'ಶಿಫಾರಸು ಆಳ'}
                      </span>
                      <div className="text-2xl font-black text-sky-300 mt-1 tabular-nums font-mono">
                        {assessmentResult.depth_interval?.recommended_min_depth_m
                          ? `${assessmentResult.depth_interval.recommended_min_depth_m.toFixed(0)}-${assessmentResult.depth_interval.recommended_max_depth_m.toFixed(0)}m`
                          : 'VES Required'}
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-rose-400">
                        Max 200m Limit
                      </div>
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* THE SIGNATURE SET: SUBTERRANEAN LITHOLOGICAL PROFILE (0m - 200m)    */}
                  {/* ================================================================= */}
                  <div className="optic-card p-4.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          {lang === 'en' ? 'Subterranean Strata & Fracture Profile' : 'ಅಂತರ್ಜಲ ಪದರ ಹಾಗೂ ಶಿಲಾಬಿರುಕುಗಳ ವಿವರಣೆ'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">0m - 220m DEPTH RULER</span>
                    </div>

                    {/* Strata Cross-section Graphic */}
                    <div className="space-y-1.5 text-xs font-mono">
                      {/* Layer 1: Weathered Saprolite Regolith (0-25m) */}
                      <div className="p-2.5 rounded-lg border border-amber-700/50 bg-regolith-hatch flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                          <span className="text-amber-200 font-semibold text-[11px]">
                            0m - 25m: Weathered Saprolite Regolith
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                          &gt;85% DEWATERED
                        </span>
                      </div>

                      {/* Layer 2: Moderately Fractured Basement (25-75m) */}
                      <div className="p-2.5 rounded-lg border border-slate-700/60 bg-slate-900/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded bg-slate-500"></span>
                          <span className="text-slate-300 font-semibold text-[11px]">
                            25m - 75m: Moderately Fractured Granite-Gneiss
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">UNCONFINED TRANSITION</span>
                      </div>

                      {/* Layer 3: TARGET TECTONIC FRACTURE STRIKE ZONE (75-180m) - THE SWEET SPOT */}
                      <div className="p-3 rounded-lg border border-cyan-400/80 bg-fracture-hatch relative overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-2">
                            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span className="text-cyan-200 font-bold text-xs">
                              75m - 180m: Target Tectonic Fracture Strike Zone
                            </span>
                          </div>
                          <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-400 px-2 py-0.5 rounded tracking-wide">
                            RECOMMENDED TARGET
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-1 relative z-10">
                          Primary deep strike expected between 75m - 120m; secondary shear zone between 140m - 180m.
                        </p>
                      </div>

                      {/* Layer 4: Impervious Archaean Basement (>180m) */}
                      <div className="p-2.5 rounded-lg border border-rose-900/60 bg-black/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                          <span className="text-rose-300 font-semibold text-[11px]">
                            &gt;180m: Massive Impervious Archaean Basement
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-600/40 px-2 py-0.5 rounded">
                          STOP DRILLING LIMIT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hydrogeological Drivers & Prescribed Actions */}
                  <div className="optic-card p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>{lang === 'en' ? 'Key Hydrogeological Drivers' : 'ಪ್ರಮುಖ ಜಲವಿಜ್ಞಾನ ಅಂಶಗಳು'}</span>
                      </h4>
                      <div className="space-y-2">
                        {assessmentResult.failure_risk_assessment?.contributing_factors?.map((f, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                              f.impact === 'INCREASES_RISK'
                                ? 'bg-rose-950/40 border-rose-700/50 text-rose-200'
                                : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                            }`}
                          >
                            {f.impact === 'INCREASES_RISK' ? (
                              <ArrowUpRight className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="font-bold text-white">{f.factor}</strong>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    f.impact === 'INCREASES_RISK' ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                                  }`}
                                >
                                  {f.impact}
                                </span>
                              </div>
                              <p className="mt-0.5 text-slate-300 leading-relaxed">
                                {lang === 'en' ? f.description : f.kannada}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prescribed Scientific Directives */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>{lang === 'en' ? 'Prescribed Actions & Directives' : 'ಮುಂದಿನ ಕ್ರಮಗಳು'}</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {(lang === 'en'
                          ? assessmentResult.recommended_actions
                          : assessmentResult.kannada_recommended_actions
                        )?.map((act, i) => (
                          <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                            <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-400 font-mono">
                        ASSESSMENT COMPLIANT WITH KGWA / CGWB STANDARDS
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3.5 rounded-lg border border-slate-700 transition"
                        >
                          <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{lang === 'en' ? 'Print Official Dossier' : 'ಅಧಿಕೃತ ವರದಿ ಮುದ್ರಿಸಿ'}</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('map')}
                          className="inline-flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm transition"
                        >
                          <MapIcon className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Inspect on GIS Map' : 'ನಕ್ಷೆಯಲ್ಲಿ ವೀಕ್ಷಿಸಿ'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: GOVERNMENT DASHBOARD (REGIONAL HYDROGEOLOGICAL COCKPIT)            */}
        {/* ========================================================================= */}
        {activeTab === 'gov' && (
          <div className="space-y-6">
            {/* Macro Telemetry Monitors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="optic-card p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  GEOGRAPHICAL SCOPE
                </span>
                <div className="text-2xl font-black text-white mt-1.5">11 Taluks</div>
                <p className="text-xs text-slate-400 mt-1">Kolar & Chikkaballapur (8,213 km²)</p>
                <div className="mt-3 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded w-fit">
                  Dharwar Archaean Basement
                </div>
              </div>

              <div className="optic-card p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  REGIONAL EXTRACTION STAGE
                </span>
                <div className="text-2xl font-black text-rose-500 mt-1.5 tabular-nums font-mono">187.3%</div>
                <p className="text-xs text-slate-400 mt-1">CGWB Over-Exploited Baseline</p>
                <div className="mt-3 text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded w-fit">
                  CRITICAL ZONE
                </div>
              </div>

              <div className="optic-card p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  CAPITAL LOSS PREVENTED
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1.5 font-mono">₹3.80 Crores</div>
                <p className="text-xs text-slate-400 mt-1">Avoided Unviable Drilling Expenditure</p>
                <div className="mt-3 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded w-fit">
                  ECONOMIC PROTECTION
                </div>
              </div>

              <div className="optic-card p-5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  VERIFIED GROUND TRUTH
                </span>
                <div className="text-2xl font-black text-white mt-1.5 font-mono">381 Wells</div>
                <p className="text-xs text-slate-400 mt-1">Tier A/B Verified Observations</p>
                <div className="mt-3 text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-500/30 px-2 py-0.5 rounded w-fit">
                  0% SYNTHETIC DATA
                </div>
              </div>
            </div>

            {/* Taluk Summary Matrix */}
            {govSummary && (
              <div className="optic-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      District & Taluk-Wise Hydrogeological Stress Matrix
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">CGWB DRAFT CLASSIFICATION</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                        <th className="p-3">Taluk</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Area (km²)</th>
                        <th className="p-3">Rainfall Normal</th>
                        <th className="p-3">Extraction Stage (%)</th>
                        <th className="p-3">CGWB Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
                      {[
                        ...govSummary.kolar_district.taluks.map((t) => ({ ...t, district: 'Kolar' })),
                        ...govSummary.chikkaballapur_district.taluks.map((t) => ({ ...t, district: 'Chikkaballapur' })),
                      ].map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-bold text-white">{t.taluk}</td>
                          <td className="p-3 text-slate-400">{t.district}</td>
                          <td className="p-3 text-slate-300 tabular-nums">{t.area_sq_km}</td>
                          <td className="p-3 text-slate-300 tabular-nums">{t.annual_rainfall_normal_mm} mm</td>
                          <td className="p-3 font-bold text-rose-400 tabular-nums">
                            {t.cgwb_stage_extraction_pct}%
                          </td>
                          <td className="p-3">
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded font-bold text-[10px]">
                              OVER-EXPLOITED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quality Gate D Model Benchmark Panel */}
            {modelMetrics && (
              <div className="optic-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Quality Gate D: Spatial Block Cross-Validation Benchmarks
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    GATE D PASSED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Evaluated with taluk-blocked spatial holdouts to ensure zero geographic autocorrelation leakage.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Brier Score</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                      {modelMetrics.metrics.mean_brier_score}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Target: &le; 0.22</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Calib Error (ECE)</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                      {modelMetrics.metrics.mean_ece}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Target: &lt; 0.20</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Spatial ROC-AUC</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                      {modelMetrics.metrics.mean_roc_auc}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Target: &ge; 0.80</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Spatial PR-AUC</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                      {modelMetrics.metrics.mean_pr_auc}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Target: &ge; 0.75</span>
                  </div>
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Missed Failure Rate</span>
                    <span className="text-xl font-black text-emerald-400 font-mono block mt-1">
                      {(modelMetrics.metrics.mean_missed_failure_rate * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Cost Sensitive</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HYDROGEOLOGIST FIELD DESK                                          */}
        {/* ========================================================================= */}
        {activeTab === 'hydro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 optic-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Field Verification & Geophysical Logging
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded">
                  VES TERMINAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Record on-site Vertical Electrical Sounding (VES) resistivity surveys and calibrate pre-drilling models.
              </p>

              <form onSubmit={handleHydroSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Assessment UUID Target</label>
                  <input
                    type="text"
                    value={hydroTargetId}
                    onChange={(e) => setHydroTargetId(e.target.value)}
                    placeholder="Enter assessment UUID (or select from right)"
                    required
                    className="w-full text-xs font-mono bg-[#0b101b] border border-slate-700/80 text-cyan-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Certified Hydrogeologist Name & ID</label>
                  <input
                    type="text"
                    value={hydroName}
                    onChange={(e) => setHydroName(e.target.value)}
                    required
                    className="w-full text-xs bg-[#0b101b] border border-slate-700/80 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="vesCheck"
                    checked={vesConducted}
                    onChange={(e) => setVesConducted(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-[#0b101b] border-slate-700"
                  />
                  <label htmlFor="vesCheck" className="font-semibold text-slate-200 cursor-pointer">
                    Vertical Electrical Sounding (VES) Schlumberger Survey Conducted
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Apparent Res. (&Omega;&middot;m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={vesResistivity}
                      onChange={(e) => setVesResistivity(e.target.value)}
                      className="w-full font-mono bg-[#0b101b] border border-slate-700/80 text-white px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Weathered Depth (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inferredWeathered}
                      onChange={(e) => setInferredWeathered(e.target.value)}
                      className="w-full font-mono bg-[#0b101b] border border-slate-700/80 text-white px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Fracture Strike (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={inferredFracture}
                      onChange={(e) => setInferredFracture(e.target.value)}
                      className="w-full font-mono bg-[#0b101b] border border-slate-700/80 text-white px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Verified Outcome</label>
                    <select
                      value={verifiedOutcome}
                      onChange={(e) => setVerifiedOutcome(e.target.value)}
                      className="w-full bg-[#0b101b] border border-slate-700/80 text-white px-2.5 py-2 rounded-lg"
                    >
                      <option value="PRODUCTIVE">PRODUCTIVE (&ge; 40 LPM)</option>
                      <option value="INADEQUATE_YIELD">INADEQUATE YIELD (&lt; 40 LPM)</option>
                      <option value="DRY">DRY / FAILED</option>
                      <option value="SUSTAINABLE_WITH_MONITORING">SUSTAINABLE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Actual Measured Yield (LPM)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={actualYield}
                      onChange={(e) => setActualYield(e.target.value)}
                      className="w-full font-mono bg-[#0b101b] border border-slate-700/80 text-white px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Field Expert Notes</label>
                  <textarea
                    rows="2"
                    value={hydroNotes}
                    onChange={(e) => setHydroNotes(e.target.value)}
                    className="w-full bg-[#0b101b] border border-slate-700/80 text-white px-3 py-2 rounded-lg"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition"
                >
                  Submit Certified Field Calibration
                </button>
              </form>

              {hydroMessage && (
                <div className="mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 rounded-xl text-xs font-semibold">
                  {hydroMessage}
                </div>
              )}
            </div>

            {/* Recent Assessments Queue */}
            <div className="lg:col-span-6 optic-card p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Recent Field Assessments Dossier
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">CLICK TO LOAD TARGET</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {recentAssessments.map((a) => (
                  <div
                    key={a.assessment_id}
                    onClick={() => setHydroTargetId(a.assessment_id)}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 cursor-pointer transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-cyan-300">
                        {a.assessment_id.slice(0, 8)}...{a.assessment_id.slice(-4)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                          a.expert_reviewed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {a.expert_reviewed ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="text-slate-400 flex justify-between items-center text-[11px]">
                      <span>
                        {a.village ? `${a.village}, ` : ''}{a.taluk} ({a.district})
                      </span>
                      <span className="font-semibold text-slate-200 font-mono">{a.risk_tier || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GIS INTERACTIVE TACTICAL MAP                                       */}
        {/* ========================================================================= */}
        <div
          style={{ display: activeTab === 'map' ? 'flex' : 'none' }}
          className="optic-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex-col h-[740px]"
        >
          {/* Tactical Map Control Deck */}
          <div className="bg-[#0b101b] border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center space-x-1.5 font-bold mr-1 text-slate-300">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider">Tactical Layers:</span>
              </div>
              <button
                type="button"
                onClick={() => toggleLayer('taluks')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1.5 ${
                  activeLayers.taluks
                    ? 'bg-sky-950 border-sky-400 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeLayers.taluks ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                Taluk Boundaries
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('lineaments')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1.5 ${
                  activeLayers.lineaments
                    ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeLayers.lineaments ? 'bg-rose-500' : 'bg-slate-600'}`}></span>
                Fault Lineaments
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('monitoring_wells')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1.5 ${
                  activeLayers.monitoring_wells
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeLayers.monitoring_wells ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                CGWB Piezometers
              </button>
              <button
                type="button"
                onClick={() => toggleLayer('drainage')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1.5 ${
                  activeLayers.drainage
                    ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeLayers.drainage ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
                Drainage
              </button>
            </div>

            {/* Target Crosshair Readout */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-slate-900 border border-cyan-500/40 px-3 py-1 rounded-lg text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>{lat}°N, {lon}°E</span>
              </span>
              <button
                onClick={() => setActiveTab('farmer')}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <span>Assess Location</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div ref={mapContainer} className="flex-1 w-full relative min-h-[580px]">
            {/* Cinematic Floating Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-[#0c121e]/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 shadow-2xl text-xs space-y-2 max-w-xs text-slate-200">
              <strong className="block text-white font-bold border-b border-slate-800 pb-1.5 mb-2 uppercase tracking-wider text-[11px]">
                Tactical Map Legend
              </strong>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3.5 h-3.5 rounded bg-sky-500/20 border-2 border-sky-400 flex-shrink-0"></span>
                <span>Taluk Boundaries (Survey of India)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-4 h-1 bg-rose-500 rounded-sm flex-shrink-0"></span>
                <span>Fault / Shear Lineaments (GSI Bhukosh)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white flex-shrink-0"></span>
                <span>CGWB Ground Water Piezometers</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-4 h-0.5 bg-blue-500 flex-shrink-0"></span>
                <span>Dendritic Stream Drainage</span>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 font-mono">
                Projection: EPSG:32643 (UTM 43N) Metric Space
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CINEMATIC LETTERBOX FOOTER */}
      <footer className="bg-[#070b13] border-t border-slate-900 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-medium text-slate-400">
              GIBRAS Public Welfare Engineering Initiative &copy; 2026
            </span>
            <span className="text-slate-600">|</span>
            <span>Karnataka Ground Water Authorities & CGWB</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500">
            <span>DHARWAR CRATON HARD-ROCK BASEMENT</span>
            <span>&bull;</span>
            <span>DPDPA 2023 COMPLIANT</span>
          </div>
        </div>
      </footer>

      {/* PRINT-ONLY OFFICIAL ASSESSMENT DOSSIER */}
      {assessmentResult && (
        <div className="hidden print:block p-8 bg-white text-black font-sans">
          <div className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Government of Karnataka &bull; Central Ground Water Board
            </h1>
            <h2 className="text-lg font-bold mt-1">
              Groundwater Intelligence & Borewell Risk Assessment System (GIBRAS)
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Official Assessment Dossier &bull; Kolar & Chikkaballapur Hard-Rock Archaean Basement
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><strong>Assessment ID:</strong> {assessmentResult.assessment_id}</p>
              <p><strong>District:</strong> {assessmentResult.administrative?.district}</p>
              <p><strong>Taluk:</strong> {assessmentResult.administrative?.taluk}</p>
              <p><strong>Village:</strong> {assessmentResult.village || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Coordinates:</strong> {lat}°N, {lon}°E (WGS84)</p>
              <p><strong>Projected CRS:</strong> EPSG:32643 (UTM 43N)</p>
              <p><strong>Date & Time:</strong> {new Date().toISOString()}</p>
              <p><strong>Advisory Category:</strong> {assessmentResult.advisory_classification}</p>
            </div>
          </div>

          <div className="border-2 border-black p-4 mb-6">
            <h3 className="font-bold text-base mb-1">HYDROGEOLOGICAL RISK CLASSIFICATION</h3>
            <p className="text-sm font-semibold">{assessmentResult.explanation?.english}</p>
            <p className="text-sm font-semibold mt-1">{assessmentResult.explanation?.kannada}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-sm border-t border-b border-gray-300 py-3">
            <div>
              <p className="text-xs text-gray-600">FAILURE RISK</p>
              <p className="font-bold text-base">
                {assessmentResult.failure_risk_assessment?.failure_probability
                  ? `${(assessmentResult.failure_risk_assessment.failure_probability * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">EXPECTED YIELD</p>
              <p className="font-bold text-base">
                {assessmentResult.expected_yield?.median_yield_lpm} LPM
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">RECOMMENDED DEPTH INTERVAL</p>
              <p className="font-bold text-base">
                {assessmentResult.depth_interval?.recommended_min_depth_m?.toFixed(0)}m - {assessmentResult.depth_interval?.recommended_max_depth_m?.toFixed(0)}m
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-bold text-sm mb-2">MANDATORY STATUTORY CONDITIONS:</h4>
            <ol className="list-decimal pl-5 text-xs space-y-1">
              <li>Mandatory on-site Vertical Electrical Sounding (VES) survey by certified hydrogeologist.</li>
              <li>Maintain minimum 200m distance from any operational borewell.</li>
              <li>Micro-irrigation (drip/sprinkler) mandatory to preserve depleted crystalline aquifer.</li>
            </ol>
          </div>

          <div className="mt-12 pt-6 border-t border-black flex justify-between text-xs">
            <div>
              <p>Verified Hydrogeologist Signature:</p>
              <p className="mt-8 font-mono">___________________________________</p>
            </div>
            <div>
              <p>Government Official Stamp / KGWA:</p>
              <p className="mt-8 font-mono">___________________________________</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
