// The stats contract the portfolio reads (version 1): aggregates only, never a visitor.
// The numbers are made up. They move with the date, so the page looks alive, and the 7 and 30
// day figures are slices of the same 90 days, so the periods agree with each other.

const DAY = 864e5
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

const PAGES = [
  ['/', 0.34],
  ['/runs', 0.26],
  ['/reports', 0.17],
  ['/settings', 0.1],
  ['/docs', 0.08],
  ['/changelog', 0.05],
] as const
const COUNTRIES = [
  ['United States', 0.34],
  ['India', 0.19],
  ['Germany', 0.1],
  ['United Kingdom', 0.09],
  ['Canada', 0.06],
  ['Brazil', 0.05],
  ['Other', 0.17],
] as const
const SOURCES = [
  ['Direct', 0.36],
  ['Search', 0.28],
  ['GitHub', 0.2],
  ['Social', 0.1],
  ['Other', 0.06],
] as const
const DEVICES = [
  ['Desktop', 0.62],
  ['Mobile', 0.34],
  ['Tablet', 0.04],
] as const

// a share table scaled to a total, nudged a little per period so the periods are not copies
function split(rows: readonly (readonly [string, number])[], total: number, seed: number) {
  const r = rng(seed)
  const w = rows.map(([, s]) => s * (0.85 + r() * 0.3))
  const sum = w.reduce((a, b) => a + b, 0)
  const out = rows.map(([label], i) => ({ label, n: Math.round((total * w[i]!) / sum) }))
  // rounding must not change the total
  out[out.length - 1]!.n += total - out.reduce((a, r) => a + r.n, 0)
  return out
}

export function build(now = new Date()) {
  const end = new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z')
  const days = Array.from({ length: 90 }, (_, k) => {
    const d = new Date(+end - (89 - k) * DAY)
    const r = rng(d.getUTCDate() * 97 + d.getUTCMonth() * 31 + 7)
    const week = [0.7, 1, 1.05, 1.1, 1.05, 0.9, 0.65][d.getUTCDay()]!
    const visitors = Math.round(80 * week * (1 + k / 270) * (0.75 + r() * 0.5))
    return {
      date: d.toISOString().slice(0, 10),
      visitors,
      views: Math.round(visitors * (1.9 + r() * 0.8)),
    }
  })
  const periods: Record<string, unknown> = {}
  for (const n of [7, 30, 90]) {
    const daily = days.slice(-n)
    const visitors = daily.reduce((a, d) => a + d.visitors, 0)
    const views = daily.reduce((a, d) => a + d.views, 0)
    periods[n] = {
      visitors,
      views,
      duration: Math.round(96 + n / 3),
      bounce: Math.round((56 - n / 12) * 10) / 10,
      daily,
      pages: split(PAGES, views, n + 1),
      countries: split(COUNTRIES, visitors, n + 2),
      sources: split(SOURCES, visitors, n + 3),
      devices: split(DEVICES, visitors, n + 4),
    }
  }
  return { version: 1, site: 'Example', updated: now.toISOString(), periods }
}

export function GET() {
  return Response.json(build(), {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
