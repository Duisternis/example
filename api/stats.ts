// The stats contract the portfolio reads (version 2): the numbers behind its Analytics page, as
// aggregates, never a visitor. Everything here is made up. It moves with the date so the page looks
// alive, and every section is derived from the same daily visitors, so they agree with each other.

const DAY = 864e5;
const rng = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
// shares of a total, rounded so they add up exactly
function split(
  shares: [string, number][],
  total: number,
  note?: (label: string) => string | undefined,
) {
  const all = sum(shares.map(([, s]) => s));
  const out = shares.map(([label, s]) => ({
    label,
    n: Math.round((total * s) / all),
    note: note?.(label),
  }));
  out[0]!.n += total - sum(out.map((r) => r.n));
  return out.map(({ note: x, ...r }) => (x ? { ...r, note: x } : r));
}

export function build(now = new Date()) {
  const end = new Date(now.toISOString().slice(0, 10) + "T00:00:00Z");
  const days = Array.from({ length: 180 }, (_, k) => {
    const d = new Date(+end - (179 - k) * DAY);
    const r = rng(d.getUTCDate() * 97 + d.getUTCMonth() * 31 + 7);
    const week = [0.7, 1, 1.05, 1.1, 1.05, 0.9, 0.65][d.getUTCDay()]!;
    const visitors = Math.round(80 * week * (1 + k / 540) * (0.75 + r() * 0.5));
    return {
      date: d.toISOString().slice(0, 10),
      visitors,
      views: Math.round(visitors * (1.9 + r() * 0.8)),
      duration: Math.round(110 + r() * 50 + k / 18),
      bounce: Math.round((52 - k / 45 + r() * 6) * 10) / 10,
      conv: Math.round((2.4 + r() * 1.2 + k / 360) * 10) / 10,
    };
  });
  const last = days.slice(-30);
  const v = sum(last.map((d) => d.visitors));
  const w = sum(last.map((d) => d.views));
  const r = rng(now.getUTCDate() + 11);
  const read = (p: string) =>
    p === "/docs" ? "71% read" : p === "/changelog" ? "58% read" : undefined;

  // a daily line for a thing that happens in proportion to the visitors, for the last 16 days
  const line = (share: number, seed: number) => {
    const q = rng(seed);
    return days
      .slice(-16)
      .map((d) => Math.round(d.visitors * share * (0.85 + q() * 0.3)));
  };
  const vital = (
    id: string,
    value: number,
    p90: number,
    p95: number,
    seed: number,
  ) => {
    const q = rng(seed);
    return {
      value,
      p90,
      p95,
      trend: Array.from(
        { length: 30 },
        () => Math.round(value * (0.9 + q() * 0.2) * 100) / 100,
      ),
    };
  };
  const weeks = Array.from(
    { length: 8 },
    (_, i) => new Date(+end - (7 - i) * 7 * DAY),
  );
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const g = (n: number) => Math.round(v * n);

  return {
    version: 2,
    site: "Example",
    sample: true,
    updated: now.toISOString(),
    live: 2 + Math.round(r() * 7),
    days,
    pages: {
      top: split(
        [
          ["/", 34],
          ["/runs", 26],
          ["/reports", 17],
          ["/settings", 9],
          ["/docs", 9],
          ["/changelog", 5],
        ],
        w,
        read,
      ),
      entry: split(
        [
          ["/", 52],
          ["/docs", 20],
          ["/changelog", 14],
          ["/runs", 14],
        ],
        v,
      ),
      exit: split(
        [
          ["/runs", 34],
          ["/", 26],
          ["/reports", 24],
          ["/settings", 16],
        ],
        v,
      ),
    },
    sources: {
      channels: split(
        [
          ["Direct", 36],
          ["Referral", 24],
          ["Organic search", 24],
          ["Social", 10],
          ["Other", 6],
        ],
        v,
      ),
      referrers: split(
        [
          ["GitHub", 40],
          ["Google", 30],
          ["Hacker News", 14],
          ["dev.to", 10],
          ["Other sites", 6],
        ],
        v,
      ),
      utm: split(
        [
          ["utm_source=readme", 50],
          ["utm_source=hn", 30],
          ["utm_campaign=launch", 20],
        ],
        Math.round(v * 0.12),
      ),
    },
    devices: {
      device: split(
        [
          ["Desktop", 66],
          ["Mobile", 30],
          ["Tablet", 4],
        ],
        v,
      ),
      browser: split(
        [
          ["Chrome", 58],
          ["Safari", 22],
          ["Firefox", 14],
          ["Other", 6],
        ],
        v,
      ),
      os: split(
        [
          ["macOS", 38],
          ["Windows", 30],
          ["Linux", 16],
          ["iOS", 10],
          ["Android", 6],
        ],
        v,
      ),
      returning: split(
        [
          ["New", 69],
          ["Returning", 31],
        ],
        v,
      ),
      screen: split(
        [
          ["1440 and wider", 50],
          ["1024 to 1439", 26],
          ["768 to 1023", 8],
          ["Under 768", 16],
        ],
        v,
      ),
    },
    countries: split(
      [
        ["United States of America", 30],
        ["India", 22],
        ["Germany", 10],
        ["United Kingdom", 9],
        ["Canada", 6],
        ["Brazil", 5],
        ["France", 4],
        ["Netherlands", 4],
        ["Japan", 3],
        ["Australia", 3],
        ["Spain", 2],
        ["Poland", 2],
      ],
      v,
    ),
    events: split(
      [
        ["Runs started", 40],
        ["Filters applied", 28],
        ["Reports exported", 14],
        ["Settings saved", 10],
        ["Docs searched", 8],
      ],
      g(0.9),
    ).map((e, i) => ({
      ...e,
      trend: line(e.n / v / 1, i + 21),
    })),
    goals: [
      {
        label: "Run started",
        uniques: g(0.34),
        total: g(0.62),
        conv: 34,
        trend: line(0.62 / 1, 31),
      },
      {
        label: "Report exported",
        uniques: g(0.12),
        total: g(0.17),
        conv: 12,
        trend: line(0.17, 32),
      },
      {
        label: "Settings saved",
        uniques: g(0.07),
        total: g(0.09),
        conv: 7,
        trend: line(0.09, 33),
      },
    ],
    flow: {
      nodes: [
        "Direct",
        "GitHub",
        "Google",
        "Overview",
        "Runs",
        "Reports",
        "Start a run",
        "Export",
        "Leave",
      ],
      links: [
        [0, 3, g(0.3)],
        [1, 3, g(0.2)],
        [2, 4, g(0.2)],
        [0, 4, g(0.1)],
        [3, 4, g(0.24)],
        [3, 5, g(0.14)],
        [3, 8, g(0.12)],
        [4, 6, g(0.22)],
        [4, 5, g(0.1)],
        [4, 8, g(0.16)],
        [5, 7, g(0.1)],
        [5, 8, g(0.18)],
        [6, 8, g(0.18)],
        [7, 8, g(0.1)],
      ],
    },
    funnels: [
      {
        id: "run",
        name: "Visit to first run",
        steps: [
          ["Visited the site", v],
          ["Opened Runs", g(0.52)],
          ["Started a run", g(0.34)],
          ["Run finished", g(0.3)],
        ],
      },
      {
        id: "report",
        name: "Run to report",
        steps: [
          ["Started a run", g(0.34)],
          ["Opened Reports", g(0.19)],
          ["Exported a report", g(0.12)],
        ],
      },
    ],
    retention: weeks.map((d, i) => {
      const rr = rng(i * 13 + 5);
      return {
        label: `${month[d.getUTCMonth()]} ${d.getUTCDate()}`,
        size: Math.round(150 + rr() * 150 + i * 14),
        vals: Array.from({ length: 8 - i }, (_, k) =>
          k === 0
            ? 100
            : Math.round((24 * Math.pow(0.74, k - 1) + rr() * 4) * 10) / 10,
        ),
      };
    }),
    friction: [
      {
        what: "Date range picker on narrow windows",
        kind: "Dead click",
        n: 41,
        where: "/reports",
      },
      {
        what: "Start run before the repo list loads",
        kind: "Rage click",
        n: 17,
        where: "/runs",
      },
      {
        what: "Settings tabs on touch screens",
        kind: "Dead click",
        n: 22,
        where: "/settings",
      },
    ],
    pageReports: [
      {
        path: "/runs",
        title: "Runs",
        visitors: g(0.52),
        sections: [
          ["Recent runs", 100, 52],
          ["Filters", 71, 38],
          ["Run detail", 48, 41],
          ["Logs", 29, 27],
        ],
        elements: [
          ["Start run button", 38],
          ["Branch filter", 24],
          ["Run row", 21],
          ["Logs tab", 9],
        ],
        points: [
          { x: 0.86, y: 0.08, n: 38 },
          { x: 0.3, y: 0.18, n: 24 },
          { x: 0.5, y: 0.44, n: 21 },
          { x: 0.7, y: 0.7, n: 9 },
        ],
        events: [
          ["Run started", g(0.34)],
          ["Filter applied", g(0.2)],
        ],
      },
      {
        path: "/reports",
        title: "Reports",
        visitors: g(0.19),
        sections: [
          ["Summary", 100, 49],
          ["Trends", 66, 40],
          ["Failures", 41, 28],
        ],
        elements: [
          ["Export button", 44],
          ["Date range picker", 31],
          ["Trend chart", 14],
        ],
        points: [
          { x: 0.88, y: 0.08, n: 44 },
          { x: 0.4, y: 0.12, n: 31 },
          { x: 0.5, y: 0.5, n: 14 },
        ],
        events: [["Report exported", g(0.12)]],
      },
    ],
    searches: [
      { term: "retry a run", n: 38, found: 100 },
      { term: "export csv", n: 29, found: 100 },
      { term: "dark mode", n: 21, found: 0 },
      { term: "api token", n: 16, found: 0 },
    ],
    vitals: [
      {
        id: "lcp",
        name: "Largest Contentful Paint",
        unit: "s",
        ...vital("lcp", 1.6, 2.2, 2.8, 40),
        good: 2.5,
        poor: 4,
        max: 6,
        digits: 1,
        note: "how fast the main content appears",
      },
      {
        id: "inp",
        name: "Interaction to Next Paint",
        unit: "ms",
        ...vital("inp", 128, 190, 260, 41),
        good: 200,
        poor: 500,
        max: 700,
        digits: 0,
        note: "how fast the page responds to a click",
      },
      {
        id: "cls",
        name: "Cumulative Layout Shift",
        unit: "",
        ...vital("cls", 0.03, 0.07, 0.11, 42),
        good: 0.1,
        poor: 0.25,
        max: 0.4,
        digits: 2,
        note: "how much the page jumps while loading",
      },
      {
        id: "fcp",
        name: "First Contentful Paint",
        unit: "s",
        ...vital("fcp", 1, 1.4, 1.9, 43),
        good: 1.8,
        poor: 3,
        max: 4,
        digits: 1,
        note: "how fast anything appears",
      },
      {
        id: "ttfb",
        name: "Time to First Byte",
        unit: "ms",
        ...vital("ttfb", 190, 420, 640, 44),
        good: 800,
        poor: 1800,
        max: 2400,
        digits: 0,
        note: "how fast the server answers",
      },
    ],
    vitalPages: [
      { path: "/reports", lcp: 2.6, inp: 171, cls: 0.09, score: 74 },
      { path: "/runs", lcp: 1.9, inp: 140, cls: 0.04, score: 86 },
      { path: "/docs", lcp: 1.3, inp: 96, cls: 0.01, score: 95 },
      { path: "/", lcp: 1.1, inp: 88, cls: 0.01, score: 97 },
    ],
    hours: Array.from({ length: 7 }, (_, d) =>
      Array.from({ length: 24 }, (_, h) => {
        const peak =
          Math.exp(-Math.pow((h - 14) / 5, 2)) +
          0.5 * Math.exp(-Math.pow((h - 20) / 2.5, 2));
        return Math.round(
          100 *
            (d >= 5 ? 0.7 : 1) *
            (0.08 + peak) *
            (0.9 + rng(d * 24 + h + 3)() * 0.2),
        );
      }),
    ),
  };
}

export function GET() {
  return Response.json(build(), {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
