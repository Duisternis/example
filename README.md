# Example

The reference repository for this portfolio. It pretends to be a small build dashboard so that every part of a project page has something to show: a tagline, a demo link, figures, a stack, milestones, a logo and a gallery. The numbers on it are made up.

Copy its layout for a new project, or check an existing one against it.

## Getting a repo onto the portfolio

A public repo appears only if it has a `portfolio.json` at the root. An empty `{}` is enough. Everything else is read from the repo, so there is nothing to keep up to date.

```json
{
  "tagline": "Replaces the repository description",
  "demo": "https://example.com",
  "overview": "Replaces the first README paragraph",
  "milestones": ["First working version", "Public beta"],
  "figures": [["1,284", "runs this month"], ["97%", "pass rate"]],
  "stack": { "TypeScript": "what it does here", "CSS": "and here" },
  "hide": false
}
```

Every key is optional.

## Where each part comes from

| On the page | Read from |
| --- | --- |
| Name | The repository name |
| Tagline | The repository description, or `tagline` |
| Overview | The first paragraph of this README, or `overview` |
| Demo button | The Website field in the repo's About box, or `demo` |
| Source button | The repository itself |
| Logo | `.portfolio/logo.svg` (or `.png`, `.webp`): one colour on a transparent background. The site draws it in the theme colour, so it is dark on light and light on dark. Without it, a default mark is used |
| Gallery | Images in the `.portfolio/` folder |
| Status | Activity: pushed in the last 30 days is Building, a release or a Website makes it Live, an archived repo is Archived |
| Built with | The languages GitHub detects, or `stack` (a list, or a map of name to a short note on what it does here) |
| Figures | `figures`: up to three `[number, label]` pairs shown under the overview, only when a number says it better |
| Activity | Commits, published releases, and closed GitHub milestones |
| Milestones | `milestones` in `portfolio.json` |
| Writing | Posts with `project: example` in their front matter |

## Stats

A project that counts its own visits can show them on the portfolio's Analytics page. Set `"stats"` in `portfolio.json` to a URL that returns JSON, with CORS open (`access-control-allow-origin: *`). It carries aggregates only, never a visitor, and has the shape of the dashboard itself: `version` (2), `site`, `days` (daily `visitors`, `views`, `duration`, `bounce` and `conv`, oldest first, at least 180 of them), then any of `pages`, `sources`, `devices`, `countries`, `events`, `goals`, `flow`, `funnels`, `retention`, `friction`, `pageReports`, `searches`, `vitals`, `vitalPages` and `hours`. Only `days` is required: a section a site leaves out shows as not reported. `"sample": true` tells the page the numbers are made up.

[`api/stats.ts`](api/stats.ts) is a complete example. How the numbers are produced is up to the project.

## Gallery

Put images in a `.portfolio/` folder. They show in filename order, up to twelve, and the file name is the caption: `01-overview.png` is shown as "overview".

- `01-overview.png` serves both light and dark themes.
- `01-overview.light.png` and `01-overview.dark.png` serve one theme each. If only one of the two exists, it is used for both.

The images in this repo's `.portfolio/` folder come in both themes. Without the folder, the images in the README are used instead, up to six.

## Milestones

List checkpoints in `portfolio.json`. A milestone is done on the date of the first commit whose title contains all of its words, so a commit titled `feat: first working version` completes "First working version". Until then it appears under Planned.

## Hiding a repo

Set `"hide": true`, or delete `portfolio.json`.
