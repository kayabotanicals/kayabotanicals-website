# Kaya Botanicals — Official Website

Marketing site for **Kaya Botanicals**, a botanical ritual house rooted in kokum, home to two lines:

- **KODA** — botanical ritual drinks
- **K3B Apothecary** — kokum-led skincare

Launching Fall 2026.

## Tech

Single-page static site — one self-contained `index.html` (HTML + CSS + JS inline). No frameworks, no build step, no dependencies.

## Current Version

**Version 40 — Production Polish Release Candidate**

## Local Development

Open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deployment (Cloudflare Pages)

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**
2. Select the `kayabotanicals-website` repo
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Deploy — every push to `main` auto-deploys.
