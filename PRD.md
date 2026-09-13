# PRD: design-system-demo

## What this project is

A learning project for a course on AI and design systems. It takes Figma's
open-source **Simple Design System (SDS)**, a React + TypeScript component
library, and uses it to practice design-to-code workflows where Claude Code
reads a Figma design through the Figma MCP tools and writes matching React
code using the existing components.

The repo is both the component library and two small demo apps built from it:

- the **marketing-site demo** that ships with SDS (`index.html`), and
- the **Sample UI demo** (`sample-ui.html`), a form card generated from the
  `design-system-demo-website` Figma file. This is the part we wrote.

## Goals

1. Learn how a design system's tokens, components, and Figma files stay in
   sync with code.
2. Practice prompting Claude Code to implement a Figma design using only the
   existing SDS primitives, compositions, and layout components.
3. Keep the round trip working in both directions: Figma to code, and code
   changes pushed back into Figma through the Desktop Bridge plugin.
4. Keep the development environment fully inside a dev container so nothing
   beyond Colima and VS Code lives on the Mac.

## Non-goals

- This is not a production design system. Accessibility and token discipline
  still matter, but there is no versioning, packaging, or release process.
- We do not restyle or refactor the upstream SDS library code. It is treated
  as vendored code we only touch for necessary fixes. See `CLAUDE.md`.
- No Tailwind, DaisyUI, Flask, or Alpine.js. The stack is fixed by SDS
  (React, Vite, react-aria-components, CSS custom properties). This is an
  accepted deviation from the global project conventions.
- No automated test runner for now. Correctness is checked with `tsc`,
  ESLint, and visual review in Storybook and the running app.

## Users

- **Doug**, the developer, learning the workflow.
- **Course reviewers and visitors** who open the repo, the demo recording in
  the README, or the two public Figma files.

## Constraints

- Node 22, npm, and the dev container defined in `.devcontainer/`.
- All colors, spacing, radii, and typography come from the `--sds-*` custom
  properties in `src/theme.css`, which is generated from Figma. Never
  hardcode a value.
- Layout uses the `Flex`, `Grid`, and `Section` components, not custom CSS.
- Figma access needs a personal access token in `.env`; see the README.

## Milestones

Each milestone ends with something that can be run and seen working.

### Milestone 1: Dev container runs the project (done)

- Colima plus a VS Code dev container with Node, git, the GitHub CLI, and
  Claude Code inside it.
- **Result:** `npm run app:dev` serves the SDS marketing demo at
  `localhost:8000` from inside the container.

### Milestone 2: SDS imported and Figma MCP wired up (done)

- SDS source imported into the repo. Storybook lists every primitive,
  composition, and layout component.
- `.mcp.json` configures the remote `figma` server and the local
  `figma-console` server. The Figma Desktop Bridge plugin connects to the
  container over ports 9223 to 9232.
- **Result:** Claude Code can read a node from the `design-system-demo-sds`
  or `design-system-demo-website` file and describe it.

### Milestone 3: Sample UI generated from Figma (done)

- `src/examples/SampleUI.tsx` generated from the website Figma file using
  only existing SDS components: `Card`, `Avatar`, `SelectField`,
  `ButtonGroup`, and `IconButton`, with a light/dark theme toggle.
- Follow-up fixes made from prompts: field description order, body group
  spacing, bold field labels, and swapping a danger button for a stacked
  Cancel/Okay button group, with the Figma file updated in the same prompt.
- Storybook upgraded to v10 so component review keeps working.
- **Result:** `localhost:8000/sample-ui.html` matches the Figma design, and
  the README links a recording of the round-trip change.

### Milestone 4: Repo aligned with the global project conventions (done)

- This PRD, an architecture document with Mermaid diagrams
  (`ARCHITECTURE.md`), and code-style and stack notes in `CLAUDE.md`.
- Dev container moved to Microsoft's `javascript-node` image with the
  `~/.claude` bind mount, ESLint and Prettier extensions, format-on-save, and
  a readable post-create script.
- Prettier declared as a dev dependency with its config in `.prettierrc`.
  Four leftover Storybook 8 packages removed so `npm install` resolves
  cleanly on a fresh container.
- Our own code (`src/examples/SampleUI.tsx`) rewritten to the beginner-friendly
  style rules. Upstream SDS code left as is.
- `npm run app:lint` scoped to the files we own, because the full run fails on
  upstream SDS code we do not restyle. `npm run app:lint:all` keeps the full
  run available.
- **Result:** a new contributor can read the three docs and understand what
  the project is, how it is built, and which files they may change.

### Milestone 5: Publish Code Connect (next)

- Run `npx figma connect publish` so Figma Dev Mode shows the real React
  source for each SDS component instead of generic CSS.
- **Result:** selecting a Button in the SDS Figma file shows
  `src/ui/primitives/Button/Button.tsx` usage in the Dev Mode panel.

### Milestone 6: Restore the GitHub Pages deploy (next)

- Bring back the GitHub Actions workflow that builds the app and Storybook
  and publishes `dist/` to GitHub Pages.
- **Result:** both demos and Storybook are reachable at a public URL that
  updates on every push to `main`.

### Milestone 7: Second Figma-to-code example (later)

- Pick a larger frame from the website file (for example a settings page)
  and implement it the same way as the Sample UI, including the data layer
  in `src/data` if the design needs realistic content.
- **Result:** a third HTML entry point in `vite.config.ts` that renders the
  new page.

## Open questions

- Should the Sample UI's light/dark override in `sample-ui-theme.css` be
  regenerated by `scripts/tokens` rather than mirrored by hand? Today it must
  be re-synced manually whenever the Figma color variables change.
- Whether to add a small test runner (Vitest) once there is more of our own
  logic to test. Right now the only non-upstream code is one page.
