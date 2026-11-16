# Stellar RV Atlas

A buildless, static catalog interface designed for GitHub Pages. The page includes a Gaia DR3 source index, temperature and observatory filters, an interactive color–magnitude diagram, an observability matrix, and a separate synthetic RV epoch viewer.

## Current data

- `data/catalog.csv` contains the seven Gaia DR3 sources from the supplied `Gaiaqvsperiodisochrones - source_info.csv`. It has source ID, coordinates, parallax, and distance. It does not contain effective temperature, BP/RP color, G-band magnitude, or measured RV epochs.
- `data/target_3_rv_gaialike.csv` is a **synthetic** 67-epoch RV series for model testing. It has no real Gaia source ID and is not a Gaia observation product. The plotted errors and signal assumptions are described in the source bundle README.
- The Dec 2026–Feb 2027 observatory matrix reflects a first-pass seasonal/geometric comparison: all seven listed sources pass the Keck, APF, and SOAR screen; four pass the SALT screen. This is a planning estimate, not a live visibility calculation or observing-time confirmation.

## Add stellar parameters

Use **Import a catalog** and select a CSV with a Gaia identifier column (`source_id` or `gaia_dr3_source_id`). Rows merge into the current source list by ID. The site recognizes these optional fields:

| Field | Accepted CSV column names |
| --- | --- |
| Effective temperature (K) | `teff_gspphot`, `teff`, `effective_temperature`, `teff_k` |
| BP − RP (mag) | `bp_rp`, `bp_minus_rp`, `color` |
| Gaia G mean magnitude | `phot_g_mean_mag`, `g_mag`, `gmag`, `g` |
| Coordinates | `ra`, `dec` |
| Parallax (mas) | `parallax`, `parallax_mas` |
| Distance (pc) | `distance`, `distance_pc` |

The diagram computes absolute magnitude as `M_G = G - 5 log10(distance_pc) + 5`. It uses distance already supplied in the catalog; if you need extinction-corrected magnitudes, add a corrected magnitude column and update the diagram calculation to match your adopted method.

## Publish with GitHub Pages

1. Create a GitHub repository and put these files at its root.
2. Push the default branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, select the default branch and `/ (root)`, then save. The repository will be served at `https://<account>.github.io/<repository>/`.

The app is plain HTML, CSS, and JavaScript; no build step or backend is required. It can also use the included workflow: go to **Settings → Pages**, set the source to **GitHub Actions**, then push to the default branch.

## Data contributions

Keep the source catalog, RV epoch files, and provenance together. Record units, time scale, uncertainty meaning, instrument, and whether each series is observed or simulated. Avoid combining alternative synthetic precision experiments as independent observations. If you add private or unpublished observations, review repository visibility before pushing: GitHub Pages sites from public repositories are publicly accessible.

## Local preview

From the project directory, run `python3 -m http.server 8000` and open `http://localhost:8000`.
