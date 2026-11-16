# Stellar RV Atlas

A static, searchable catalog for stellar radial-velocity targets, prepared for GitHub Pages. It combines five supplied CSV lists into one source table with a Gaia color–magnitude view and an observatory-status matrix. Synthetic RV epochs are not part of the current project dataset.

## Merged catalog

`data/catalog.csv` contains 67 unique Gaia DR3 source IDs merged from:

- `GaiaDR3BHcandidates_McDonald - PriorityRankings.csv`
- `GaiaDR3Blackholecandidates - McDonald Candidates - Nagaram & Lam.csv`
- `GoodmanExposureTimes - Untitled.csv`
- `2026B_A016i0 - Sheet1.csv`
- `Gaiaqvsperiodisochrones - source_info(1).csv`

The single table includes Gaia ID, decimal-degree RA/Dec, spectral type, selection priority, literature ΔRV, Gaia photometry, V and B−V where supplied, parallax/distance, observatory flags, Goodman exposure estimates, target-list membership, and source-file provenance. Gaia IDs are preserved as strings.

### Coverage and interpretation

- None of the input files includes spectral type, so the merged field is `Not provided` throughout; it is not inferred from color.
- SALT, Keck, APF, and SOAR seasonal estimates are available only for the original seven-source comparison, for Dec 2026–Feb 2027. `Favorable` and `Not favorable` reflect that first-pass comparison. All other rows are `Not assessed`.
- The McDonald column copies the explicit `McDonald-Visible` flag from the candidate list. Missing values are `Not provided`.
- The Goodman column records appearance in the supplied exposure-time list. The two time estimates and strategy are retained separately; inclusion does not confirm sky visibility.
- `2026B target list` records membership only. The observatory was not identified in the supplied file name/content.
- The diagram plots apparent Gaia G versus BP−RP, not absolute magnitude, because distance is unavailable for most sources.
- Some sources have no coordinates in the supplied files and are retained with blank coordinate cells.

The website filters by Gaia ID and positive observatory status. The merged CSV is available from the page for download.

## Publish with GitHub Pages

1. In **Settings → Pages**, set the source to **GitHub Actions**.
2. Push the default branch. The included workflow deploys the static page.

The app uses plain HTML, CSS, and JavaScript; it has no build step or backend.

## Data contributions

Keep source identifiers as strings. Record units, provenance, observatory and season definitions, and whether flags are estimates or source-provided. Do not replace missing values with inferred classifications. If you add private or unpublished observations, review repository visibility before pushing: GitHub Pages sites from public repositories are publicly accessible.

## Local preview

From the project directory, run `python3 -m http.server 8000` and open `http://localhost:8000`.
