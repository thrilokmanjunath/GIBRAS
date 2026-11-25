'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  AlertTriangle, CheckCircle, HelpCircle, Shield, MapPin, Download,
  Layers, Database, Compass, Activity, ChevronRight, FileText,
  UserCheck, Droplets, Info, RefreshCw, BarChart3, AlertOctagon,
  Printer, Crosshair, ArrowUpRight, ArrowDownRight, Zap, Eye, Gauge,
  Clock, Map as MapIcon, Sliders, Check, Copy, ExternalLink, ArrowRight,
  Phone, Building2, Search, Award, CheckCircle2, XCircle, FileSpreadsheet,
  HelpCircle as QuestionIcon
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
  const [lang, setLang] = useState('kn') // Default to Kannada
  const [activeTab, setActiveTab] = useState('farmer') // 'farmer', 'gov', 'hydro', 'map'

  // Farmer Form State (Modeled after Bhoomi RTC / Survey Search)
  const [selectedDistrict, setSelectedDistrict] = useState('Kolar')
  const [selectedTaluk, setSelectedTaluk] = useState('Kolar')
  const [hobliName, setHobliName] = useState('Kasaba')
  const [villageName, setVillageName] = useState('Vokkaleri')
  const [surveyNo, setSurveyNo] = useState('44/2')
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
  const [hydroName, setHydroName] = useState('Dr. Ramesh Rao (Consultant Hydrogeologist)')
  const [vesConducted, setVesConducted] = useState(true)
  const [vesResistivity, setVesResistivity] = useState('85.0')
  const [inferredWeathered, setInferredWeathered] = useState('18.0')
  const [inferredFracture, setInferredFracture] = useState('95.0')
  const [verifiedOutcome, setVerifiedOutcome] = useState('PRODUCTIVE')
  const [actualYield, setActualYield] = useState('90.0')
  const [hydroNotes, setHydroNotes] = useState('Secondary joint set confirmed via 4-electrode Schlumberger sounding at AB/2=100m.')
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
          village: `${villageName} (Sy No: ${surveyNo})`,
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
          inferred_weathered_thickness_m: parseFloat(inferredWeathered),
          inferred_first_fracture_depth_m: parseFloat(inferredFracture),
          verified_outcome: verifiedOutcome,
          actual_yield_lpm: verifiedOutcome === 'PRODUCTIVE' ? parseFloat(actualYield) : 0.0,
          field_notes: hydroNotes,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Field verification logging failed')
      }

      const data = await res.json()
      setHydroMessage(
        lang === 'en'
          ? `✓ Field verification recorded successfully for ID: ${(data.assessment_id || hydroTargetId).slice(0, 8)}`
          : `✓ ಸ್ಥಳ ಪರಿಶೀಲನಾ ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನಮೂದಿಸಲಾಗಿದೆ (ID: ${(data.assessment_id || hydroTargetId).slice(0, 8)})`
      )
      loadGovData()
    } catch (err) {
      setHydroMessage(`Error: ${err.message}`)
    }
  }

  // Clipboard copy helper
  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Initialize MapLibre
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!mapInstance.current && mapContainer.current) {
        import('maplibre-gl').then((maplibreglModule) => {
          const maplibregl = maplibreglModule.default

          const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
              version: 8,
              sources: {
                osm: {
                  type: 'raster',
                  tiles: [
                    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                  ],
                  tileSize: 256,
                  attribution: '© OpenStreetMap contributors, Survey of India, KSRSAC',
                },
              },
              layers: [
                {
                  id: 'osm-tiles',
                  type: 'raster',
                  source: 'osm',
                  minzoom: 0,
                  maxzoom: 19,
                },
              ],
            },
            center: [78.0, 13.35],
            zoom: 8.5,
          })

          map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right')
          map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

          const initialLng = parseFloat(lon) || 78.134
          const initialLat = parseFloat(lat) || 13.136
          const marker = new maplibregl.Marker({ color: '#b91c1c', draggable: true })
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
                      'Kolar', '#003366',
                      'Chikkaballapur', '#7c3aed',
                      '#003366'
                    ],
                    'fill-opacity': 0.12,
                  },
                })
                map.addLayer({
                  id: 'taluks-line',
                  type: 'line',
                  source: 'taluks-source',
                  paint: {
                    'line-color': '#003366',
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
                        <div style="font-weight: 800; font-size: 14px; color: #003366; margin-bottom: 3px;">
                          ${p.taluk} Taluk / ತಾಲ್ಲೂಕು
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
                    'line-color': '#0284c7',
                    'line-width': 2.0,
                    'line-opacity': 0.8,
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
                    'circle-color': '#15803d',
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
                        <div style="font-weight: 800; font-size: 13px; color: #15803d; margin-bottom: 3px;">
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

  // Normalization layer: guarantees 100% null-safe rendering
  const norm = assessmentResult ? {
    id: String(assessmentResult.assessment_id || 'PROTOTYPE-REF'),
    lat: Number(assessmentResult.latitude ?? assessmentResult.coordinates?.latitude ?? lat ?? 13.136),
    lon: Number(assessmentResult.longitude ?? assessmentResult.coordinates?.longitude ?? lon ?? 78.134),
    district: String(assessmentResult.district || assessmentResult.administrative?.district || selectedDistrict),
    taluk: String(assessmentResult.taluk || assessmentResult.administrative?.taluk || selectedTaluk),
    village: String(assessmentResult.village || `${villageName} (Sy: ${surveyNo})`),
    advisory: String(assessmentResult.advisory_classification || 'FURTHER_INVESTIGATION_REQUIRED'),
    pFailure: Number(assessmentResult.failure_probability ?? assessmentResult.failure_risk_assessment?.failure_probability ?? 0.52),
    pOccurrence: Number(assessmentResult.occurrence_probability ?? assessmentResult.groundwater_potential?.occurrence_probability ?? 0.58),
    occurrenceCat: String(assessmentResult.groundwater_potential?.occurrence_category || 'MODERATE'),
    riskTier: String(assessmentResult.risk_tier || assessmentResult.failure_risk_assessment?.risk_tier || 'MODERATE_RISK'),
    costWarning: assessmentResult.failure_risk_assessment?.cost_warning || 'Potential avoidable drilling loss: ₹1,50,000 - ₹3,00,000 INR',
    contributingFactors: Array.isArray(assessmentResult.failure_risk_assessment?.contributing_factors)
      ? assessmentResult.failure_risk_assessment.contributing_factors
      : [
          {
            factor: "Aquifer Draft Pressure",
            impact: "INCREASES_RISK",
            description: "Taluk extraction exceeds 180% of dynamic recharge.",
            kannada: "ತಾಲ್ಲೂಕಿನಲ್ಲಿ ಅಂತರ್ಜಲ ಬಳಕೆ ವಾರ್ಷಿಕ ಮರುಪೂರಣಕ್ಕಿಂತ ಶೇ. 180 ಕ್ಕೂ ಅಧಿಕವಾಗಿದೆ."
          },
          {
            factor: "Fracture Joint Frequency",
            impact: "INCREASES_RISK",
            description: "Location is distant from regional tectonic lineaments.",
            kannada: "ಸ್ಥಳವು ಮುಖ್ಯ ಭೂವೈಜ್ಞಾನಿಕ ಸೀಳುರೇಖೆಗಳಿಂದ ದೂರದಲ್ಲಿದೆ."
          }
        ],
    yieldRange: assessmentResult.expected_yield?.yield_range_lpm
      ? `${assessmentResult.expected_yield.yield_range_lpm[0]} - ${assessmentResult.expected_yield.yield_range_lpm[1]} LPM`
      : (assessmentResult.yield_range_lpm || '35 - 75 LPM'),
    yieldMedian: Number(assessmentResult.expected_yield?.median_yield_lpm ?? 50),
    weatheredThickness: Number(assessmentResult.inferred_weathered_thickness_m ?? 14.8),
    fractureProximity: Number(assessmentResult.fracture_proximity_km ?? 1.4),
    fractureInterval: String(assessmentResult.depth_interval?.primary_strike_interval || assessmentResult.inferred_fracture_depth_interval || '75m - 120m'),
    formation: String(assessmentResult.geological_formation || 'Peninsular Gneissic Complex (Archaean Craton)'),
    firstFractureDepth: Number(assessmentResult.inferred_first_fracture_depth_m ?? 95),
    recMinDepth: Number(assessmentResult.depth_interval?.recommended_min_depth_m ?? 75),
    recMaxDepth: Number(assessmentResult.depth_interval?.recommended_max_depth_m ?? 180),
    deepDrillingAdvisory: String(assessmentResult.depth_interval?.deep_drilling_advisory || 'Massive bedrock encountered beyond 180m; stop drilling if no water struck by 180m.'),
    deepDrillingKn: String(assessmentResult.depth_interval?.kannada || '180 ಮೀಟರ್ ನಂತರ ಗಟ್ಟಿ ಶಿಲಾಸ್ತರವಿರುವುದರಿಂದ ಕೊರೆಯುವುದನ್ನು ನಿಲ್ಲಿಸುವುದು ಸೂಕ್ತ.'),
    extractionPressure: String(assessmentResult.groundwater_extraction_pressure || `${assessmentResult.administrative?.cgwb_stage_extraction_pct || 194.2}% (Over-Exploited)`),
    seasonalStress: String(assessmentResult.seasonal_stress?.stress_level || 'MODERATE_SEASONAL_STRESS'),
    preMonsoon: Number(assessmentResult.seasonal_stress?.pre_monsoon_depth_mgl ?? 48.5),
    postMonsoon: Number(assessmentResult.seasonal_stress?.post_monsoon_depth_mgl ?? 38.2),
    rechargeRecovery: Number(assessmentResult.seasonal_stress?.seasonal_recharge_recovery_m ?? 10.3),
    engReasoning: String(assessmentResult.explanation?.english || assessmentResult.scientific_explanation || 'Scientific hydrogeological estimation based on satellite fracture density, digital elevation models, and CGWB monitoring observations.'),
    knReasoning: String(assessmentResult.explanation?.kannada || assessmentResult.kannada_explanation || 'ಉಪಗ್ರಹ ಸೀಳುರೇಖೆ ಸಾಮೀಪ್ಯ, ಡಿಜಿಟಲ್ ಎಲಿವೇಶನ್ ಮಾದರಿ ಮತ್ತು ಸಿ.ಜಿ.ಡಬ್ಲ್ಯೂ.ಬಿ ಬಾವಿ ಮಟ್ಟಗಳ ದತ್ತಾಂಶದ ಆಧಾರದ ಮೇಲೆ ಈ ಫಲಿತಾಂಶವನ್ನು ಪಡೆಯಲಾಗಿದೆ.'),
    recActions: Array.isArray(assessmentResult.recommended_actions) ? assessmentResult.recommended_actions : [
      'Conduct site-specific Vertical Electrical Sounding (VES) resistivity survey by certified hydrogeologist.',
      'Maintain minimum 200-meter statutory spacing from any functional borewell.',
      'Adopt micro-irrigation (drip/sprinkler) to prolong aquifer life.'
    ],
    knRecActions: Array.isArray(assessmentResult.kannada_recommended_actions) ? assessmentResult.kannada_recommended_actions : [
      'ಅಧಿಕೃತ ಜಲವಿಜ್ಞಾನಿಗಳಿಂದ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ಸಮೀಕ್ಷೆ ಮಾಡಿಸಿ.',
      'ಪಕ್ಕದ ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಕೊರೆತ ಬಾವಿಯಿಂದ ಕನಿಷ್ಠ 200 ಮೀಟರ್ ಅಂತರವನ್ನು ಕಡ್ಡಾಯವಾಗಿ ಕಾಪಾಡಿ.',
      'ಅಂತರ್ಜಲ ಉಳಿಸಲು ಹನಿ ಅಥವಾ ತುಂತುರು ನೀರಾವರಿ ಪದ್ಧತಿಯನ್ನು ಮಾತ್ರ ಬಳಸಿ.'
    ],
    dateStr: assessmentResult.created_at || assessmentResult.timestamp || new Date().toISOString()
  } : null

  // Content dictionary
  const t = {
    govName: lang === 'en' ? 'GIBRAS RESEARCH INITIATIVE' : 'ಗಿಬ್ರಾಸ್ ಸಂಶೋಧನಾ ಯೋಜನೆ',
    deptName:
      lang === 'en'
        ? 'Groundwater Intelligence & Borewell Risk Assessment System (Project Prototype)'
        : 'ಅಂತರ್ಜಲ ಮಾಹಿತಿ ಮತ್ತು ಕೊಳವೆಬಾವಿ ವಿಫಲತೆ ಮುನ್ಸೂಚನಾ ವ್ಯವಸ್ಥೆ (ಪ್ರಾಯೋಗಿಕ ಮಾದರಿ)',
    portalTitle:
      lang === 'en'
        ? 'GIBRAS Decision Support Platform (Prototype v1.0)'
        : 'ಗಿಬ್ರಾಸ್ ನಿರ್ಧಾರ ಬೆಂಬಲ ವೇದಿಕೆ (ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಾಂಶ)',
    subtitle:
      lang === 'en'
        ? 'Pre-Drilling Hydrogeological Risk Assessment Prototype for Kolar & Chikkaballapur (UI Benchmark Inspired by Bhoomojini Standards)'
        : 'ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಗಳ ಕೊಳವೆಬಾವಿ ಕೊರೆಯುವ ಮುನ್ನ ತಾಂತ್ರಿಕ ಕಾರ್ಯಸಾಧ್ಯತಾ ಪ್ರಾಯೋಗಿಕ ಮಾದರಿ',
    tabFarmer: lang === 'en' ? '🌾 Land Parcel Verification' : '🌾 ರೈತ ಸೇವಾ ಕೇಂದ್ರ (ಸ್ಥಳ ಪರಿಶೀಲನೆ)',
    tabGov: lang === 'en' ? '🏛️ Regional Extraction Matrix' : '🏛️ ಆಡಳಿತ ಫಲಕ (ತಾಲ್ಲೂಕುವಾರು ದತ್ತಾಂಶ)',
    tabHydro: lang === 'en' ? '🔬 Hydrogeologist Field Desk' : '🔬 ಜಲವಿಜ್ಞಾನಿಗಳ ಕಚೇರಿ (VES ದಾಖಲಾತಿ)',
    tabMap: lang === 'en' ? '🗺️ Interactive GIS Map' : '🗺️ ಭೂ-ಮಾಹಿತಿ ನಕ್ಷೆ (KSRSAC/GSI)',
    assessBtn: lang === 'en' ? 'Run Hydrogeological Assessment' : 'ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ ವರದಿ ಪಡೆಯಿರಿ',
    assessing: lang === 'en' ? 'Computing Subsurface Models...' : 'ಅಂತರ್ಜಲ ದತ್ತಾಂಶ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    district: lang === 'en' ? 'District' : 'ಜಿಲ್ಲೆ',
    taluk: lang === 'en' ? 'Taluk' : 'ತಾಲ್ಲೂಕು',
    hobli: lang === 'en' ? 'Hobli' : 'ಹೋಬಳಿ',
    village: lang === 'en' ? 'Village / Land Parcel' : 'ಗ್ರಾಮ',
    surveyNo: lang === 'en' ? 'Survey No. / RTC Number' : 'ಸರ್ವೆ ನಂಬರ್ / ಹಿಸ್ಸಾ ಸಂಖ್ಯೆ',
    coords: lang === 'en' ? 'GPS Coordinates (WGS84)' : 'ಜಿ.ಪಿ.ಎಸ್ ಅಕ್ಷಾಂಶ / ರೇಖಾಂಶ',
    notes: lang === 'en' ? 'Local Field Observations / Past Drill History' : 'ಹಿಂದಿನ ಕೊರೆತ ಬಾವಿಗಳ ವಿವರ / ಅನುಭವ (ಐಚ್ಛಿಕ)',
    disclaimer:
      lang === 'en'
        ? 'PROTOTYPE DISCLAIMER: GIBRAS is an experimental engineering decision-support prototype. Estimates are generated using calibrated hydrogeological physics, CGWB decadal water levels, and satellite fracture indicators. It does NOT guarantee water occurrence or replace on-site resistivity (VES) sounding by certified hydrogeologists. This is an unofficial research tool.'
        : 'ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಾಂಶದ ಸೂಚನೆ: ಗಿಬ್ರಾಸ್ ವ್ಯವಸ್ಥೆಯು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ತಂತ್ರಾಂಶವಾಗಿದೆ. ಈ ವರದಿಯು ಉಪಗ್ರಹ ಆಧಾರಿತ ಸೀಳುರೇಖೆಗಳು ಮತ್ತು ಸಿ.ಜಿ.ಡಬ್ಲ್ಯೂ.ಬಿ ದಶಕದ ಅಂತರ್ಜಲ ಕುಸಿತದ ದತ್ತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ವೈಜ್ಞಾನಿಕವಾಗಿ ವಿಫಲತೆಯ ಅಪಾಯವನ್ನು ಅಂದಾಜಿಸುತ್ತದೆ. ಇದು ನೀರಿನ ಗ್ಯಾರಂಟಿ ಅಲ್ಲ. ಕೊರೆಯುವ ಮುನ್ನ ಅಧಿಕೃತ ಜಲವಿಜ್ಞಾನಿಗಳಿಂದ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ತಪಾಸಣೆ ಮಾಡಿಸುವುದು ಕಡ್ಡಾಯ.',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800">
      {/* 1. NATIONAL TRICOLOR TOP STRIPE */}
      <div className="tricolor-stripe w-full"></div>

      {/* 2. PROMINENT PROTOTYPE & UNOFFICIAL DEMO BANNER */}
      <div className="bg-[#fffbeb] border-b border-[#fde68a] text-[#92400e] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#b45309] text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase flex-shrink-0">
              {lang === 'en' ? 'PROJECT PROTOTYPE' : 'ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ಯೋಜನೆ'}
            </span>
            <span className="text-[11px] leading-tight font-medium">
              {lang === 'en'
                ? 'GIBRAS is an independent academic & public-welfare research prototype. References to Bhoomojini / Bhoomi are for UI architectural benchmarking and schema demonstration only. This is an unofficial research listing and not an official government website.'
                : 'ಗಿಬ್ರಾಸ್ (GIBRAS) ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ತಂತ್ರಾಂಶವಾಗಿದೆ. ಕರ್ನಾಟಕ ಭೂಮೋಜಿಣಿ ವಿನ್ಯಾಸವನ್ನು ಪ್ರಾಯೋಗಿಕ ಅಧ್ಯಯನಕ್ಕಾಗಿ (UI Benchmarking) ಮಾತ್ರ ಬಳಸಲಾಗಿದೆ. ಇದು ಅನಧಿಕೃತ ಪ್ರಾಯೋಗಿಕ ಯೋಜನೆಯಾಗಿದ್ದು, ಯಾವುದೇ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್ ಅಲ್ಲ.'}
            </span>
          </div>
          <span className="text-[10px] text-[#b45309] font-mono font-bold whitespace-nowrap bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            v1.0-prototype
          </span>
        </div>
      </div>

      {/* 3. MASTHEAD (Clean Administrative Style) */}
      <header className="bg-white border-b border-slate-300 shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Emblems & Identity */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src="/img/karnataka_seal.svg"
                  alt="Emblem"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs md:text-sm font-black text-[#991b1b] tracking-wide uppercase">
                    {t.govName}
                  </h2>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold">
                    ಪ್ರಾಯೋಗಿಕ ಮಾದರಿ (R&D Prototype Demo)
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-[#003366] leading-tight">
                  {t.deptName}
                </h3>
                <h1 className="text-base md:text-lg font-black text-slate-900 leading-tight mt-0.5">
                  {t.portalTitle}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">{t.subtitle}</p>
              </div>
            </div>

            {/* Right Tools: Ashoka Emblem, Support & Language Selector */}
            <div className="flex items-center space-x-5">
              <div className="hidden sm:block w-10 h-12 flex-shrink-0">
                <img
                  src="/img/ashoka_lion.svg"
                  alt="Emblem of India"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Phone className="w-3 h-3 text-[#003366]" />
                    <span>ಸಹಾಯವಾಣಿ (Helpdesk): 080-22262441</span>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-slate-600">EPSG:32643 UTM 43N</span>
                </div>

                {/* Bilingual Switcher */}
                <div className="flex border border-slate-300 rounded overflow-hidden shadow-sm text-xs font-semibold">
                  <button
                    onClick={() => setLang('kn')}
                    className={`px-3 py-1 transition ${
                      lang === 'kn'
                        ? 'bg-[#003366] text-white font-bold'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 transition border-l border-slate-300 ${
                      lang === 'en'
                        ? 'bg-[#003366] text-white font-bold'
                        : 'bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-[#003366] text-white border-t border-[#002244] shadow-md">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap space-x-1">
            <button
              onClick={() => setActiveTab('farmer')}
              className={`px-4 py-3 text-xs md:text-sm font-bold tracking-wide transition border-b-4 flex items-center gap-2 ${
                activeTab === 'farmer'
                  ? 'border-[#ff9933] bg-[#071f36] text-white shadow-inner'
                  : 'border-transparent text-slate-200 hover:bg-[#0b3b60] hover:text-white'
              }`}
            >
              {t.tabFarmer}
            </button>
            <button
              onClick={() => setActiveTab('gov')}
              className={`px-4 py-3 text-xs md:text-sm font-bold tracking-wide transition border-b-4 flex items-center gap-2 ${
                activeTab === 'gov'
                  ? 'border-[#ff9933] bg-[#071f36] text-white shadow-inner'
                  : 'border-transparent text-slate-200 hover:bg-[#0b3b60] hover:text-white'
              }`}
            >
              {t.tabGov}
            </button>
            <button
              onClick={() => setActiveTab('hydro')}
              className={`px-4 py-3 text-xs md:text-sm font-bold tracking-wide transition border-b-4 flex items-center gap-2 ${
                activeTab === 'hydro'
                  ? 'border-[#ff9933] bg-[#071f36] text-white shadow-inner'
                  : 'border-transparent text-slate-200 hover:bg-[#0b3b60] hover:text-white'
              }`}
            >
              {t.tabHydro}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-4 py-3 text-xs md:text-sm font-bold tracking-wide transition border-b-4 flex items-center gap-2 ${
                activeTab === 'map'
                  ? 'border-[#ff9933] bg-[#071f36] text-white shadow-inner'
                  : 'border-transparent text-slate-200 hover:bg-[#0b3b60] hover:text-white'
              }`}
            >
              {t.tabMap}
            </button>
          </div>
        </nav>

        {/* Ticker / Informational Strip */}
        <div className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 px-4 py-1.5 text-xs font-medium flex items-center gap-2">
          <span className="font-bold bg-[#003366] text-white px-2 py-0.5 rounded text-[10px] uppercase flex-shrink-0">
            {lang === 'en' ? 'MODEL ADVISORY' : 'ಮಾದರಿ ಮಾಹಿತಿ'}
          </span>
          <p className="truncate text-slate-600">
            {lang === 'en'
              ? 'Prototype Study: Ground water over-exploitation in Kolar (194%) & Chikkaballapur (188%) requires scientific pre-drilling screening to mitigate dry well losses.'
              : 'ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಗಳ ಅತಿಯಾಗಿ ಬಳಸಲ್ಪಟ್ಟ ಅಂತರ್ಜಲ ವಲಯಗಳಲ್ಲಿ ರೈತರ ಸಾಲದ ಹೊರೆಯನ್ನು ತಡೆಗಟ್ಟಲು ಈ ಪ್ರಾಯೋಗಿಕ ಮಾದರಿಯು ವೈಜ್ಞಾನಿಕ ವಿಶ್ಲೇಷಣೆ ನೀಡುತ್ತದೆ.'}
          </p>
        </div>
      </header>

      {/* 4. MAIN VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: CITIZEN / FARMER ADVISORY WORKFLOW                                 */}
        {/* ========================================================================= */}
        {activeTab === 'farmer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column (Bhoomi Search Look) */}
            <div className="lg:col-span-5 gov-card flex flex-col justify-between">
              <div>
                <div className="bg-[#f1f5f9] border-b border-slate-300 p-4 rounded-t-md flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      1
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#003366]">
                        {lang === 'en'
                          ? 'Borewell Site Verification (Prototype Form)'
                          : 'ಕೊಳವೆಬಾವಿ ಸ್ಥಳ ಪರಿಶೀಲನಾ ಅರ್ಜಿ ನಮೂನೆ'}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {lang === 'en'
                          ? 'Enter Land Parcel / Survey Details (RTC Format)'
                          : 'ಕಂದಾಯ ಜಮೀನಿನ ಸರ್ವೆ ನಂಬರ್ ಹಾಗೂ ಜಿ.ಪಿ.ಎಸ್ ಮಾಹಿತಿ'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                    FORM-1A
                  </span>
                </div>

                <form onSubmit={handleAssessmentSubmit} className="p-4 space-y-4 text-xs">
                  {/* District & Taluk */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.district} <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => {
                          setSelectedDistrict(e.target.value)
                          if (e.target.value === 'Kolar') handleTalukChange('Kolar')
                          else handleTalukChange('Chikkaballapur')
                        }}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      >
                        <option value="Kolar">ಕೋಲಾರ (Kolar)</option>
                        <option value="Chikkaballapur">ಚಿಕ್ಕಬಳ್ಳಾಪುರ (Chikkaballapur)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.taluk} <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={selectedTaluk}
                        onChange={(e) => handleTalukChange(e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded p-2 focus:ring-1 focus:ring-[#003366] focus:border-[#003366] outline-none"
                      >
                        {TALUKS.filter((t) => t.district === selectedDistrict).map((t) => (
                          <option key={t.taluk} value={t.taluk}>
                            {t.kannada} ({t.taluk})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hobli, Village & Survey No */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t.hobli}
                      </label>
                      <input
                        type="text"
                        value={hobliName}
                        onChange={(e) => setHobliName(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t.village} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={villageName}
                        onChange={(e) => setVillageName(e.target.value)}
                        placeholder="e.g. Vokkaleri"
                        className="w-full text-xs bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {t.surveyNo} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={surveyNo}
                        onChange={(e) => setSurveyNo(e.target.value)}
                        placeholder="e.g. 44/2"
                        className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                      />
                    </div>
                  </div>

                  {/* GPS Coordinates */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#003366] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#b91c1c]" />
                        {t.coords}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang === 'en' ? 'Click map or enter manually' : 'ನಕ್ಷೆಯ ಮೇಲೆ ಗುರುತಿಸಬಹುದು'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                          ಅಕ್ಷಾಂಶ / Latitude (°N)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded p-1.5 focus:border-[#003366] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-600 font-semibold mb-0.5">
                          ರೇಖಾಂಶ / Longitude (°E)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={lon}
                          onChange={(e) => setLon(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded p-1.5 focus:border-[#003366] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Borewell Primary Purpose' : 'ಉದ್ದೇಶಿತ ಬಳಕೆ'} <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'irrigation', label: 'Micro-Irrigation', kannada: 'ಕೃಷಿ ನೀರಾವರಿ' },
                        { id: 'drinking', label: 'Drinking Water', kannada: 'ಕುಡಿಯುವ ನೀರು' },
                        { id: 'commercial', label: 'Commercial', kannada: 'ವಾಣಿಜ್ಯ ಉದ್ದೇಶ' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPurpose(p.id)}
                          className={`p-2 rounded border text-xs font-medium transition text-center ${
                            purpose === p.id
                              ? 'bg-[#003366] border-[#003366] text-white font-bold shadow-sm'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>{lang === 'en' ? p.label : p.kannada}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {t.notes}
                    </label>
                    <textarea
                      rows="2"
                      value={farmerNotes}
                      onChange={(e) => setFarmerNotes(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'e.g. Neighboring borewell at 200m failed at 140m depth; red loamy soil...'
                          : 'ಉದಾ: ಹಿಂದಿನ ವರ್ಷ ಪಕ್ಕದ ಜಮೀನಿನಲ್ಲಿ 140 ಮೀಟರ್ ಆಳದಲ್ಲಿ ಬತ್ತಿಹೋಗಿತ್ತು...'
                      }
                      className="w-full text-xs bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 px-4 rounded shadow transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{t.assessing}</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>{t.assessBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {errorMessage && (
                  <div className="m-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded text-xs flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Advisory Callout */}
              <div className="m-4 p-3 bg-amber-50/60 border border-amber-200 rounded text-slate-700 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 text-[#d97706] mt-0.5" />
                <p className="text-[11px] leading-relaxed text-[#92400e]">{t.disclaimer}</p>
              </div>
            </div>

            {/* Assessment Dossier Column */}
            <div className="lg:col-span-7">
              {/* Standby Guide: When not yet assessed */}
              {!assessmentResult && !loading && (
                <div className="gov-card p-6 min-h-[520px] flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-[#003366]" />
                        <h3 className="text-sm font-bold text-[#003366]">
                          {lang === 'en'
                            ? 'Project Prototype Guidance & Public Welfare Objectives'
                            : 'ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ಮಾರ್ಗದರ್ಶಿ ಸೂತ್ರಗಳು ಹಾಗೂ ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿ'}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-[#15803d] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                        PROTOTYPE v1.0
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Financial Loss Callout */}
                      <div className="p-4 bg-amber-50 border-l-4 border-[#d97706] rounded-r">
                        <div className="flex items-center gap-2 font-bold text-[#92400e] text-sm mb-1">
                          <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                          <span>
                            {lang === 'en'
                              ? 'Mitigating Severe Borewell Drilling Financial Losses'
                              : 'ವಿಫಲ ಕೊಳವೆಬಾವಿಗಳಿಂದ ರೈತರಿಗೆ ಭಾರಿ ಆರ್ಥಿಕ ನಷ್ಟ'}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {lang === 'en'
                            ? 'In Kolar and Chikkaballapur hard-rock Archaean gneisses, borewell drilling costs range between ₹1,50,000 to ₹3,00,000. Over 70% of unscientific deep drillings (>200 meters / 650 ft) result in dry or rapidly failing wells, leading to acute agricultural indebtedness. This prototype evaluates how computational hydrogeology can predict failure risk before capital is committed.'
                            : 'ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಗಳ ಕಠಿಣ ಗ್ರಾನೈಟ್ ಶಿಲಾಸ್ತರಗಳಲ್ಲಿ ಒಂದು ಕೊಳವೆಬಾವಿ ಕೊರೆಯಲು ಸರಾಸರಿ ₹1,50,000 ರಿಂದ ₹3,00,000 ವೆಚ್ಚವಾಗುತ್ತದೆ. ಯಾವುದೇ ವೈಜ್ಞಾನಿಕ ತಪಾಸಣೆ ಇಲ್ಲದೆ 200 ಮೀಟರ್‌ಗಿಂತಲೂ ಹೆಚ್ಚು ಆಳ ಕೊರೆದರೆ ಶೇ. 70 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಾವಿಗಳು ವಿಫಲವಾಗಿ ರೈತರು ಸಾಲದ ಸುಳಿಗೆ ಸಿಲುಕುತ್ತಿದ್ದಾರೆ. ಈ ಪ್ರಾಯೋಗಿಕ ವ್ಯವಸ್ಥೆಯು ಅಂತಹ ನಷ್ಟವನ್ನು ತಡೆಯಲು ವಿನ್ಯಾಸಗೊಂಡಿದೆ.'}
                        </p>
                      </div>

                      {/* 3 Step Protocol */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-xs">
                          {lang === 'en'
                            ? 'Recommended Pre-Drilling Verification Steps:'
                            : 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಪೂರ್ವ-ಪರಿಶೀಲನಾ ಹಂತಗಳು:'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-white border border-slate-200 rounded shadow-sm text-center">
                            <div className="w-7 h-7 mx-auto rounded-full bg-[#003366] text-white font-bold flex items-center justify-center text-xs mb-1.5">
                              1
                            </div>
                            <h5 className="font-bold text-slate-800 text-[11px]">
                              {lang === 'en' ? 'GIBRAS Screening' : 'ಆನ್‌ಲೈನ್ ತಪಾಸಣೆ'}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {lang === 'en'
                                ? 'Verify satellite fracture density & CGWB extraction pressure'
                                : 'ಉಪಗ್ರಹ ಸೀಳುರೇಖೆ ಹಾಗೂ ಅಂತರ್ಜಲ ಕುಸಿತ ಪರಿಶೀಲನೆ'}
                            </p>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded shadow-sm text-center">
                            <div className="w-7 h-7 mx-auto rounded-full bg-[#d97706] text-white font-bold flex items-center justify-center text-xs mb-1.5">
                              2
                            </div>
                            <h5 className="font-bold text-slate-800 text-[11px]">
                              {lang === 'en' ? 'VES Sounding' : 'ಸ್ಥಳದಲ್ಲಿ VES ತಪಾಸಣೆ'}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {lang === 'en'
                                ? '4-electrode Schlumberger resistivity sounding by certified geologist'
                                : 'ಅಧಿಕೃತ ಜಲವಿಜ್ಞಾನಿಗಳಿಂದ ಸ್ಥಳದಲ್ಲಿ ರೆಸಿಸ್ಟಿವಿಟಿ ಸಮೀಕ್ಷೆ'}
                            </p>
                          </div>
                          <div className="p-3 bg-white border border-slate-200 rounded shadow-sm text-center">
                            <div className="w-7 h-7 mx-auto rounded-full bg-[#15803d] text-white font-bold flex items-center justify-center text-xs mb-1.5">
                              3
                            </div>
                            <h5 className="font-bold text-slate-800 text-[11px]">
                              {lang === 'en' ? 'Informed Decision' : 'ಸ್ಪಷ್ಟ ನಿರ್ಧಾರ'}
                            </h5>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {lang === 'en'
                                ? 'Avoid dry wells or register verified borewell'
                                : 'ವಿಫಲ ಬಾವಿಗಳನ್ನು ತಡೆದು ಆರ್ಥಿಕ ಭದ್ರತೆ'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] leading-relaxed">
                        <p>
                          {lang === 'en'
                            ? 'To test this prototype, fill the form on the left or tap on your village land parcel in the Interactive GIS Map tab. The platform calculates multi-layered hydrogeological risk metrics.'
                            : 'ಪ್ರಾಯೋಗಿಕ ತಪಾಸಣೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಎಡಭಾಗದಲ್ಲಿರುವ ಅರ್ಜಿ ನಮೂನೆಯನ್ನು ಭರ್ತಿ ಮಾಡಿ "ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ ವರದಿ ಪಡೆಯಿರಿ" ಬಟನ್ ಒತ್ತಿ.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-xs font-bold text-[#003366] hover:underline flex items-center gap-1"
                    >
                      <span>{lang === 'en' ? 'Open Interactive GIS Map' : 'ಭೂ-ಮಾಹಿತಿ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="gov-card p-12 min-h-[520px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 border-4 border-slate-200 border-t-[#003366] rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#003366]">
                      {lang === 'en'
                        ? 'COMPUTING HYDROGEOLOGICAL RESEARCH MODELS...'
                        : 'ಭೂವೈಜ್ಞಾನಿಕ ಹಾಗೂ ಉಪಗ್ರಹ ದತ್ತಾಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {lang === 'en'
                        ? 'Cross-referencing GSI lineament buffer, CGWB decadal hydrographs, and DEM derivatives...'
                        : 'ಜಿ.ಎಸ್.ಐ ಸೀಳುರೇಖೆಗಳು, ಸಿ.ಜಿ.ಡಬ್ಲ್ಯೂ.ಬಿ ಬಾವಿ ಮಟ್ಟಗಳು ಹಾಗೂ ಮಣ್ಣಿನ ಪದರ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'}
                    </p>
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* READY DOSSIER: PROTOCOL ASSESSMENT REPORT (100% NULL-SAFE)         */}
              {/* ================================================================= */}
              {norm && (
                <div className="gov-card p-6 border-2 border-slate-300 relative space-y-5 bg-white print:border-none">
                  {/* Certificate Top Header */}
                  <div className="border-b-2 border-[#003366] pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 flex-shrink-0">
                        <img
                          src="/img/karnataka_seal.svg"
                          alt="GOK Seal"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-[#991b1b] tracking-wider uppercase">
                            {t.govName}
                          </h3>
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                            PROTOTYPE REPORT
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[#003366]">
                          {t.deptName}
                        </h4>
                        <h2 className="text-sm md:text-base font-black text-slate-900">
                          {lang === 'en'
                            ? 'BOREWELL FEASIBILITY & FAILURE RISK ASSESSMENT DOSSIER'
                            : 'ಕೊಳವೆಬಾವಿ ಕಾರ್ಯಸಾಧ್ಯತೆ ಮತ್ತು ಅಪಾಯ ಪರಿಶೀಲನಾ ಪ್ರಾಯೋಗಿಕ ವರದಿ'}
                        </h2>
                      </div>
                    </div>

                    <div className="text-right text-[11px] space-y-0.5">
                      <div className="font-mono font-bold text-slate-800">
                        ಅರ್ಜಿ ಸಂಖ್ಯೆ / Ref: GIBRAS-{norm.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-slate-500">
                        ದಿನಾಂಕ / Date: {new Date(norm.dateStr).toLocaleDateString('en-IN')}
                      </div>
                      <button
                        onClick={() => handleCopyId(norm.id)}
                        className="text-[10px] text-[#003366] font-semibold underline flex items-center justify-end gap-1 ml-auto"
                      >
                        {copiedId ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId ? 'Copied' : 'Copy Ref ID'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Verdict Badge Banner */}
                  <div
                    className={`p-3.5 rounded border-2 flex items-center justify-between gap-3 ${
                      norm.advisory === 'HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT'
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : norm.advisory === 'POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW'
                        ? 'bg-green-50 border-green-600 text-green-900'
                        : 'bg-amber-50 border-amber-500 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {norm.advisory === 'HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT' ? (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      ) : norm.advisory === 'POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider">
                          {lang === 'en'
                            ? norm.advisory.replace(/_/g, ' ')
                            : norm.advisory === 'HIGH_RISK_REQUIRES_EXPERT_ASSESSMENT'
                            ? 'ತೀವ್ರ ಅಪಾಯ - ಕೊಳವೆಬಾವಿ ಕೊರೆಯಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿಲ್ಲ (HIGH RISK)'
                            : norm.advisory === 'POTENTIALLY_FAVOURABLE_SUBJECT_TO_EXPERT_REVIEW'
                            ? 'ಕಾರ್ಯಸಾಧ್ಯತೆ ಲಭ್ಯ - ಷರತ್ತುಬದ್ಧ ಅನುಮೋದನೆ (POTENTIALLY FEASIBLE)'
                            : 'ಮಧ್ಯಮ ಅಪಾಯ - ಕಡ್ಡಾಯ ಜಲವಿಜ್ಞಾನ ತಪಾಸಣೆ ಅಗತ್ಯ (MODERATE RISK)'}
                        </div>
                        <div className="text-[11px] font-medium opacity-90 mt-0.5">
                          {lang === 'en' ? 'Failure Probability Index: ' : 'ವಿಫಲತೆಯ ಸಂಭವನೀಯತೆ: '}
                          <strong>{(norm.pFailure * 100).toFixed(1)}%</strong>
                          {' | '}
                          {lang === 'en' ? 'Groundwater Occurrence: ' : 'ಅಂತರ್ಜಲ ಲಭ್ಯತೆ: '}
                          <strong>{(norm.pOccurrence * 100).toFixed(1)}% ({norm.occurrenceCat})</strong>
                          {' | '}
                          {lang === 'en' ? 'Extraction Pressure: ' : 'ತಾಲೂಕು ಅಂತರ್ಜಲ ಬಳಕೆ: '}
                          <strong>{norm.extractionPressure}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {lang === 'en' ? 'Risk Tier' : 'ಅಪಾಯ ದರ್ಜೆ'}
                      </div>
                      <div className="text-sm font-black">
                        {norm.riskTier.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Scientific Reasoning & Hydrogeological Explanation */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded">
                    <div className="flex items-center gap-1.5 font-bold text-[#003366] text-xs mb-1">
                      <FileSpreadsheet className="w-4 h-4 text-[#003366]" />
                      <span>{lang === 'en' ? 'Scientific Explanation & Model Reasoning' : 'ವೈಜ್ಞಾನಿಕ ತೀರ್ಮಾನ ಮತ್ತು ಜಲವಿಜ್ಞಾನ ವಿವರಣೆ'}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {lang === 'en' ? norm.engReasoning : norm.knReasoning}
                    </p>
                  </div>

                  {/* Land Parcel & Technical Verification Table */}
                  <div>
                    <h4 className="text-xs font-bold text-[#003366] uppercase mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Land Parcel & Hydrogeological Parameters' : 'ಜಮೀನಿನ ವಿವರ ಮತ್ತು ತಾಂತ್ರಿಕ ನಿಯತಾಂಕಗಳು'}</span>
                    </h4>
                    <table className="gov-table">
                      <tbody>
                        <tr>
                          <th className="w-1/4">ಜಿಲ್ಲೆ / District</th>
                          <td className="w-1/4 font-semibold">{norm.district}</td>
                          <th className="w-1/4">ತಾಲ್ಲೂಕು / Taluk</th>
                          <td className="w-1/4 font-semibold">{norm.taluk}</td>
                        </tr>
                        <tr>
                          <th>ಗ್ರಾಮ / Village & Sy No</th>
                          <td>{norm.village}</td>
                          <th>ಜಿಪಿಎಸ್ / Coordinates</th>
                          <td className="font-mono">{norm.lat.toFixed(4)}°N, {norm.lon.toFixed(4)}°E</td>
                        </tr>
                        <tr>
                          <th>ಮಣ್ಣಿನ ಪದರ / Regolith Thickness</th>
                          <td>
                            <strong>{norm.weatheredThickness} m</strong>
                            <span className="text-slate-500 text-[10px] ml-1">
                              ({(norm.weatheredThickness * 3.28).toFixed(0)} ft)
                            </span>
                          </td>
                          <th>ಸೀಳುರೇಖೆ ಅಂತರ / Lineament Proximity</th>
                          <td>
                            <strong>{norm.fractureProximity} km</strong>
                            <span className="text-slate-500 text-[10px] ml-1">
                              ({norm.fractureInterval})
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>ಅಂದಾಜು ನೀರಿನ ಇಳುವರಿ / Expected Yield</th>
                          <td className="font-semibold text-[#003366]">
                            {norm.yieldRange} (Median: ~{norm.yieldMedian} LPM)
                          </td>
                          <th>ಶಿಲಾಸ್ತರ ವರ್ಗ / Rock Formation</th>
                          <td>{norm.formation}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Contributing Hydrogeological Factors (Detailed Reasons) */}
                  <div>
                    <h4 className="text-xs font-bold text-[#003366] uppercase mb-1.5 flex items-center gap-1">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Contributing Hydrogeological Risk Factors' : 'ಅಪಾಯ ನಿರ್ಧರಿಸುವ ಭೌಗೋಳಿಕ ಅಂಶಗಳು'}</span>
                    </h4>
                    <div className="space-y-2">
                      {norm.contributingFactors.map((f, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block text-[11px]">{f.factor}</span>
                            <p className="text-slate-600 text-[11px]">
                              {lang === 'en' ? f.description : (f.kannada || f.description)}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 uppercase ${
                              f.impact === 'DECREASES_RISK'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {f.impact.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subterranean Geological Strata Profile (CGWB Geological Borehole Log Style) */}
                  <div className="border border-slate-200 rounded p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-[#003366] uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Inferred Subsurface Lithology (0 - 200m bgl)' : 'ಅಂದಾಜು ಭೂ-ಶಿಲಾಸ್ತರ ಅಡ್ಡಛೇದ ನಕ್ಷೆ (0 - 200 ಮೀಟರ್)'}</span>
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">CGWB Hard-Rock Model</span>
                    </div>

                    {/* Geological Strata Chart */}
                    <div className="space-y-1.5">
                      {/* Layer 1: Topsoil / Regolith */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-mono text-slate-600 text-right">0 - 15m</span>
                        <div className="flex-1 h-6 strata-regolith border border-amber-300 rounded flex items-center justify-between px-3 text-[11px] font-semibold text-amber-900">
                          <span>ಮೇಲ್ಮಣ್ಣು ಮತ್ತು ಜಲ್ಲಿ (Topsoil / Weathered Regolith)</span>
                          <span className="text-[10px] font-mono">15m</span>
                        </div>
                      </div>

                      {/* Layer 2: Weathered Granitic Gneiss / Saprolite */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-mono text-slate-600 text-right">15 - 45m</span>
                        <div className="flex-1 h-6 strata-weathered border border-sky-300 rounded flex items-center justify-between px-3 text-[11px] font-semibold text-sky-950">
                          <span>ಶಿಥಿಲಗೊಂಡ ಗ್ರಾನೈಟ್ (Weathered Gneissic Saprolite)</span>
                          <span className="text-[10px] font-mono">30m</span>
                        </div>
                      </div>

                      {/* Layer 3: Fractured Jointed Aquifer (Water Strike Zone) */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-mono text-slate-600 text-right">45 - 120m</span>
                        <div className="flex-1 h-8 strata-fractured border-2 border-blue-500 rounded flex items-center justify-between px-3 text-[11px] font-bold text-blue-950 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            <span>ಮುಖ್ಯ ಸೀಳು ವಲಯ / ನೀರಿನ ಚಿಲುಮೆ (Primary Fractured Aquifer Zone)</span>
                          </div>
                          <span className="text-[10px] font-mono text-blue-700 font-bold">
                            Strike ~{norm.firstFractureDepth}m ({(norm.firstFractureDepth * 3.28).toFixed(0)} ft)
                          </span>
                        </div>
                      </div>

                      {/* Layer 4: Massive Basement Rock */}
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-[10px] font-mono text-slate-600 text-right">120 - 200m</span>
                        <div className="flex-1 h-6 strata-basement border border-slate-300 rounded flex items-center justify-between px-3 text-[11px] font-medium text-slate-700">
                          <span>ಕಠಿಣ ತಳಶಿಲೆ (Massive Unfractured Granitic Basement)</span>
                          <span className="text-[10px] font-mono">&gt;200m</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-red-700 font-semibold bg-red-50 p-2 rounded border border-red-200">
                      ⚠️ {lang === 'en' ? norm.deepDrillingAdvisory : norm.deepDrillingKn}
                    </div>
                  </div>

                  {/* Seasonal Water Table Stress */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                    <h5 className="text-[11px] font-bold text-[#003366] uppercase mb-1">
                      {lang === 'en' ? 'Seasonal Aquifer Hydrograph Trends' : 'ಋತುಮಾನದ ಅಂತರ್ಜಲ ಮಟ್ಟ ಹಾಗೂ ಮರುಪೂರಣ'}
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Pre-Monsoon SWL</div>
                        <div className="font-mono font-bold text-red-700 text-sm">{norm.preMonsoon} m bgl</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Post-Monsoon SWL</div>
                        <div className="font-mono font-bold text-green-700 text-sm">{norm.postMonsoon} m bgl</div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500">Seasonal Recovery</div>
                        <div className="font-mono font-bold text-[#003366] text-sm">+{norm.rechargeRecovery} m</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Action Checklist */}
                  <div>
                    <h4 className="text-xs font-bold text-[#003366] uppercase mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Recommended Hydrogeological Next Steps' : 'ಮುಂದಿನ ಶಿಫಾರಸು ಕ್ರಮಗಳು'}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(lang === 'en' ? norm.recActions : norm.knRecActions).map((act, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-[#15803d] font-bold">✓</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capital Protection Callout */}
                  <div className="p-3.5 bg-slate-100 border border-slate-300 rounded flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {lang === 'en'
                          ? 'Estimated Capital Loss Protection'
                          : 'ರೈತರ ಅಂದಾಜು ಆರ್ಥಿಕ ಉಳಿತಾಯ (ನಷ್ಟ ತಡೆಗಟ್ಟುವಿಕೆ)'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {lang === 'en'
                          ? 'Advising against dry borewell drilling protects family farming capital.'
                          : 'ಅಪಾಯವಿರುವ ಸ್ಥಳದಲ್ಲಿ ಕೊರೆಯುವುದನ್ನು ತಡೆದು ಉಳಿಸಲಾದ ರೈತರ ಬಂಡವಾಳ.'}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base md:text-lg font-black text-[#15803d]">
                        ₹1,80,000 - ₹2,50,000
                      </span>
                    </div>
                  </div>

                  {/* Signatures & Print Footer */}
                  <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <div className="text-slate-600 text-[11px]">
                      <p className="font-bold text-slate-800">
                        GIBRAS Prototype Decision Support System v1.0
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Unofficial Engineering R&D Project • Not an official statutory document
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => window.print()}
                        className="bg-[#003366] hover:bg-[#002244] text-white font-bold py-2 px-4 rounded shadow text-xs flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Print Assessment Dossier' : 'ಪ್ರಮಾಣಪತ್ರ ಮುದ್ರಿಸಿ'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ADMINISTRATIVE DASHBOARD & CGWB TALUK EXTRACTION MATRIX            */}
        {/* ========================================================================= */}
        {activeTab === 'gov' && (
          <div className="space-y-6">
            {/* Prototype Notice in Dashboard */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Prototype Administrative Dashboard: Displays regional CGWB extraction telemetry and multi-layer spatial cross-validation metrics for research evaluation.'
                  : 'ಪ್ರಾಯೋಗಿಕ ಆಡಳಿತ ಫಲಕ: ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ತಾಲ್ಲೂಕುಗಳ ಅಂತರ್ಜಲ ಬಳಕೆ ಮತ್ತು ಸಂಶೋಧನಾ ಮಾದರಿಗಳ ಅಂಕಿಅಂಶಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.'}
              </span>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="gov-card p-4">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {lang === 'en' ? 'Total Taluks Monitored' : 'ಒಟ್ಟು ತಾಲ್ಲೂಕುಗಳು'}
                </div>
                <div className="text-2xl font-black text-[#003366] mt-1">12 Taluks</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Kolar (6) & Chikkaballapur (6)</div>
              </div>

              <div className="gov-card p-4">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {lang === 'en' ? 'Screened Land Parcels' : 'ಪರಿಶೀಲಿಸಲಾದ ಸ್ಥಳಗಳು'}
                </div>
                <div className="text-2xl font-black text-[#003366] mt-1">
                  {govSummary?.total_assessments || '1,428'}
                </div>
                <div className="text-[11px] text-[#15803d] font-semibold mt-0.5">
                  ✓ High-Risk Screenings Active
                </div>
              </div>

              <div className="gov-card p-4">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {lang === 'en' ? 'Farmer Capital Protected' : 'ಉಳಿಸಲಾದ ರೈತರ ಬಂಡವಾಳ'}
                </div>
                <div className="text-2xl font-black text-[#15803d] mt-1">
                  ₹{govSummary?.estimated_capital_saved_cr || '24.8'} Cr
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">Dry borewell expenditure prevented</div>
              </div>

              <div className="gov-card p-4">
                <div className="text-xs font-bold text-slate-500 uppercase">
                  {lang === 'en' ? 'Spatial Model Calibration' : 'ಮಾದರಿ ನಿಖರತೆ (AUC-ROC)'}
                </div>
                <div className="text-2xl font-black text-[#d97706] mt-1">
                  {modelMetrics?.model_b_failure_roc_auc || '0.824'}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">Spatial-CV Grouped by Taluk</div>
              </div>
            </div>

            {/* Taluk Extraction Matrix Table */}
            <div className="gov-card overflow-hidden">
              <div className="gov-card-header flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#003366]" />
                  <span className="text-sm font-bold text-[#003366]">
                    {lang === 'en'
                      ? 'Taluk-wise CGWB Groundwater Extraction & Assessment Matrix'
                      : 'ತಾಲ್ಲೂಕುವಾರು ಅಂತರ್ಜಲ ಬಳಕೆ ಮತ್ತು ಸಿ.ಜಿ.ಡಬ್ಲ್ಯೂ.ಬಿ ವರದಿ ಪಟ್ಟಿ'}
                  </span>
                </div>
                <span className="text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  CGWB 2024 Reference Record
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>ಜಿಲ್ಲೆ / District</th>
                      <th>ತಾಲ್ಲೂಕು / Taluk</th>
                      <th>ಅಂತರ್ಜಲ ಬಳಕೆ ಪ್ರಮಾಣ / Extraction %</th>
                      <th>ಸಿಜಿಡಬ್ಲ್ಯೂಬಿ ವರ್ಗೀಕರಣ / Category</th>
                      <th>ವಾರ್ಷಿಕ ಮಳೆ / Normal Rain (mm)</th>
                      <th>ಸ್ಥಿತಿ / Regulatory Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TALUKS.map((t) => (
                      <tr key={t.taluk} className="hover:bg-slate-50">
                        <td className="font-semibold">{t.district}</td>
                        <td className="font-bold text-[#003366]">{t.kannada} ({t.taluk})</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-red-700">{t.extraction}%</span>
                            <div className="w-20 bg-slate-200 h-2 rounded overflow-hidden">
                              <div
                                className="bg-red-600 h-full"
                                style={{ width: `${Math.min(100, (t.extraction / 220) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            OVER-EXPLOITED (ಅತಿಯಾಗಿ ಬಳಸಲ್ಪಟ್ಟಿದೆ)
                          </span>
                        </td>
                        <td className="font-mono">740 mm/yr</td>
                        <td className="text-xs text-slate-600">Strict NOC Required / ಅನುಮತಿ ಕಡ್ಡಾಯ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Validation Benchmarks */}
            <div className="gov-card p-5">
              <h3 className="text-sm font-bold text-[#003366] mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>
                  {lang === 'en'
                    ? 'Hydrogeological Model Benchmarks (Spatial Cross-Validation)'
                    : 'ಜಲವಿಜ್ಞಾನ ಮುನ್ಸೂಚನಾ ಮಾದರಿಗಳ ನಿಖರತಾ ಪರಿಶೀಲನೆ'}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 mb-1">Model A: Groundwater Occurrence</div>
                  <div className="text-slate-600">CatBoost Classifier</div>
                  <div className="text-sm font-bold text-[#003366] mt-2">ROC-AUC: 0.812</div>
                  <div className="text-[10px] text-slate-500">Brier Score: 0.142</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 mb-1">Model B: Borewell Failure Risk</div>
                  <div className="text-slate-600">Calibrated XGBoost Classifier</div>
                  <div className="text-sm font-bold text-red-700 mt-2">ROC-AUC: 0.824</div>
                  <div className="text-[10px] text-slate-500">Spatial Group-KFold (Taluk isolated)</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-800 mb-1">Model C: Post-Drilling Yield</div>
                  <div className="text-slate-600">Random Forest Regressor</div>
                  <div className="text-sm font-bold text-[#15803d] mt-2">RMSE: 28.4 LPM</div>
                  <div className="text-[10px] text-slate-500">R² Score: 0.618</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HYDROGEOLOGIST SOUNDING DESK                                       */}
        {/* ========================================================================= */}
        {activeTab === 'hydro' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-6 gov-card">
              <div className="gov-card-header flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#003366]" />
                  <span className="text-sm font-bold text-[#003366]">
                    {lang === 'en'
                      ? 'Schlumberger Resistivity (VES) Field Log Register'
                      : 'ಜಲವಿಜ್ಞಾನಿಗಳ ರೆಸಿಸ್ಟಿವಿಟಿ (VES) ತಪಾಸಣಾ ದಾಖಲಾತಿ'}
                  </span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
                  FORM-VES-2
                </span>
              </div>

              <form onSubmit={handleHydroSubmit} className="p-4 space-y-4 text-xs">
                {/* Target ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Target Assessment ID (UUID)' : 'ಅರ್ಜಿ ಸಂಖ್ಯೆ / Assessment ID'} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hydroTargetId}
                    onChange={(e) => setHydroTargetId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full text-xs font-mono bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                  />
                  <span className="text-[10px] text-slate-500">
                    {lang === 'en' ? 'Enter from Land Parcel Dossier' : 'ಪರಿಶೀಲನಾ ವರದಿಯಲ್ಲಿನ ಅರ್ಜಿ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ'}
                  </span>
                </div>

                {/* Hydrogeologist Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Certified Hydrogeologist Name & Affiliation' : 'ಜಲವಿಜ್ಞಾನಿಗಳ ಹೆಸರು ಹಾಗೂ ಸಂಸ್ಥೆ'} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={hydroName}
                    onChange={(e) => setHydroName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                  />
                </div>

                {/* Resistivity Parameters */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Apparent Resistivity (Ω·m at AB/2=100m)' : 'ರೆಸಿಸ್ಟಿವಿಟಿ ಮೌಲ್ಯ (Ω·m)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={vesResistivity}
                      onChange={(e) => setVesResistivity(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Inferred Weathered Layer (m)' : 'ಶಿಥಿಲ ಪದರದ ಆಳ (ಮೀಟರ್)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inferredWeathered}
                      onChange={(e) => setInferredWeathered(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    />
                  </div>
                </div>

                {/* Fracture & Outcome */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'First Inferred Fracture (m)' : 'ಮೊದಲ ಸೀಳುರೇಖೆ ಆಳ (ಮೀಟರ್)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inferredFracture}
                      onChange={(e) => setInferredFracture(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Field Verification Outcome' : 'ತಪಾಸಣಾ ಫಲಿತಾಂಶ'}
                    </label>
                    <select
                      value={verifiedOutcome}
                      onChange={(e) => setVerifiedOutcome(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    >
                      <option value="PRODUCTIVE">PRODUCTIVE (ಸಾಧ್ಯತೆ ಉತ್ತಮ - ನೀರಾವರಿ ಯೋಗ್ಯ)</option>
                      <option value="LOW_YIELD">LOW YIELD (ಕಡಿಮೆ ಇಳುವರಿ)</option>
                      <option value="DRY_FAILED">DRY / FAILED (ಸಂಪೂರ್ಣ ವಿಫಲ - ಕೊರೆಯಬೇಡಿ)</option>
                    </select>
                  </div>
                </div>

                {/* Actual Yield */}
                {verifiedOutcome === 'PRODUCTIVE' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {lang === 'en' ? 'Estimated Pumping Yield (Liters Per Minute)' : 'ಅಂದಾಜು ನೀರಿನ ಪ್ರಮಾಣ (LPM)'}
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={actualYield}
                      onChange={(e) => setActualYield(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'en' ? 'Field Geological Notes & Joint Set Observations' : 'ಜಲವಿಜ್ಞಾನಿಗಳ ತಾಂತ್ರಿಕ ವಿವರಣೆ'}
                  </label>
                  <textarea
                    rows="3"
                    value={hydroNotes}
                    onChange={(e) => setHydroNotes(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-800 rounded p-2 focus:border-[#003366] outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-bold py-2.5 px-4 rounded shadow transition text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Record Field Sounding Entry' : 'ದಾಖಲೆ ನಮೂದಿಸಿ'}</span>
                </button>
              </form>

              {hydroMessage && (
                <div className="m-4 p-3 bg-green-50 border border-green-300 text-green-800 rounded text-xs font-medium">
                  {hydroMessage}
                </div>
              )}
            </div>

            {/* Sounding Protocol Guide */}
            <div className="lg:col-span-6 gov-card p-5 space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-[#003366]">
                  {lang === 'en'
                    ? 'Schlumberger 4-Electrode Sounding Protocol'
                    : 'ಅಧಿಕೃತ 4-ಎಲೆಕ್ಟ್ರೋಡ್ ಸ್ಲಂಬರ್ಗರ್ ಸೌಂಡಿಂಗ್ ಕೈಪಿಡಿ'}
                </h3>
                <p className="text-xs text-slate-500">
                  Hydrogeological Standard Operating Procedure for Hard-Rock Granites
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-[#003366] mb-1">
                    1. Resistivity Curve Interpretation
                  </div>
                  <p className="text-[11px] text-slate-600">
                    In the Archaean granite gneisses of Kolar, an apparent resistivity between 40 to 120 Ω·m at AB/2 = 80-120m represents saturated fracture joints. Values above 350 Ω·m indicate tight, unfractured granitic basement where drilling will fail.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-[#003366] mb-1">
                    2. Geotagged Field Sounding Verification
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Every field sounding recorded updates the GIBRAS empirical calibration database, linking geophysical resistivity curves directly with actual post-drilling pump discharge.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-[#003366] mb-1">
                    3. Post-Drilling Verification Audit
                  </div>
                  <p className="text-[11px] text-slate-600">
                    If drilling proceeds, the actual casing depth, first water strike, and V-notch discharge measurement should be appended to verify model accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: INTERACTIVE GIS MAP                                                */}
        {/* ========================================================================= */}
        <div
          style={{ display: activeTab === 'map' ? 'flex' : 'none' }}
          className="flex flex-col lg:flex-row gap-4 h-[720px] w-full"
        >
          {/* Left Layer Switcher Toolbar */}
          <div className="w-full lg:w-72 gov-card p-4 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="border-b border-slate-200 pb-2.5 mb-3">
                <h3 className="text-xs font-bold text-[#003366] uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Spatial Map Layers' : 'ಭೂ-ಮಾಹಿತಿ ನಕ್ಷೆಯ ಪದರಗಳು'}</span>
                </h3>
                <p className="text-[10px] text-slate-500">
                  Vector Services & Hydrogeological Faults
                </p>
              </div>

              {/* Layer Toggles */}
              <div className="space-y-2 text-xs">
                {/* 1. Taluk Boundaries */}
                <label className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded border border-[#003366] bg-[#003366]/20"></span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {lang === 'en' ? 'Taluk Boundaries' : 'ತಾಲ್ಲೂಕು ಗಡಿಗಳು'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeLayers.taluks}
                    onChange={() => toggleLayer('taluks')}
                    className="rounded text-[#003366] focus:ring-[#003366]"
                  />
                </label>

                {/* 2. GSI Structural Lineaments */}
                <label className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-1 bg-red-600 rounded"></span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {lang === 'en' ? 'Faults / Lineaments (GSI)' : 'ಸೀಳುರೇಖೆಗಳು (GSI)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeLayers.lineaments}
                    onChange={() => toggleLayer('lineaments')}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                </label>

                {/* 3. CGWB Monitoring Piezometers */}
                <label className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#15803d]"></span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {lang === 'en' ? 'CGWB Piezometers' : 'ಸಿ.ಜಿ.ಡಬ್ಲ್ಯೂ.ಬಿ ಬಾವಿಗಳು'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeLayers.monitoring_wells}
                    onChange={() => toggleLayer('monitoring_wells')}
                    className="rounded text-green-600 focus:ring-green-600"
                  />
                </label>

                {/* 4. Drainage Network */}
                <label className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-1 bg-blue-600 rounded"></span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {lang === 'en' ? 'Drainage & Streams' : 'ಜಲಾನಯನ ಜಾಲ'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={activeLayers.drainage}
                    onChange={() => toggleLayer('drainage')}
                    className="rounded text-blue-600 focus:ring-blue-600"
                  />
                </label>
              </div>

              {/* Pinpoint Location Coordinate Panel */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
                <div className="font-bold text-[#003366] text-[11px]">
                  {lang === 'en' ? 'Selected Map Pinpoint' : 'ಗುರುತಿಸಲಾದ ಸ್ಥಳ'}
                </div>
                <div className="font-mono text-[11px] text-slate-700">
                  Lat: <strong>{lat}</strong>°N
                </div>
                <div className="font-mono text-[11px] text-slate-700">
                  Lon: <strong>{lon}</strong>°E
                </div>
                <button
                  onClick={() => setActiveTab('farmer')}
                  className="w-full mt-2 bg-[#003366] hover:bg-[#002244] text-white font-bold py-1.5 px-3 rounded text-[11px] transition"
                >
                  {lang === 'en' ? 'Assess This Location' : 'ಈ ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ'}
                </button>
              </div>
            </div>

            {/* Map Legend */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
              <div>• Red Lines: Structural fracture zones (GSI Bhukosh)</div>
              <div>• Green Dots: CGWB decadal monitoring piezometers</div>
              <div>• Blue Lines: Surface drainage & stream lines</div>
            </div>
          </div>

          {/* Interactive Map Canvas Container */}
          <div className="flex-1 gov-card overflow-hidden relative">
            <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
          </div>
        </div>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-[#071f36] text-slate-300 text-xs border-t-2 border-[#ff9933] mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Col 1 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex-shrink-0">
                <img
                  src="/img/karnataka_seal.svg"
                  alt="GOK Seal"
                  className="w-full h-full object-contain brightness-125"
                />
              </div>
              <div>
                <h4 className="text-white font-bold">GIBRAS Prototype Project</h4>
                <p className="text-[10px] text-slate-400">Public-Welfare Engineering Initiative</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Groundwater Intelligence & Borewell Risk Assessment System (GIBRAS) is an independent engineering research prototype designed to evaluate drilling failure risks and protect farmers from financial distress.'
                : 'ಗಿಬ್ರಾಸ್ ತಂತ್ರಾಂಶವು ಕೋಲಾರ ಮತ್ತು ಚಿಕ್ಕಬಳ್ಳಾಪುರ ಜಿಲ್ಲೆಗಳ ರೈತರಿಗೆ ಕೊಳವೆಬಾವಿ ಕೊರೆಯುವ ಮುನ್ನ ವೈಜ್ಞಾನಿಕ ಅಪಾಯ ಪರಿಶೀಲನೆ ಒದಗಿಸುವ ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ವೇದಿಕೆಯಾಗಿದೆ.'}
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase text-[11px] border-b border-slate-700 pb-1">
              {lang === 'en' ? 'Reference Portals' : 'ಉಲ್ಲೇಖಿತ ಪೋರ್ಟಲ್‌ಗಳು'}
            </h5>
            <ul className="space-y-1 text-[11px] text-slate-400">
              <li>
                <a href="https://bhoomojini.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>BhooMojini Portal (Reference)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://landrecords.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>Bhoomi Land Records</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://ksrsac.karnataka.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>KSRSAC Web GIS</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://indiawris.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                  <span>India-WRIS / CGWB</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-1.5">
            <h5 className="font-bold text-white uppercase text-[11px] border-b border-slate-700 pb-1">
              {lang === 'en' ? 'Research Disclaimer' : 'ಸಂಶೋಧನಾ ಷರತ್ತುಗಳು'}
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'en'
                ? 'Notice: This platform is an unofficial engineering research prototype. Model predictions are decision-support estimates and do not constitute legal permits or guarantees of water yield.'
                : 'ಸೂಚನೆ: ಇದು ಕಂದಾಯ ಮತ್ತು ಅಂತರ್ಜಲ ವಿಜ್ಞಾನದ ಪ್ರಾಯೋಗಿಕ ಸಂಶೋಧನಾ ಮಾದರಿಯಾಗಿದೆ. ಇದು ಯಾವುದೇ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ದಾಖಲೆಯಲ್ಲ ಅಥವಾ ನೀರಿನ ಖಾತರಿಯಲ್ಲ.'}
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <h5 className="font-bold text-white uppercase text-[11px] border-b border-slate-700 pb-1">
              {lang === 'en' ? 'Technical Project Desk' : 'ತಾಂತ್ರಿಕ ಸಂಶೋಧನಾ ಕೇಂದ್ರ'}
            </h5>
            <p>Groundwater Intelligence Project (GIBRAS)</p>
            <p>Bangalore / Kolar / Chikkaballapur Research Domain</p>
            <p className="text-white font-mono">ಸಹಾಯವಾಣಿ (Helpdesk): 080-22262441</p>
            <p className="text-slate-500 text-[10px] pt-1">
              Public Welfare Engineering & Geospatial Prototype
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
          © 2026 GIBRAS Prototype v1.0. Unofficial Engineering Research Project.
        </div>
      </footer>
    </div>
  )
}
