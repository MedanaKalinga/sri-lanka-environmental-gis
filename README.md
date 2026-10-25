# Sri Lanka Environmental Clustering and Monitoring System

Phase 1 is a local, frontend-only GIS research dashboard built with React, Vite, Tailwind CSS, React Leaflet, and local GeoJSON/CSV inputs.

The user-supplied Sri Lanka DS shapefile has been converted to the local GeoJSON used by the map. The import contains 339 uniquely identified polygon features across 25 districts and 9 provinces. This is a structural validation of the supplied boundary archive, not an independent statement about its scientific provenance. The application does **not** fabricate cluster assignments, satellite observations, or environmental statistics.

## Requirements

- Node.js 20.19+ or a compatible Node.js 22 release. This project is currently validated with Node.js 22.11 and Vite 6.4.5.
- npm 10+
- An internet connection for the default Esri light-gray research basemap tiles. The local research files themselves require no backend.

## Install and run

From this `frontend` directory:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Create a production build with:

```powershell
npm run build
```

## Research data

The supplied DS boundaries and Model A classifications are installed using these filenames:

```text
public/data/
  ds_boundaries.geojson
  model_a_clusters.csv
  model_b_clusters.csv
```

`model_a_clusters.csv` contains the user-supplied K = 4 mathematical classification, K = 5 environmental classification, and six environmental indicators for all 339 DS Divisions. Model B is intentionally not included yet; the interface labels it as awaiting temporal results. Any missing file produces a readable empty state or warning instead of a runtime crash.

### DS boundary GeoJSON

The file must be a GeoJSON `FeatureCollection`. Each feature must have a `Polygon` or `MultiPolygon` geometry and properties that map to the following internal fields:

| Internal field | Required | Default accepted aliases |
| --- | --- | --- |
| `dsId` | Yes | `ds_id`, `dsid`, `ds_code`, `dscode`, `gnd_id`, `adm3_pcode`, `id` |
| `dsName` | Recommended | `ds_name`, `dsname`, `dSDivision`, `division_name`, `adm3_name`, `name` |
| `district` | Recommended | `district`, `district_name`, `dist_name`, `adm2_name` |
| `province` | Recommended | `province`, `province_name`, `prov_name`, `adm1_name` |

Every DS identifier must be stable and unique. Unsupported geometries, duplicate identifiers, and features without an identifier are skipped with validation warnings.

### Clustering CSV files

The CSV must include a DS identifier matching the GeoJSON exactly. Rows are joined by this identifier—not by row order and not by approximate name matching.

| Internal field | Required | Default accepted aliases |
| --- | --- | --- |
| `dsId` | Yes | `ds_id`, `dsid`, `ds_code`, `dscode`, `adm3_pcode`, `id` |
| `clusterK4` | Model A | `K4`, `cluster_k4`, `clusterk4`, `k_4` |
| `clusterK5` | Model A | `K5`, `cluster_k5`, `clusterk5`, `k_5` |
| `clusterId` | Other models | `cluster_id`, `clusterid`, `cluster`, `class` |
| `ndviMean` | Optional | `ndvi_mean`, `mean_ndvi`, `ndvi` |
| `ndviSd` | Optional | `ndvi_sd`, `ndvi_std`, `ndvi_standard_deviation`, `std_ndvi` |
| `mndwiMean` | Optional | `mndwi_mean`, `mean_mndwi`, `mndwi` |
| `waterCandidatePct` | Optional | `both_index_water_candidate_pct`, `both_water_indices_candidate_pct_validS2`, `both_water_indices_candidate_pct`, `water_candidate_pct` |
| `elevationMean` | Optional | `elevation_mean`, `mean_elevation`, `elevation`, `elev_mean` |
| `slopeMean` | Optional | `slope_mean`, `mean_slope`, `average_slope`, `slope` |

K = 4 accepts integer cluster IDs 1–4, K = 5 accepts IDs 1–5, and the generic model field accepts IDs 1–6. Out-of-range values are treated as missing. The water-candidate percentage uses the supplied 0–100% valid range and average slope is displayed in degrees. No unit is appended to elevation because its source unit has not been explicitly confirmed. Additional numeric CSV columns are retained as extra indicators. Source location columns and supplied upload coordinates are not interpreted as environmental indicators.

To adapt real column names, edit `src/constants/dataConfig.js`. Structural, empty templates are included in `public/data/templates/`; they are not research datasets and are not loaded by the app.

## Phase 1 features

- Dashboard and Clustering Analysis routes with a shared interactive research workspace.
- Pan, zoom, polygon tooltips, click selection, extent zooming, and fit-to-country controls.
- Clean English-labelled Esri light-gray research basemap by default, with an English street map and local-label OpenStreetMap available as options.
- Synchronized polygon and DS dropdown selection.
- Province and district filtering with filtered map extents.
- Switchable Model A classification: mathematical/score-based K = 4 and real-world environmental K = 5.
- Semantically consistent cluster colors, named legends, all-island cluster counts, and neutral missing-data styling.
- Six continuous indicator layers: NDVI mean, NDVI SD, MNDWI mean, water-candidate percentage, elevation mean, and average slope.
- Metric-specific scientific color ramps, filtered observed-range legends, percentage and degree units, map tooltip values, and neutral missing-data styling.
- Independent Model A and Model B data state.
- Basemap and DS boundary visibility toggles, basemap style selection, polygon opacity control, and full reset.
- High-contrast DS outlines remain visible before cluster results are supplied.
- Collapsible left control sidebar and right DS information panel.
- Responsive desktop and smaller-screen layouts.
- Loading, missing-file, invalid-file, and unmatched-record states.
- Future-feature placeholders for seasonal analysis and the satellite explorer.

## Project structure

```text
frontend/
  public/
    data/
      templates/
      ds_boundaries.geojson
  src/
    components/
      dashboard/
      layout/
      map/
      sidebar/
    constants/
    hooks/
    pages/
    services/
    utils/
    App.jsx
    index.css
    main.jsx
  package.json
  README.md
```

Important separation points:

- `src/services/dataService.js` owns dataset retrieval and can later be replaced or extended with FastAPI requests.
- `src/utils/dataNormalization.js` validates, normalizes, and joins records independently of the interface.
- `src/constants/dataConfig.js` owns paths, field aliases, model metadata, indicators, and map colors.
- `src/components/map/` contains Leaflet rendering only; a future Earth Engine tile layer can be introduced here as a separate layer component.
- `src/components/dashboard/AnalysisWorkspace.jsx` owns Phase 1 interaction state and composes the reusable controls, map, and information panel.
- `scripts/convert-shapefile.mjs` is the dependency-free converter used for the supplied polygon shapefile and DBF attributes.

## Phase 2 readiness

The frontend is prepared for, but does not implement:

- Python FastAPI endpoints replacing local file fetches.
- Model B seasonal and time-series result retrieval.
- Google Earth Engine tile/service integration.
- Trend charts and seasonal comparison workflows.

Authentication, databases, clustering algorithms, satellite processing, and Earth Engine credentials are intentionally outside Phase 1.

## Validation performed

- Dependency installation completed with no reported npm vulnerabilities.
- `npm run build` completed successfully.
- The supplied boundary import was validated as 339 unique features: 295 `Polygon` and 44 `MultiPolygon` geometries, with no missing IDs or unsupported geometries.
- The Model A CSV was validated as 339 unique rows with exact matches to every boundary ID and no location-name mismatches.
- K = 4 totals are 35, 190, 33, and 81. K = 5 totals are 133, 33, 77, 63, and 33.
- All six Model A indicator columns contain 339 valid numeric values. Observed all-island ranges are: NDVI mean 0.187–0.816; NDVI SD 0.075–0.397; MNDWI mean −0.553–−0.287; water-candidate percentage 0–13.93%; elevation mean 4.10–1,905.77 source units; and average slope 1.65–21.08°.
- Missing optional clustering CSVs are handled without build or application startup failure.
