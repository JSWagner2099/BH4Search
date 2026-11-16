# Stellar RV Atlas

A static, searchable catalog for stellar radial-velocity targets, prepared for GitHub Pages. The catalog combines five supplied CSV lists into a single source table and includes an interactive Gaia color–magnitude view and an observatory-status matrix. Synthetic RV epochs are not part of this project dataset.

## Merged catalog

`data/catalog.csv` contains 67 unique Gaia DR3 source IDs merged from:

- `GaiaDR3BHcandidates_McDonald - PriorityRankings.csv`
- `GaiaDR3Blackholecandidates - McDonald Candidates - Nagaram & Lam.csv`
- `GoodmanExposureTimes - Untitled.csv`
- `2026B_A016i0 - Sheet1.csv`
- `Gaiaqvsperiodisochrones - source_info(1).csv`

The table includes Gaia ID, decimal-degree RA/Dec, spectral type, Gaia G and BP−RP where supplied, parallax/distance where supplied, observatory status fields, observing-list flags, and contributing source lists. Gaia identifiers remain strings to preserve their full precision.

### Data coverage and interpretation

- None of the input files includes spectral type, so the merged field is `Not provided` throughout; it is not inferred from color.
- SALT, Keck, APF, and SOAR seasonal estimates are available only for the original seven-source comparison, for Dec 2026–Feb 2027. `Favorable` and `Not favorable` reflect that first-pass comparison. All other rows are `Not assessed`.
- The McDonald column copies the explicit `McDonald-Visible` flag from the candidate list. Missing values are `Not provided`.
- `Goodman exposure list` means a source appears in the supplied exposure-time estimates; it is not a confirmation of visibility.
- `2026B target list` only records membership in that file. Its observatory was not identified in the supplied filename/content.
- The diagram plots apparent Gaia G versus BP−RP, not absolute magnitude, because distance is unavailable for most sources.
- Some sources have no coordinates in the supplied files and are retained with blank coordinate cells.

The website filters by Gaia ID and positive observatory status. The CSV is available from the page for download.

## Publish with GitHub Pages

1. In **Settings → Pages**, set the source to **GitHub Actions**.
2. Push the default branch. The included workflow deploys the static page.

The app uses plain HTML, CSS, and JavaScript; it has no build step or backend.

## Data contributions

Keep source identifiers as strings. Record units, provenance, observatory and season definitions, and whether flags are estimates or source-provided. Do not replace missing values with inferred classifications. If you add private or unpublished observations, review repository visibility before pushing: GitHub Pages sites from public repositories are publicly accessible.

## Local preview

From the project directory, run `python3 -m http.server 8000` and open `http://localhost:8000`.
