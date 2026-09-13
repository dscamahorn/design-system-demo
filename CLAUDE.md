# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is **SDS (Simple Design System)** — a React + TypeScript component library with deep Figma Code Connect integration. It's both a design system and a demo of Figma MCP-driven, design-to-code workflows. There are two demo apps built from the same component library (a marketing-site demo and a "Sample UI" form-heavy demo).

`PRD.md` holds the goals and milestones. `ARCHITECTURE.md` holds the Mermaid diagrams of the system and the Figma-to-code loop. Keep both current when the project changes.

## Stack and file tiers (read before editing)

**Stack.** This is a fork of Figma's SDS, so the stack is fixed: React 18, Vite, TypeScript, `react-aria-components`, and plain CSS driven by `--sds-*` custom properties. Per the global CLAUDE.md, the project stack wins; do not introduce Tailwind, DaisyUI, or a CSS-in-JS library.

**File tiers.** The global CLAUDE.md defines three tiers (generated, upstream, our own). Here is how this repo maps onto them:

1. **Generated:** `src/ui/icons/` and `src/theme.css` (written by `npm run script:icons` and `npm run script:tokens`).
2. **Upstream SDS:** everything else under `src/ui/`, plus `src/data/`, `src/figma/`, `src/stories/`, `src/App.tsx`, and the marketing-demo sections in `src/examples/` (`Demo`, `FAQs`, `PanelSections`, `PricingGrid`, `ProductDetails`, `ProductGrid`, `WelcomeHero`). Restyling these would break upstream syncs and the Code Connect mappings.
3. **Our own:** `src/examples/SampleUI.tsx`, `src/examples/sample-ui-theme.css`, `src/sample-ui-main.tsx`, `sample-ui.html`, and any new file we add. React's own hook callbacks may be inline functions; name them where possible. `npm run app:lint` lists these files explicitly, so add any new file of ours to that script.

When in doubt, run `git log --diff-filter=A -- <file>`; anything added in the SDS import commit that we did not write is upstream.

**Prettier.** `.prettierrc` keeps the `prettier-plugin-organize-imports` plugin that SDS uses instead of the empty default config the global file asks for, so import order stays consistent with upstream files.

## Commands

```bash
npm run app:dev             # Vite dev server at localhost:8000 (serves both index.html and sample-ui.html)
npm run app:build           # tsc typecheck + vite build
npm run app:lint            # eslint on the files we own only (see "Stack and file tiers"); add new files of ours here
npm run app:lint:all        # eslint on the whole repo; fails on upstream SDS code, kept for reference
npm run storybook           # Storybook dev server at localhost:6006
npm run storybook:build     # Build static Storybook to dist/storybook
npm run build               # app:build then storybook:build (used for the full site deploy)

# Figma sync scripts (require a .env with a Figma token; see scripts/*/app.mjs)
npm run script:tokens       # Sync design tokens from Figma -> scripts/tokens/tokens.json, styles.json
npm run script:icons        # Sync icon set from Figma
npm run script:dev-resources
# Each has a `:rest` variant that also hits the Figma REST API instead of skipping it (--skip-rest-api)
```

There is no test runner configured in this repo — correctness is verified via `tsc` (through `app:build`), `npm run app:lint`, and Storybook visual review.

To check a single component in isolation, open its story directly in Storybook rather than filtering the whole suite (e.g. run `npm run storybook` and navigate to the story under `src/stories/primitives/<Name>.stories.tsx`).

## Architecture

### Two parallel trees describing the same components: `src/ui/` and `src/figma/`

- **`src/ui/`** is the actual component library (this is what application code imports).
  - `primitives/` — atomic components (Button, Input, Select, Dialog, etc.), each in its own folder with a `.tsx` and a co-located `.css` file (e.g. `Button/Button.tsx` + `Button/button.css`). No CSS modules/styled-components — plain class names composed with `clsx`.
  - `compositions/` — larger patterns assembled from primitives (Cards, Forms, Headers/Footers). Forms compositions are meant as _examples_, not a form-building abstraction.
  - `layout/` — `Flex`, `Grid`, `Section`: the only sanctioned way to position things. Custom layout CSS is a smell in this codebase.
  - `icons/` — one file per Feather-style icon, generated/synced from Figma (do not hand-edit; re-run `script:icons`).
  - `hooks/`, `utils/`, `images/` — supporting pieces (`useMediaQuery` is the main responsive hook).
- **`src/figma/`** mirrors the same primitives/compositions/icons structure but contains **Figma Code Connect** files (`*.figma.ts`), which map Figma component instances to the React code above so Figma's Dev Mode / MCP tools can show real code. These are config, not runtime code — see `figma.config.json` for the `include` glob and the `<FIGMA_*>` node-id placeholders it substitutes in per-file `// url=` comments.

### `src/data/` — mock data/business logic layer, independent of the design system

`contexts/` + `providers/` + `services/` + `types/`, each split by domain (`auth`, `pricing`, `products`), plus `hooks/` (`useAuth`, `usePricing`, `useProducts`). `AllProviders` composes all three providers. This layer exists to give the example apps something realistic to render — it's not part of the design system itself.

### Import aliases

Both `tsconfig.json` (`paths`) and `vite.config.ts` (`resolve.alias`) define the same bare-specifier aliases — keep them in sync if either changes:

```tsx
import { Footer, Header } from "compositions";
import { useAuth, usePricing, useProducts, AllProviders } from "data";
import { useMediaQuery } from "hooks";
import { IconChevronLeft } from "icons";
import { placeholder } from "images";
import { Flex, Section } from "layout";
import { Accordion, Button, TextContentHeading } from "primitives";
import { AnchorOrButtonProps } from "utils";
```

### Two entry points, one component library

- `index.html` / `src/main.tsx` / `src/App.tsx` — the primary marketing-site-style demo (`Header`, `Demo`, `WelcomeHero`, `PanelSections`, `PricingGrid`, `FAQs`, `ProductDetails`, `ProductGrid`, `Footer`), wrapped in `AllProviders`.
- `sample-ui.html` / `src/sample-ui-main.tsx` / `src/examples/SampleUI.tsx` — a separate form-centric demo with its own theme override (`src/examples/sample-ui-theme.css`).
- Both are declared as separate Rollup inputs in `vite.config.ts` (`build.rollupOptions.input`).

### Design tokens

All design tokens live as CSS custom properties in `src/theme.css`, synced from Figma. **Never hardcode colors, spacing, radii, shadows, or typography** — always reference the `--sds-*` variables (`--sds-color-*`, `--sds-size-space-*`, `--sds-size-radius-*`, `--sds-typography-*`/`--sds-font-*`, `--sds-effects-shadows-*`). Numeric spacing props on layout components (e.g. `<Section padding="400">`) map directly to `--sds-size-space-400`.

### Figma MCP / Code Connect workflow

When implementing a Figma design in this repo (via the `figma` or `figma-console` MCP tools):

1. Extract the design with the Figma MCP tools first — don't guess at layout/content.
2. Map Figma components to existing `src/ui` primitives/compositions/layouts using the `codeDependencies` field from the MCP response; only fall back to something new if no existing component fits, and confirm with the user first.
3. Read the actual `.tsx` files for real prop names before writing JSX — don't assume prop names from the Figma layer names (e.g. it's `isSelected`, not `active`).
4. `data-content-annotations` / `data-interaction-annotations` attributes in MCP responses carry human-authored behavioral notes (dynamic text, conditional disabling, etc.) — read them, they're often required to implement the design correctly.
5. `hidden={true}` nodes in Figma data should be ignored/skipped.
6. Apply tokens per the CSS variables section above; use `layout/` components instead of hand-written flex/grid CSS.

`figma.config.json` holds the Code Connect `include` globs and the map of `<FIGMA_*>` placeholder constants to actual `figma.com/design/...?node-id=...` URLs referenced from `*.figma.ts` files.

## Environment

- Dev container: Microsoft's `javascript-node:22-bookworm` image plus the GitHub CLI feature (`.devcontainer/devcontainer.json`), Docker runtime via Colima. The host's `~/.claude` is bind-mounted to `/home/node/.claude` so the global CLAUDE.md and the Claude login are available inside. `.devcontainer/post-create.sh` runs `npm install`, installs the Claude Code CLI into `~/.local/bin`, and makes bash and zsh load `.env`. Everything (git, `gh`, `claude`, builds) runs inside the container.
- `.mcp.json` (tracked in git; it holds no secrets) configures the `figma` (remote HTTP), `figma-console` (local, via `npx figma-console-mcp`), and `design-systems-mcp` (remote HTTP) MCP servers. `figma-console` reads `FIGMA_ACCESS_TOKEN` from the environment, which the dev container loads from the gitignored `.env`.
- Figma sync scripts (`scripts/tokens`, `scripts/icons`, `scripts/dev-resources`) read Figma credentials from `.env` via `node --env-file`.
