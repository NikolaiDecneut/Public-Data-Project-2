# Priced Out: When a Full-Time Wage No Longer Covers the Rent

A public-focused data narrative built for **DATA 497 — Advanced Topics in Data Visualization** at the **University of Washington**.

**Live site:** [nikolaidecneut.github.io/Public-Data-Project-2](https://nikolaidecneut.github.io/Public-Data-Project-2/)

> *Across the U.S., paychecks have grown — but not fast enough to keep up with the cost of a place to live.*

---

## Project Overview

This project is a data-journalism–inspired narrative that investigates a single public question: **why does it feel harder than ever to afford a place to live, even for people working full time?**

The short answer the data points to is that the cost-of-living crisis is, at its core, a **wage crisis**. Wages have risen over the past several decades, but prices — and rent in particular — have climbed far faster. We tell that story in three connected visualizations that move from the national picture down to individual counties, so a public reader can see the gap both in the aggregate and in their own backyard.

The site is published with **GitHub Pages** and built with **D3.js**. Each visualization is an independent, self-contained mini-app embedded into a single master page through iframes, with a shared design system and a page-wide light/dark theme.

---

## The Story

The page is organized as a single argument that builds from overview to evidence:

1. **Overview — Income over time (Simon).** U.S. median household income has climbed steadily for five decades, painting a picture of slow but real financial progress.
2. **The pivot — Income vs. prices (Manav).** When income growth is measured against the Consumer Price Index, the gap is stark: from 2000–2024, CPI rose roughly **+82%** while average income rose only about **+17%**. Prices outran paychecks.
3. **The proof on the ground — County affordability (Nikolai).** That national gap becomes concrete at the county level: in Washington and California, the hourly "housing wage" needed to afford a modest rental sits far above the minimum wage, forcing full-time and minimum-wage workers to work well beyond a 40-hour week to keep a roof overhead.

A "so what" statement up front, plus narrative bridges between each chart, carry the reader through the argument rather than simply describing each visual.

---

## Visualizations

| # | Visualization | Author | What it shows | Type |
|---|---|---|---|---|
| 1 | Median Household Income | Simon Mehari | U.S. median household income, 1967–2024 | Line / area chart |
| 2 | Consumer Price Index vs. Income | Manav Lakhani | Cumulative % change in CPI vs. average income, 2000–2024 | Interactive line chart |
| 3 | County Affordability Explorer | Nikolai Decneut | Wage-vs-rent affordability across WA and CA counties | Interactive bubble chart |

### County Affordability Explorer (interactive)
- Each bubble is a county or metro area in **Washington** or **California**; bubble size reflects the number of renter households.
- Users can **filter by state**, **swap the X and Y axes** between measures (e.g., fair-market rent, minimum wage, housing wage, weekly hours needed), **search for a specific county**, and **click a bubble to pin or unpin** its label.
- Built-in light/dark theming matches the rest of the page.

---

## Key Findings

- **Income grew, but slowly.** Median household income rose from roughly $54,880 (1967) to about $83,730 (2024).
- **Prices outran wages.** From 2000–2024, CPI rose ~**82%** while average income rose only ~**17%**.
- **A full-time wage no longer covers rent.** To afford an average two-bedroom rental, a worker needs about **$34.47/hr in Washington** and **$49.61/hr in California**, against state minimum wages of **$16.66** and **$16.50** respectively — equivalent to roughly **99 hours/week in WA** and **120 hours/week in CA** at minimum wage.

---

## Repository Structure

```
Public-Data-Project-2/
├── README.md
├── LICENSE
└── docs/                     # Published by GitHub Pages (source: main /docs)
    ├── index.html            # Master narrative page (title → about → so-what → visuals → conclusion → citations)
    ├── style.css             # Shared design tokens, layout, and theming
    ├── theme.js              # Page-wide light/dark toggle (relays theme into each iframe)
    ├── affordability/        # Nikolai — County Affordability Explorer
    │   ├── index.html
    │   ├── main.js
    │   ├── style.css
    │   ├── washington.csv
    │   └── california.csv
    ├── simon/                # Simon — Median Household Income
    │   ├── index.html
    │   ├── main.js
    │   ├── style.css
    │   └── intablea2.csv
    └── manav/                # Manav — Consumer Price Index vs. Income
        ├── index.html
        ├── main.js
        ├── style.css
        └── avgincome-cpi.csv
```

Each visualization lives in its own folder as a standalone D3 app and is embedded into `docs/index.html` via an iframe. This keeps each author's code independent while presenting a single cohesive page.

---

## Tools & Technologies

- **Visualization:** D3.js (v7)
- **Languages:** JavaScript, HTML, CSS
- **Data prep:** Excel / CSV (sourced from NLIHC, U.S. Census, and BLS data)
- **Hosting:** GitHub Pages (source: `main` branch, `/docs` folder)
- **Version control:** Git & GitHub
- **Design system:** Shared CSS custom properties (Satoshi typeface, teal/gold/magenta palette) with a localStorage-backed light/dark theme

---

## Running Locally

Because the visuals load CSV files with `fetch`, the site must be served over HTTP (opening `index.html` directly via `file://` will fail due to browser CORS rules).

```bash
# clone the repo
git clone https://github.com/NikolaiDecneut/Public-Data-Project-2.git
cd Public-Data-Project-2/docs

# serve with any static server, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

VS Code's **Live Preview** / **Live Server** extension also works well.

---

## Data Sources

All data is drawn from credible, publicly available sources and cited on the live page in Chicago style.

| Source | Used for | Link |
|---|---|---|
| National Low Income Housing Coalition — *Out of Reach* | County-level rent, wage, and affordability data (WA & CA) | [nlihc.org/oor](https://nlihc.org/oor) |
| U.S. Census Bureau — *Income in the United States: 2024* (P60-286, Table A-2) | Median household income, 1967–2024 | [census.gov](https://www.census.gov/library/publications/2025/demo/p60-286.html) |
| U.S. Bureau of Labor Statistics — *Consumer Price Index (CPI-U)* | Inflation / price-change data | [bls.gov/cpi](https://www.bls.gov/cpi/) |
| U.S. Census Bureau — *Renters in 20% of U.S. Counties Paid More…* | Context on recent rent increases | [census.gov](https://www.census.gov/library/stories/2026/01/housing-costs.html) |
| Pew Research Center — *The State of the American Middle Class* | Background context | [pewresearch.org](https://www.pewresearch.org/race-and-ethnicity/2024/05/31/the-state-of-the-american-middle-class/) |
| Urban Institute — *The American Affordability Tracker* | Background context | [urban.org](https://www.urban.org/data-tools/american-affordability-tracker) |

A full reference list (including D3, HTML, and CSS documentation used during development) appears in the **Data sources & citations** section of the [live site](https://nikolaidecneut.github.io/Public-Data-Project-2/).

---

## Authors

| Author | Contribution | GitHub |
|---|---|---|
| **Simon Mehari** | Median Household Income | [github.com/simonm41](https://github.com/simonm41) |
| **Manav Lakhani** | Consumer Price Index vs. Income | [github.com/manav-l](https://github.com/manav-l) |
| **Nikolai Decneut** | County Affordability Explorer | [github.com/NikolaiDecneut](https://github.com/NikolaiDecneut) |

University of Washington · DATA 497 — Advanced Topics in Data Visualization

---

## License

See [LICENSE](LICENSE) for details.
