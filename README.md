# design-system-demo

SDS (Simple Design System) is a React + TypeScript component library with deep Figma Code Connect integration — both a design system and a demo of Figma MCP-driven, design-to-code workflows.

## Getting started

The recommended path is VS Code + Dev Containers, which matches how this repo is actually developed and requires no local Node install. A manual path is included as an alternative.

### Option A: VS Code Dev Container (recommended)

1. **Install prerequisites**
   - [VS Code](https://code.visualstudio.com/)
   - The [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) (`ms-vscode-remote.remote-containers`)
   - A Docker runtime — this repo is developed against [Colima](https://github.com/abiosoft/colima), but Docker Desktop or any other Docker context works too.
2. **Clone the repo and open it in VS Code**
   ```bash
   git clone https://github.com/dscamahorn/design-system-demo.git
   code design-system-demo
   ```
3. **Reopen in container**: VS Code should prompt automatically; otherwise open the Command Palette (`Cmd/Ctrl+Shift+P`) → **Dev Containers: Reopen in Container**.
   - This builds from a Node 22 base image (`.devcontainer/devcontainer.json`), installs the GitHub CLI feature, installs the Claude Code CLI, and forwards the ports used by the app, Storybook, and the Figma console MCP bridge (8000, 6006, 9223–9232).
   - It also installs the [GitHub Pull Requests extension](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-pull-request-github) (`GitHub.vscode-pull-request-github`) inside the container.
4. Once the container is up, open a terminal in VS Code, run `npm install`, then continue with the "Run it" commands below.

### Option B: Manual setup

1. **Install Node 22** and clone the repo:
   ```bash
   git clone https://github.com/dscamahorn/design-system-demo.git
   cd design-system-demo
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```

### Run it

```bash
npm run app:dev       # http://localhost:8000 — marketing-site demo (/) and Sample UI demo (/sample-ui.html)
npm run storybook     # http://localhost:6006 — component-by-component docs and visual review
```

No test runner is configured — correctness is verified via `npm run app:build` (runs `tsc`), `npm run app:lint`, and Storybook visual review.

### Optional: Figma personal access token (PAT)

Needed for both the Figma sync scripts below and the `figma-console` MCP server — create one PAT and reuse it in both places:

1. In Figma, go to your **account settings** (click your avatar, top left) → **Security** tab.
2. Scroll to **Personal access tokens** → **Generate new token**.
3. Give it a name (e.g. `design-system-demo`) and grant scopes for **Code Connect**, **Variables** (read), and **Dev resources** (read/write) — these are what `scripts/tokens`, `scripts/icons`, and `scripts/dev-resources` need.
4. Copy the token immediately — Figma only shows it once.
5. Copy `.env-rename` to `.env` and paste it in as `FIGMA_ACCESS_TOKEN`, along with the SDS file key (`FIGMA_FILE_KEY`, the `r2laq9NyigGR0KZpc05sQm` from the `design-system-demo-sds` URL above).
   - In the Dev Container, `.env` is auto-loaded into the shell on startup (see `.devcontainer/devcontainer.json`'s `postCreateCommand`) so it's available for `.mcp.json`'s `${FIGMA_ACCESS_TOKEN}` variable expansion.

### Optional: Figma sync scripts

Only needed if you want to pull fresh tokens/icons from Figma rather than use what's already checked in (requires the PAT above):

```bash
npm run script:tokens        # syncs design tokens -> src/theme.css, scripts/tokens/tokens.json
npm run script:icons         # syncs the icon set
npm run script:dev-resources
```

### Optional: Figma MCP tools

If you're using Claude Code or another MCP-aware tool to work on this repo with live Figma access, `.mcp.json` in the repo root already configures the `figma` (remote) and `figma-console` (local) MCP servers — the latter needs the `FIGMA_ACCESS_TOKEN` from above (it's referenced as `${FIGMA_ACCESS_TOKEN}`, not hardcoded, so the file is safe to check in and is tracked in git).

**Current workflow**: day-to-day, changes are communicated between design and code using the remote `figma` MCP server together with the local `figma-console` MCP server, with the **Figma Desktop Bridge plugin running in both `design-system-demo-sds` and `design-system-demo-website`**. This gives an MCP-aware tool live read/write access to both files (inspecting nodes, variables, and components; pushing edits back) without needing either file to be exported or re-fetched. The Code Connect mapping in `figma.config.json` (see above) is configured and available as an alternative/complementary path — pointing Figma Dev Mode directly at the real React source per component — but it hasn't been published or relied on yet; everything so far has gone through the Desktop Bridge + MCP servers instead. See `CLAUDE.md` for the fuller workflow notes.

## Figma files

Both files are public — anyone can open them without requesting access, and can use **File → Duplicate** in Figma to copy either into their own account.

- [design-system-demo-sds](https://www.figma.com/design/r2laq9NyigGR0KZpc05sQm/design-system-demo-sds) — the design system source of truth: the primitive/semantic color, size, and typography **variables** that `src/theme.css` is generated from (`npm run script:tokens`), plus the component set that `src/figma/**/*.figma.ts` Code Connect files map back to real React components (`src/ui/`).
- [design-system-demo-website](https://www.figma.com/design/2FY2ycUaQhu2Jjn8udILWP/design-system-demo-website) — the marketing-site page design this repo implements in code (`src/App.tsx` and friends).

**How the two files relate:** `design-system-demo-sds` is the asset library; `design-system-demo-website` is a design built with it. This link exists in two places at once:

1. **In Figma itself**: `design-system-demo-sds` is published as a team library, and `design-system-demo-website` subscribes to it (Figma → Assets panel → Libraries → `design-system-demo-sds`, 1844 components). Any component instance placed in the website file from that library stays connected back to its source component in the SDS file.
2. **In code**: `figma.config.json`'s `codeConnect.documentUrlSubstitutions` hard-codes every `<FIGMA_*>` placeholder to a `node-id` inside `design-system-demo-sds`, and each `*.figma.ts` file under `src/figma/` uses one of those placeholders in its `// url=` comment so Figma Dev Mode/MCP tools can resolve a node in either file back to the matching React component in `src/ui/`. **Note:** this Code Connect setup is wired up and available (`npx figma connect publish` would push it live to Dev Mode), but it hasn't actually been published/used day-to-day yet — see below for the workflow that's actually in use instead.

**Publishing SDS changes and pulling them into the website file:**

1. Make your change in `design-system-demo-sds` (edit a component, add/rename a variable, adjust a style).
2. In that file, open the Assets panel (or the library/book icon in the top bar) — Figma shows a badge for pending unpublished changes. Click **Publish**, review the diff of what changed (components/styles/variables), optionally add a description per change, and confirm.
3. Switch to `design-system-demo-website` (or any other file subscribed to the library). Figma shows an update indicator on the Assets panel/library icon there once the publish lands.
4. Open Assets → Libraries → `design-system-demo-sds` and you'll see an "Updates available" prompt. Review the list of changed components/styles and click **Update** (or update individually per instance) to pull the new versions into this file.
5. Caveats to watch for:
   - Instances with local overrides in the website file may need manual re-review after updating — Figma flags them but won't silently discard your overrides.
   - Detached instances (right-click → "Detach instance") stop receiving library updates entirely.
   - This library relationship only carries **Figma-side** changes (components/styles/variables). It's independent of this repo's code — `src/theme.css`, `src/ui/`, and the Code Connect mapping still need `npm run script:tokens` / manual code changes / re-running Code Connect to reflect an SDS update; publishing in Figma does not touch the codebase.

## Environment

Quick reference — see "Getting started" above for setup steps.

- **Docker runtime**: [Colima](https://github.com/abiosoft/colima) locally; any Docker context works for the Dev Container.
- **Dev Container config**: `.devcontainer/devcontainer.json` — Node 22 base image, GitHub CLI feature, GitHub Pull Requests VS Code extension, Claude Code CLI installed via `postCreateCommand`.
- **GitHub**: repo is connected via `gh`. See remote with `git remote -v`.
- **Framework/package manager**: npm + Vite + React + TypeScript (see `package.json`).
- **Figma MCP**: configured in `.mcp.json` (tracked in git — no secrets in it, just `${FIGMA_ACCESS_TOKEN}` variable expansion) — remote `figma` server plus local `figma-console` server. See `CLAUDE.md` for the workflow.
