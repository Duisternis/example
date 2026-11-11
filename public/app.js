// Example: a small build dashboard. Every number here is made up. It exists so the portfolio has a
// real site to count: pages to move between, buttons that do things, and a search box.
const $ = (s, el = document) => el.querySelector(s)
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
// tell the portfolio's script what happened; harmless when it is not there
const count = (name, value, label) => window.analytics?.track(name, value, label)

// ---- the data: a fortnight of builds, newest first
const BRANCHES = ['main', 'feat/search', 'fix/header', 'feat/export', 'main', 'chore/deps']
const runs = Array.from({ length: 14 }, (_, k) => {
  const n = 2841 - k
  return {
    id: 'build-' + n,
    branch: BRANCHES[(n * 7) % BRANCHES.length],
    status: n % 6 === 0 ? 'failed' : n % 13 === 0 ? 'running' : 'passed',
    secs: 70 + ((n * 37) % 120),
    when: k === 0 ? 'Today, 09:12' : k < 3 ? 'Today, ' + (8 - k) + ':40' : k < 6 ? 'Yesterday' : (k - 4) + ' days ago',
  }
})
const GLYPH = { passed: '✓', failed: '✕', running: '○' }
const time = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
const days = (n) => Array.from({ length: n }, (_, k) => 40 + ((k * 53 + (k % 5) * 29) % 60))

const DOCS = [
  { id: 'getting-started', title: 'Getting started', body: 'Connect a repository and Example runs your build on every push. The first run takes a little longer while it caches dependencies.' },
  { id: 'runs', title: 'Runs', body: 'A run is one build of one branch. Start one by hand from the Runs page, or retry a failed run from its row. Logs stay for thirty days.' },
  { id: 'reports', title: 'Reports', body: 'Reports summarise runs over seven, thirty or ninety days. Export a report as a CSV file to open it anywhere else.' },
  { id: 'retries', title: 'Retries', body: 'Turn on automatic retries in Settings and a failed run is tried once more before it is marked as failed.' },
  { id: 'branches', title: 'Branches', body: 'Every branch with a push is built. Only the default branch counts towards the success rate on the Overview.' },
  { id: 'notifications', title: 'Notifications', body: 'Get a message when a run fails and another when it recovers. Quiet hours are not supported yet.' },
]
const CHANGES = [
  ['2.4.0', 'Export reports as CSV, and a date range for every report.'],
  ['2.3.1', 'Failed runs can be retried from their row.'],
  ['2.3.0', 'Search the docs from any page.'],
  ['2.2.0', 'Automatic retries, off by default.'],
]

// ---- the pages
const pages = {
  '/': {
    title: 'Overview',
    html: () => `
      <div class="page">
        <div class="head"><h1>Overview</h1><span class="sp"></span><span class="sub">Last 30 days</span></div>
        <section data-section="summary" class="stats">
          <div class="stat"><span>Runs</span><b>1,284</b><small>+12% on the 30 days before</small></div>
          <div class="stat"><span>Success rate</span><b>97.4%</b><small>+0.6%</small></div>
          <div class="stat"><span>Median time</span><b>2m 12s</b><small>−8s</small></div>
          <div class="stat"><span>Active branches</span><b>14</b><small>+3</small></div>
        </section>
        <section data-section="chart">
          <h2>Runs per day</h2>
          <div class="bars" style="margin-top:12px">${days(30).map((h, k) => `<i style="height:${h}%" title="${h * 2} runs"></i>`).join('')}</div>
          <div class="axis"><span>30 days ago</span><span>Today</span></div>
        </section>
        <section data-section="recent">
          <h2>Recent</h2>
          <div class="rows" style="margin-top:8px">
            ${runs.slice(0, 5).map((r) => runRow(r, false)).join('')}
          </div>
          <a class="btn" href="/runs" data-link style="margin-top:8px">All runs</a>
        </section>
      </div>`,
  },
  '/runs': {
    title: 'Runs',
    html: () => `
      <div class="page">
        <div class="head">
          <h1>Runs</h1><span class="sp"></span>
          <div class="seg" role="group" aria-label="Status">
            ${['All', 'Passed', 'Failed', 'Running'].map((f) => `<button class="btn" data-filter="${f}" aria-pressed="${f === state.filter}">${f}</button>`).join('')}
          </div>
          <select id="branch" aria-label="Branch"><option>All branches</option>${[...new Set(runs.map((r) => r.branch))].map((b) => `<option>${esc(b)}</option>`).join('')}</select>
          <button class="btn primary" id="start" data-track="Start run">Start run</button>
        </div>
        <section data-section="list"><div class="rows" id="list">${list()}</div></section>
        <section data-section="logs">
          <h2>Logs</h2>
          <div class="log" id="log" style="margin-top:8px">${logOf(runs[0])}</div>
        </section>
      </div>`,
    after() {
      $('#start').onclick = startRun
      $('#branch').onchange = (e) => {
        state.branch = e.target.value
        $('#list').innerHTML = list()
        count('filter applied', null, state.branch)
      }
      document.querySelectorAll('[data-filter]').forEach((b) => (b.onclick = () => {
        state.filter = b.dataset.filter
        render()
        count('filter applied', null, state.filter)
      }))
      $('#list').onclick = (e) => {
        const retry = e.target.closest('[data-retry]')
        if (retry) return retryRun(retry.dataset.retry)
        const row = e.target.closest('[data-run]')
        if (!row) return
        $('#log').innerHTML = logOf(runs.find((r) => r.id === row.dataset.run))
        document.querySelectorAll('[data-run]').forEach((x) => x.setAttribute('aria-selected', x === row))
      }
    },
  },
  '/reports': {
    title: 'Reports',
    html: () => {
      const f = { 7: 0.25, 30: 1, 90: 3 }[state.range]
      return `
      <div class="page">
        <div class="head">
          <h1>Reports</h1><span class="sp"></span>
          <div class="seg" role="group" aria-label="Range">
            ${[7, 30, 90].map((d) => `<button class="btn" data-range="${d}" aria-pressed="${d === state.range}">${d} days</button>`).join('')}
          </div>
          <button class="btn primary" id="export" data-track="Export CSV">Export CSV</button>
        </div>
        <section data-section="summary" class="stats">
          <div class="stat"><span>Runs</span><b>${Math.round(1284 * f).toLocaleString()}</b></div>
          <div class="stat"><span>Passed</span><b>${Math.round(1250 * f).toLocaleString()}</b></div>
          <div class="stat"><span>Failed</span><b>${Math.round(34 * f).toLocaleString()}</b></div>
          <div class="stat"><span>Median time</span><b>2m 12s</b></div>
        </section>
        <section data-section="trend">
          <h2>Success rate</h2>
          <div class="bars" style="margin-top:12px">${days(Math.min(state.range, 45)).map((h) => `<i style="height:${50 + h / 2}%"></i>`).join('')}</div>
        </section>
        <section data-section="failures">
          <h2>Most failures</h2>
          <div class="rows" style="margin-top:8px">
            ${['feat/search', 'fix/header', 'chore/deps'].map((b, k) => `<div class="row" style="grid-template-columns:minmax(0,1fr) 80px"><span>${b}</span><span class="right num">${Math.round((9 - k * 3) * f)}</span></div>`).join('')}
          </div>
        </section>
      </div>`
    },
    after() {
      document.querySelectorAll('[data-range]').forEach((b) => (b.onclick = () => {
        state.range = Number(b.dataset.range)
        render()
      }))
      $('#export').onclick = () => {
        const csv = ['id,branch,status,seconds', ...runs.map((r) => [r.id, r.branch, r.status, r.secs].join(','))].join('\n')
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `runs-${state.range}d.csv` })
        a.click()
        URL.revokeObjectURL(a.href)
        count('report exported', runs.length, `${state.range} days`)
      }
    },
  },
  '/settings': {
    title: 'Settings',
    html: () => `
      <div class="page" style="max-width:640px">
        <div class="head"><h1>Settings</h1></div>
        <section data-section="notifications">
          <h2>Notifications</h2>
          <div class="field"><span>Message me when a run fails</span><button class="switch" role="switch" aria-checked="${state.notify}" id="notify" aria-label="Notifications"></button></div>
          <div class="field"><span>Name shown on runs</span><input class="input" id="name" value="${esc(state.name)}" /></div>
        </section>
        <section data-section="builds">
          <h2>Builds</h2>
          <div class="field"><span>Retry a failed run once</span><button class="switch" role="switch" aria-checked="${state.retry}" id="retry" aria-label="Retries"></button></div>
          <div class="field"><span>Default branch</span><select id="def"><option>main</option><option>develop</option></select></div>
        </section>
        <div class="head"><button class="btn primary" id="save">Save</button><span class="muted" id="saved"></span></div>
      </div>`,
    after() {
      document.querySelectorAll('.switch').forEach((s) => (s.onclick = () => {
        s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true')
        state[s.id] = s.getAttribute('aria-checked') === 'true'
      }))
      $('#save').onclick = () => {
        state.name = $('#name').value
        $('#saved').textContent = 'Saved'
        setTimeout(() => ($('#saved') ? ($('#saved').textContent = '') : 0), 1500)
        count('settings saved')
      }
    },
  },
  '/docs': {
    title: 'Docs',
    html: () => `
      <div class="page">
        <div class="head"><h1>Docs</h1><span class="sp"></span><input class="input" id="q" placeholder="Search the docs" style="width:240px" autocomplete="off" /></div>
        <div class="muted" id="found"></div>
        <div style="display:flex;flex-direction:column;gap:32px" id="docs">${docList('')}</div>
      </div>`,
    after() {
      let said = ''
      let timer
      const run = () => {
        const q = $('#q').value.trim().toLowerCase()
        $('#docs').innerHTML = docList(q)
        $('#found').textContent = q ? `${hits(q).length} ${hits(q).length === 1 ? 'result' : 'results'}` : ''
        // what they typed and whether it found anything, once the typing has settled
        clearTimeout(timer)
        if (q.length >= 2 && q !== said) timer = setTimeout(() => count('search', hits(q).length, (said = q)), 700)
      }
      $('#q').oninput = run
    },
  },
  '/changelog': {
    title: 'Changelog',
    html: () => `
      <div class="page">
        <div class="head"><h1>Changelog</h1></div>
        <div style="display:flex;flex-direction:column;gap:20px">
          ${CHANGES.map(([v, t]) => `<section data-section="v${v}" class="log-entry"><b>${v}</b><span class="muted">${t}</span></section>`).join('')}
        </div>
      </div>`,
  },
}

// ---- pieces
const state = { filter: 'All', branch: 'All branches', range: 30, notify: true, retry: false, name: 'Varnan' }
const runRow = (r, retry = true) => `
  <div class="row" data-run="${r.id}" role="button" tabindex="0" style="cursor:pointer">
    <span class="glyph ${r.status === 'passed' ? 'ok' : r.status === 'running' ? 'live' : ''}">${GLYPH[r.status]}</span>
    <span class="ellipsis">${r.id}</span>
    <span class="muted ellipsis">${esc(r.branch)}</span>
    <span class="muted num">${time(r.secs)}</span>
    <span class="right muted">${r.status === 'failed' && retry ? `<button class="btn" data-retry="${r.id}">Retry</button>` : r.when}</span>
  </div>`
const list = () => {
  const rows = runs.filter((r) => (state.filter === 'All' || r.status === state.filter.toLowerCase()) && (state.branch === 'All branches' || r.branch === state.branch))
  return rows.length ? rows.map((r) => runRow(r)).join('') : '<div class="muted" style="padding:8px 0">No runs match.</div>'
}
const logOf = (r) => `<b>${r.id}</b> on ${esc(r.branch)}<br>checkout ok<br>install ${r.secs > 150 ? 'slow' : 'cached'}<br>test ${r.status === 'failed' ? '<b>1 failed</b>' : 'passed'}<br>${r.status === 'running' ? 'still running…' : 'done in ' + time(r.secs)}`
const hits = (q) => DOCS.filter((d) => (d.title + ' ' + d.body).toLowerCase().includes(q))
const docList = (q) => {
  const found = q ? hits(q) : DOCS
  return found.length
    ? found.map((d) => `<article class="doc" data-section="${d.id}"><h2>${d.title}</h2><p>${d.body}</p></article>`).join('')
    : '<div class="muted">Nothing found. Try another word.</div>'
}
let busy = false
function startRun() {
  if (busy) return
  busy = true
  const b = $('#start')
  b.textContent = 'Starting…'
  count('run started', null, state.branch === 'All branches' ? 'main' : state.branch)
  // a run takes a moment to appear, as a real one does
  setTimeout(() => {
    runs.unshift({ id: 'build-' + (Number(runs[0].id.slice(6)) + 1), branch: state.branch === 'All branches' ? 'main' : state.branch, status: 'running', secs: 0, when: 'Just now' })
    busy = false
    $('#start') && ($('#start').textContent = 'Start run')
    if (location.pathname === '/runs') render()
    setTimeout(() => {
      runs[0].status = 'passed'
      runs[0].secs = 128
      if (location.pathname === '/runs') $('#list').innerHTML = list()
    }, 2500)
  }, 1800)
}
function retryRun(id) {
  const r = runs.find((x) => x.id === id)
  r.status = 'running'
  $('#list').innerHTML = list()
  count('run retried', null, r.branch)
  setTimeout(() => {
    r.status = 'passed'
    if (location.pathname === '/runs') $('#list').innerHTML = list()
  }, 2200)
}

// ---- the router: links change the page without loading one
function render() {
  const p = pages[location.pathname] ?? pages['/']
  document.title = p.title + ' · Example'
  $('#view').innerHTML = p.html()
  p.after?.()
  document.querySelectorAll('nav a[data-link]:not(.brand)').forEach((a) => (a.getAttribute('href') === location.pathname ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')))
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]')
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  if (a.pathname !== location.pathname) {
    history.pushState({}, '', a.pathname)
    render()
    scrollTo(0, 0)
  }
})
addEventListener('popstate', render)
render()
