# Research data directory

The supplied boundary archive has been converted and installed here as:

- `ds_boundaries.geojson`

It contains 339 uniquely identified DS polygon features and retains the supplied `adm3`, `adm2`, and `adm1` name/code attributes. The application maps those attributes through `src/constants/dataConfig.js`.

The supplied Model A classification file is installed as:

- `model_a_clusters.csv`

It contains exact DS identifier matches for all 339 boundaries, both the K = 4 mathematical/score-based result and K = 5 environmental result, and these six numeric indicators:

- `ndvi_mean`
- `ndvi_sd`
- `mndwi_mean`
- `both_index_water_candidate_pct` (0–100%)
- `elevation_mean` (source unit not yet confirmed)
- `slope_mean` (degrees)

The normalization configuration also accepts `both_water_indices_candidate_pct_validS2` as an alias for the water-candidate percentage.

Add the later temporal dataset as:

- `model_b_clusters.csv`

The files in `templates/` are structural examples only. They contain headers but no research observations, boundaries, coordinates, or environmental values.

The application joins each CSV row to one GeoJSON feature using an exact, stable DS identifier. It never joins records by array position or approximate name matching. See the project README for the default field aliases and configuration location.
