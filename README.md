# Priced Out: When a Full-Time Wage No Longer Covers the Rent

A public-focused data narrative built for **DATA 497 — Advanced Topics in Data Visualization** at the **University of Washington**.

**Live site:** [nikolaidecneut.github.io/Public-Data-Project-2](https://nikolaidecneut.github.io/Public-Data-Project-2/)

> *Across the U.S., paychecks have grown — but not fast enough to keep up with the cost of a place to live.*

---

## Project Overview

This project makes a simple claim: **the cost-of-living crisis is fundamentally a matter of purchasing power.** Across the United States, paychecks have grown — but not fast enough to keep up with the rising cost of everyday life. Nominal wages have climbed for decades, yet they have not kept pace with the accelerating cost of essential needs, most notably rent. The widening gap shows that today's economic landscape is shaped less by the dollar amount households earn, and more by what those earnings can actually buy.

To support that narrative, we built three visualizations from credible public sources that move from the national picture down to individual counties, so a public reader can see the gap both in the aggregate and in their own backyard. The through-line: **prices rose, but wages didn't keep pace — and nowhere is that gap clearer than in what it now costs to keep a roof overhead.**

The site is published with **GitHub Pages** and built with D3.js. Each visualization is an independent, self contained mini app embedded into a single master page through iframes, with a shared design system and a page wide light/dark theme.

---

## The Story

The page is organized as a single argument that builds from overview to evidence:

1. **Overview — Income over time (Simon).** Median U.S. household income climbs steadily from its 1967 origin of $54,880 to an $83,730 peak in 2024, painting a picture of relentless financial progress. But raw income tells only half the story, it is merely the baseline for a more pressing question: how far does that income actually stretch in value?
2. **The pivot — Income vs. prices (Manav).** Comparing average household income against the Consumer Price Index reveals the real issue. Since 2000, CPI has risen about **+82.2%** while average income has grown only about **+16.6%** and the gap becomes especially pronounced after 2020, when CPI accelerated sharply during the post pandemic inflation surge while income growth stayed relatively flat.
3. **The proof on the ground — County affordability (Nikolai).** That national gap becomes concrete at the county level: in Washington and California, the hourly "housing wage" needed to afford a modest apartment sits far above the minimum wage, forcing full time and minimum wage workers to work well beyond a 40-hour week to keep a roof overhead.

A "so what" statement up front, plus narrative bridges between each chart, carry the reader through the argument rather than simply describing each visual.

---

## Visualizations

| # | Visualization | Author | What it shows | Type |
|---|---|---|---|---|
| 1 | Median Household Income | Simon Mehari | U.S. median household income, 1967–2024 | Line / area chart |
| 2 | Consumer Price Index vs. Income | Manav Lakhani | Cumulative % change in CPI vs. average income, 2000–2024 | Interactive line chart |
| 3 | County Affordability Explorer | Nikolai Decneut | Wage vs rent affordability across WA and CA counties, 2025 | Interactive bubble chart |

### County Affordability Explorer (interactive)
Each bubble represents a single county or metro area across Washington and California, plotting what renters earn against what their housing actually costs. The central measure is the **housing wage** — the hourly pay a full-time worker would need to afford a modest rental without spending more than 30% of their income on housing.

- Bubble size reflects the number of renter households.
- Users can **filter by state**, **swap the X and Y axes** between measures (fair-market rent, minimum wage, housing wage, hours required to afford a home), **search for a specific county**, and **click a bubble to pin or unpin** its label.
- Built-in light/dark theming matches the rest of the page.

County by county, the same pattern surfaces: the wage a household needs to afford housing has drifted far beyond what minimum-wage and many full-time workers actually bring home, turning a stable home into something a single paycheck can no longer reliably secure.

---

## Key Findings

- **Income grew, but slowly.** Median household income rose from $54,880 (1967) to $83,730 (2024).
- **Prices outran wages.** Since 2000, CPI rose ~**82.2%** while average income rose only ~**16.6%**, with the divergence accelerating after the post-2020 inflation surge.
- **A full-time wage no longer covers rent.** To afford an average two-bedroom rental, a worker needs about **$34.47/hr in Washington** and **$49.61/hr in California**, against state minimum wages of **$16.66** and **$16.50** respectively — equivalent to roughly **99 hours/week in WA** (about two and a half jobs) and **120 hours/week in CA** (nearly three jobs) at minimum wage.

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

- **Visualization:** D3.js
- **Languages:** JavaScript, HTML, CSS
- **Data prep:** Excel / CSV (sourced from NLIHC, U.S. Census, and BLS data)
- **Hosting:** GitHub Pages (source: `main` branch, `/docs` folder)
- **Version control:** Git & GitHub
- **Design system:** Shared CSS custom properties (Satoshi typeface, teal/gold/magenta palette) with a localStorage-backed light/dark theme
- **File sharing & Team communication:** Google Drive with labeled files and tabs within for different tasks, Discord Server for calls, messages, and sending links.

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
