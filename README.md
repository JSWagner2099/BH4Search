# DR4 Database

A static, searchable Gaia stellar radial-velocity catalog named DR4 Database for GitHub Pages. It includes Gaia parameters, estimated temperature-based spectral types, a dereddened CMD for the parameterized subset, and a geometric observability screen for six RV facilities.

## Catalog and type estimates

`data/catalog.csv` is based on the 67-source `Mega_Catalogue - Sheet2.csv`, joined to matching fields from the earlier merged project catalog. The latest spreadsheet IDs and coordinates are authoritative. It retains GSP-Phot `teff`, `logg`, metallicity, distance and extinction parameters, Gaia photometry, previous target-list/exposure metadata where IDs match, and source notes. Gaia DR3 `radial_velocity` and `radial_velocity_error` from that source CSV appear together in the catalog as `Gaia RV ± error (km/s)`; one source has no reported Gaia RV in the input data.

The `Catalog Source` column is joined by exact Gaia DR3 ID from `Mega_Catalogue - Catalog.csv`. Gaia parameters for source `202225756293950464` were refreshed from `Mega_Catalogue - Sheet2-2.csv`.

For spectral-type estimates, the app uses the nearest dwarf standard in the Mamajek temperature sequence when `teff_gspphot` is present (47 sources). Where it is missing, the nearest Gaia BP−RP dwarf color is used (20 sources); these color-only estimates are marked low confidence because the colors could not be dereddened. The output is a temperature class/subclass only; no luminosity class is inferred. These are estimates, not spectroscopic classifications.

The CMD is restricted to sources with distance and extinction parameters. It calculates `M_G = G - A_G - 5 log10(d_pc) + 5` and `BP−RP_0 = BP−RP - E(BP−RP)` from the supplied GSP-Phot fields.

## Observatory flags

The observability columns estimate seasonal nighttime windows from **November 23, 2026 through February 28, 2027**. For each date and facility, the screen checks whether the target can reach at least 30° altitude while the Sun is at least 18° below the horizon (astronomical darkness). SALT uses its fixed-zenith-angle access band, approximately −75° to +10°, in addition to the nighttime screen. Dates are sampled daily; the Sun position and facility latitudes are approximate, so the start and end dates are planning estimates.

| Display | Meaning |
| --- | --- |
| Date range, such as `Dec 4–Jan 21` | At least one nighttime interval passed the geometric screen on each date within that range. Multiple ranges are separated by commas. |
| `Out of season` | No date in this interval passed both the nighttime and altitude screen. |
| `Dec limit` | The source falls outside the facility's declination-access range. |

A date range is not a reservation or guarantee of observability. The screen does not include weather, brightness/exposure constraints, instrument availability, airmass limits, or scheduling.

| Facility | Site | Declination screen |
| --- | --- | --- |
| HIRES / Keck | Maunakea | culmination altitude ≥30° (approximately −40° to +80°) |
| APF / Lick | Mt. Hamilton | culmination altitude ≥30° (approximately −23° to +90°) |
| ESPRESSO / Paranal | Paranal | culmination altitude ≥30° (approximately −85° to +35°) |
| SOAR | Cerro Pachón | culmination altitude ≥30° (approximately −90° to +30°) |
| HJST / McDonald | McDonald Observatory | culmination altitude ≥30° (approximately −29° to +90°) |
| SALT | Sutherland | fixed-zenith-angle access band (approximately −75° to +10°) |

## References and facility sources

- Gaia DR3 GSP-Phot parameters and interpretation: [Gaia DR3 documentation](https://gea.esac.esa.int/archive/documentation/GDR3/Data_analysis/chap_cu8par/sec_cu8par_apsis/ssec_cu8par_apsis_gspphot.html).
- Dwarf temperature/color sequence: [Mamajek's table](https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt); underlying main-sequence sequence discussed in [Pecaut & Mamajek (2013)](https://doi.org/10.1088/0067-0049/208/1/9).
- Facility positions: [Keck/Maunakea](https://about.ifa.hawaii.edu/facility/mauna-kea-observatories/), [APF/Mt. Hamilton](https://www.ucolick.org/~sla/mtham/gpos.html), [ESO Paranal](https://www.eso.org/sci/facilities/paranal/astroclimate/site.html), [SOAR/Cerro Pachón](https://pds.nasa.gov/ds-view/pds/viewContext.jsp?identifier=urn%3Anasa%3Apds%3Acontext%3Atelescope%3Actio-cerro_tololo.soar_4m1&version=1.3), and [McDonald HJST](https://mcdonald.utexas.edu/research-facilities/HJST). SALT's fixed-angle sky access is described in [Kwiatkowski et al.](https://doi.org/10.1051/0004-6361/200913152).

## Publish with GitHub Pages

The included GitHub Actions workflow deploys the static site on pushes to the default branch. The app is plain HTML, CSS, and JavaScript, with no build step or backend.

## Local preview

Run `python3 -m http.server 8000` from the project directory and open `http://localhost:8000`.


## Manual website edits

1. Clone the repository and enter its folder:
   ```sh
   git clone https://github.com/JSWagner2099/BH4Search.git
   cd BH4Search
   ```
2. Edit `index.html` for page text and sections, `assets/site.css` for layout and colors, `assets/app.js` for search/filter/chart behavior, and `data/catalog.csv` for catalog rows. Keep the CSV headers unchanged unless you also update the matching field names in `assets/app.js`.
3. Preview locally with `python3 -m http.server 8000`, then open `http://localhost:8000`.
4. Commit and push to `main`:
   ```sh
   git add index.html assets/site.css assets/app.js data/catalog.csv README.md
   git commit -m "Update DR4 Database"
   git push origin main
   ```
5. In GitHub, open **Actions** and confirm **Deploy static site to GitHub Pages** succeeds. If Pages is not configured, open **Settings → Pages** and select **GitHub Actions** as the source.

For a quick browser-only edit, open the target file in the GitHub repository, choose the pencil icon, edit it, then use **Commit changes** on the `main` branch. For larger CSV or code changes, editing locally and pushing is more reliable.
