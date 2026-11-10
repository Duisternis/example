# Example project

A one-paragraph summary goes here, in plain sentences. The portfolio shows the first paragraph of this README as the project overview, so say what the project does and why it exists before anything else.

## How a repo gets on the portfolio

A public repo appears only if it has a `portfolio.json` at the root. An empty `{}` is enough. Everything below is read from the repo; only the file's keys are ever written by hand.

- **Name:** the repository name.
- **Tagline:** the repository description (About, on the right of the repo page), or `tagline` in `portfolio.json`.
- **Demo button:** the Website field in the same About box, or `demo` in `portfolio.json`.
- **Overview:** the first paragraph of this README, or `overview` in `portfolio.json`.
- **Gallery:** the images in a `.portfolio/` folder, in filename order, up to twelve. The file name is the caption, so `01-overview.png` shows as "overview". Without that folder, the images in this README are used instead, up to six.
- **Status:** worked out from activity. A push in the last 30 days is Building. A release or a Website makes it Live. Archiving the repo marks it Archived.
- **Stack:** the languages GitHub detects.
- **Activity:** commits, published releases, closed GitHub milestones, and `milestones` from `portfolio.json`.
- **Milestones:** a milestone is done on the date of the first commit whose title contains all its words, and shown as planned until then.
- **Writing:** a post with `project: example-project` in its front matter shows up on the project page.
- **Hiding:** `"hide": true` in `portfolio.json`, or delete the file.
