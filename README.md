# Example

A small build dashboard, used as the model repository for the portfolio. This paragraph is the project overview on the site, so say plainly what the project does and why it exists before anything else.

This repo shows everything the portfolio can render from a project. Copy its layout for a new project, or check an existing one against it.

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
| Gallery | Images in the `.portfolio/` folder |
| Status | Activity: pushed in the last 30 days is Building, a release or a Website makes it Live, an archived repo is Archived |
| Built with | The languages GitHub detects, or `stack` (a list, or a map of name to a short note on what it does here) |
| Figures | `figures`: up to three `[number, label]` pairs shown under the overview, only when a number says it better |
| Activity | Commits, published releases, and closed GitHub milestones |
| Milestones | `milestones` in `portfolio.json` |
| Writing | Posts with `project: example` in their front matter |

## Gallery

Put images in a `.portfolio/` folder. They show in filename order, up to twelve, and the file name is the caption: `01-overview.png` is shown as "overview".

- `01-overview.png` serves both light and dark themes.
- `01-overview.light.png` and `01-overview.dark.png` serve one theme each. If only one of the two exists, it is used for both.

The images in this repo's `.portfolio/` folder come in both themes. Without the folder, the images in the README are used instead, up to six.

## Milestones

List checkpoints in `portfolio.json`. A milestone is done on the date of the first commit whose title contains all of its words, so a commit titled `feat: first working version` completes "First working version". Until then it appears under Planned.

## Hiding a repo

Set `"hide": true`, or delete `portfolio.json`.
