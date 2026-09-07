/**
 * V65 — server-side per-route metadata for the KODA / K3B / Kaya single-page site.
 *
 * WHY THIS EXISTS
 * The site is one index.html with JS routing. The in-page router rewrites <title>,
 * description and og:* on navigation, but social scrapers (Facebook, LinkedIn,
 * iMessage, WhatsApp, Slack) and most crawlers never execute that JS — they read
 * the raw HTML. Without this, every product URL shares the homepage's preview card.
 *
 * This runs at the edge, after _redirects has rewritten /gut -> index.html, and
 * patches the head for the requested path. Keep ROUTES in sync with VIEW_META
 * inside index.html and with SLUG_TO_VIEW / sitemap.xml / _redirects.
 *
 * FAIL-SAFE: any error at all falls through to the untouched response. This
 * middleware can degrade the previews; it must never be able to take the site down.
 */

const SITE = {
  'drinkkoda.com':      'koda',
  'www.drinkkoda.com':  'koda',
  'k3bapothecary.com':  'k3b',
  'www.k3bapothecary.com': 'k3b',
  'kayabotanicals.com': 'brand',
  'www.kayabotanicals.com': 'brand',
};

const HOME = {
  koda: {
    t: 'KODA — Five Botanical Rituals | Drink with Intention',
    d: 'KODA is a botanical ritual beverage house rooted in kokum. Five rituals — GUT, GRIT, GLOW, CACAO and AMBER. Launching Fall 2026.',
    i: '/products/og-koda-home.jpg',
  },
  k3b: {
    t: 'K3B Apothecary — Kokum-Led Skincare | Care with Intention',
    d: 'K3B Apothecary is kokum-led skincare and kansa ritual instruments from Kaya Botanicals. Launching Fall 2026.',
    i: '/og-image.jpg',
  },
  brand: {
    t: 'Kaya Botanicals — KODA · K3B Apothecary · Botanical Rituals',
    d: 'A botanical ritual house rooted in kokum. KODA ritual beverages and K3B Apothecary skincare. Launching Fall 2026.',
    i: '/og-image.jpg',
  },
};

const ROUTES = {
  'gut': {
    t: 'GUT Botanical Ritual Beverage | KODA',
    d: 'GUT — The Digestive Ritual. Sparkling kokum and fennel, built on a patent-pending botanical decoction. Zero added refined sugars. 12 fl oz.',
    i: '/products/og-koda-gut.jpg',
  },
  'grit': {
    t: 'GRIT Botanical Ritual Beverage | KODA',
    d: 'GRIT — The Resilience Ritual. Sparkling amla and turmeric with a bracing green-botanical edge. Zero refined sugars. 12 fl oz.',
    i: '/products/og-koda-grit.jpg',
  },
  'glow': {
    t: 'GLOW Botanical Ritual Beverage | KODA',
    d: 'GLOW — The Radiance Ritual. Sparkling jamun and gotu kola, polyphenol-dense and velvet-dry. No artificial dyes. 12 fl oz.',
    i: '/products/og-koda-glow.jpg',
  },
  'cacao': {
    t: 'CACAO Botanical Ritual Beverage | KODA',
    d: 'CACAO — The Clarity Ritual. Ultra-dry sparkling cacao with reishi and vetiver. Aroma-forward, built for deep work. 12 fl oz.',
    i: '/products/og-koda-cacao.jpg',
  },
  'amber': {
    t: 'AMBER Botanical Ritual Beverage | KODA',
    d: 'AMBER — The Stillness Ritual. A non-alcoholic botanical aperitivo of real saffron and goji berry. Zero added sugars. 12 fl oz.',
    i: '/products/og-koda-amber.jpg',
  },
  'barrier-moisturizer': {
    t: 'Tri-Lipid Barrier Moisturizer | K3B Apothecary',
    d: 'A daily phyto-lipid barrier moisturizer. 50 ml. Non-comedogenic, family-safe, AM/PM. K3B Apothecary by Kaya Botanicals.',
    i: '/og-image.jpg',
  },
  'mineral-veil': {
    t: 'Mineral Veil Barrier Defense SPF 40 | K3B Apothecary',
    d: 'Kokum Mineral Veil Barrier Defense SPF 40 — broad-spectrum mineral protection that supports the skin barrier. K3B Apothecary.',
    i: '/og-image.jpg',
  },
  'body-butter': {
    t: 'Kokum Body Butter | K3B Apothecary',
    d: 'Kokum Body Butter — a rich, kokum-led body treatment from K3B Apothecary by Kaya Botanicals.',
    i: '/og-image.jpg',
  },
  'body-oil': {
    t: 'Kokum Ritual Body Oil | K3B Apothecary',
    d: 'Kokum Ritual Body Oil — a waterless body treatment for instant absorption and non-comedogenic glide. K3B Apothecary.',
    i: '/og-image.jpg',
  },
  'elixir': {
    t: 'Phyto-Lipid Ritual Elixir | K3B Apothecary',
    d: 'Phyto-Lipid Ritual Elixir — a completely waterless treatment serum made for facial massage rituals. K3B Apothecary.',
    i: '/og-image.jpg',
  },
  'kansa-wand': {
    t: 'Kansa Dual Wand | K3B Apothecary',
    d: 'The Kansa Dual Wand — a handcrafted high-purity kansa bronze ritual instrument from K3B Apothecary.',
    i: '/og-image.jpg',
  },
  'gua-sha': {
    t: 'Kansa Ritual Sculptor | K3B Apothecary',
    d: 'The Kansa Ritual Sculptor — a handcrafted kansa bronze instrument for contour-defining facial ritual. K3B Apothecary.',
    i: '/og-image.jpg',
  },
  'scalp-massager': {
    t: 'Kansa Scalp Ritual Massager | K3B Apothecary',
    d: 'The Kansa Scalp Ritual Massager — a handcrafted kansa bronze instrument for the scalp ritual. K3B Apothecary.',
    i: '/og-image.jpg',
  },
};

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

class SetContent {
  constructor(value) { this.value = value; }
  element(el) { el.setAttribute('content', this.value); }
}
class SetHref {
  constructor(value) { this.value = value; }
  element(el) { el.setAttribute('href', this.value); }
}
class SetText {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}

export async function onRequest(context) {
  const response = await context.next();

  try {
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return response;

    const url = new URL(context.request.url);
    const brand = SITE[url.hostname.toLowerCase()];
    if (!brand) return response; // preview deploys and unknown hosts: leave untouched

    const slug = url.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const meta = slug ? ROUTES[slug] : HOME[brand];
    if (!meta) return response;

    const origin = 'https://' + url.hostname;
    const canonical = origin + (slug ? '/' + slug : '/');
    const image = origin + meta.i;

    return new HTMLRewriter()
      .on('title', new SetText(meta.t))
      .on('meta[name="description"]', new SetContent(esc(meta.d)))
      .on('meta[property="og:title"]', new SetContent(esc(meta.t)))
      .on('meta[property="og:description"]', new SetContent(esc(meta.d)))
      .on('meta[property="og:url"]', new SetContent(canonical))
      .on('meta[property="og:image"]', new SetContent(image))
      .on('meta[name="twitter:title"]', new SetContent(esc(meta.t)))
      .on('meta[name="twitter:description"]', new SetContent(esc(meta.d)))
      .on('meta[name="twitter:image"]', new SetContent(image))
      .on('link[rel="canonical"]', new SetHref(canonical))
      .transform(response);
  } catch (e) {
    return response; // never let metadata polish break the site
  }
}
