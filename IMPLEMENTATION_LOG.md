# GIBRAS Implementation Log

All major engineering tasks, code modifications, verification runs, test results, and next actions are logged sequentially in this file.

---

### [2026-11-23] - Task 7.1 & 8.1: Complete System Deployment, Audits, Verification & Engineering Handover
- **Attempted**: End-to-end integration, full test suite execution, security audits, live local deployment, database persistence verification, and governance documentation.
- **Completed**:
  - Implemented FastAPI backend on port 8050 (`/health`, `/api/v1/assess`, `/api/v1/layers/*`, `/api/v1/analytics/*`, `/api/v1/hydrogeologist/*`).
  - Implemented Next.js bilingual (Kannada/English) web portal on port 3050 (`apps/web`).
  - Executed all 22 automated unit, geospatial, and integration tests (`pytest tests/ -v`) with 100% pass rate.
  - Executed `bandit` security analysis (0 High vulnerabilities; interface binding resolved).
  - Launched live services via `./scripts/start_local.sh` and verified live assessment request, printable report generation, and hydrogeologist VES verification.
  - Verified database persistence in DuckDB across complete process shutdown and restart.
  - Authored comprehensive governance and operational documents:
    - `docs/AUDIT_REPORT.md`
    - `docs/TESTING_REPORT.md`
    - `docs/KNOWN_LIMITATIONS.md`
    - `docs/GOVERNMENT_PARTNERSHIP_PROPOSAL.md`
    - `docs/ROADMAP.md`
    - `LOCAL_DEPLOYMENT.md`
    - `docker-compose.yml`
- **Verified**: Live endpoints responding: `http://localhost:3050` (Web UI), `http://localhost:8050/docs` (Swagger API), `http://localhost:8050/health` (Health Check: HEALTHY).
- **Quality Gates**: All 6 Quality Gates (A through F) PASSED.
- **Status**: Production-ready local deployment verified and handed over.

---

### [2026-11-23] - Task 8.2: GIS Interactive Map Boundary Rendering & Layer Visibility Fix
- **Attempted**: Resolve issue where Taluk Boundaries, Fault Lineaments, and CGWB Piezometers were listed in the Map Legend but not displaying on the MapLibre GIS viewer in production.
- **Root Cause Diagnosed**:
  1. *Proxy Collision on Vercel*: `apps/web/next.config.js` contained an obsolete blanket rewrite (`source: '/api/:path*', destination: 'http://127.0.0.1:8050/api/:path*'`). When deployed to Vercel, dynamic App Router routes like `/api/v1/layers/[layer]` were intercepted and proxied to private IP `127.0.0.1:8050`, which Vercel rejected with `DNS_HOSTNAME_RESOLVED_PRIVATE` (HTTP 404).
  2. *Silent Client Parsing Rejection*: The 404 HTML response caused `fetch('/api/v1/layers/taluks').then(r => r.json())` to throw a JSON parse syntax error, preventing `map.addSource` from executing.
  3. *Tab DOM Unmounting*: Conditional rendering `{activeTab === 'map' && ...}` destroyed the map container DOM element upon tab switching while leaving `mapInstance.current` non-null, preventing map re-initialization and stalling canvas rendering.
  4. *Missing Glyphs*: Taluk labels lacked font glyph definitions, preventing text rendering.
- **Completed**:
  - Removed blanket rewrite from `apps/web/next.config.js`; native Next.js serverless routes now execute directly.
  - Hardened `apps/web/app/api/v1/layers/[layer]/route.js` with multi-path file resolution and automatic 307 CDN fallback.
  - Switched Map container to persistent CSS display (`style={{ display: activeTab === 'map' ? 'flex' : 'none' }}`) and attached automatic `map.resize()` on tab activation.
  - Implemented dual-source ingestion in `apps/web/app/page.jsx` (fetches `/data/*.geojson` directly with fallback to `/api/v1/layers/*`).
  - Added interactive layer toggle toolbar in the map header for Taluks, Fault Lineaments, CGWB Piezometers, and Drainage.
  - Added font glyphs endpoint (`demotiles.maplibre.org/font/{fontstack}/{range}.pbf`) and prominent haloed text labels for each taluk.
  - Implemented interactive popups for taluks, lineaments, and monitoring wells.
  - Added draggable target marker with real-time coordinate updates and map auto-fit bounds (`[[77.30, 12.80], [78.60, 14.05]]`).
- **Verified**:
  - Vercel live endpoint verified: `curl -i https://web-pied-omega-49.vercel.app/api/v1/layers/taluks` returns `HTTP/2 200` with 12 taluk MultiPolygons.
  - All layers (`lineaments`, `monitoring_wells`, `drainage`) return `HTTP/2 200`.
  - Local web app at `http://localhost:3050` compiled and tested clean.
  - 22/22 pytest tests passing.
- **Status**: Verified and pushed to GitHub `main` (commit `756db23`) and deployed live on Vercel (`web-iz235674r-thrilok-m.vercel.app` / `web-pied-omega-49.vercel.app`).
