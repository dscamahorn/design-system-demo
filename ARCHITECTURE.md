# Architecture

This document shows how the pieces of design-system-demo fit together and
how a Figma design becomes React code. See `PRD.md` for what the project is
for and `CLAUDE.md` for working rules.

## System overview

Three worlds meet in this repo: the Figma files, the tools that read and
write them, and the code itself.

```mermaid
flowchart TB
  subgraph figma["Figma"]
    sdsFile["design-system-demo-sds\n(tokens + component library)"]
    siteFile["design-system-demo-website\n(page designs built from SDS)"]
    sdsFile -- "published team library" --> siteFile
    bridge["Figma Desktop Bridge plugin\n(runs in both files)"]
  end

  subgraph tools["Claude Code (inside the dev container)"]
    claude["Claude Code CLI"]
    remoteMcp["figma MCP server\n(remote, read)"]
    localMcp["figma-console MCP server\n(local, read + write)"]
    claude --> remoteMcp
    claude --> localMcp
  end

  remoteMcp -- "REST" --> sdsFile
  remoteMcp -- "REST" --> siteFile
  localMcp <-- "WebSocket, ports 9223-9232" --> bridge

  subgraph repo["Repository"]
    scripts["scripts/tokens, scripts/icons\n(Figma sync scripts)"]
    theme["src/theme.css\n(--sds-* custom properties)"]
    icons["src/ui/icons\n(generated icon components)"]
    ui["src/ui\nprimitives, compositions, layout,\nhooks, utils, images"]
    codeConnect["src/figma/*.figma.ts\n(Code Connect mappings)"]
    data["src/data\nmock providers, services, hooks"]
    examples["src/examples\nSampleUI.tsx (ours) +\nmarketing demo sections (upstream)"]
    stories["src/stories\n(Storybook)"]
    entryMain["index.html -> main.tsx -> App.tsx"]
    entrySample["sample-ui.html -> sample-ui-main.tsx\n-> SampleUI.tsx"]
  end

  scripts -- "npm run script:tokens" --> theme
  scripts -- "npm run script:icons" --> icons
  sdsFile -. "REST API via .env token" .-> scripts
  theme --> ui
  icons --> ui
  ui --> examples
  data --> examples
  ui --> stories
  codeConnect -. "maps Figma nodes to" .-> ui
  examples --> entryMain
  examples --> entrySample
  claude -- "reads and edits" --> examples
```

### The three kinds of source files

| Kind         | Where                                                                                                                     | Who changes it                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Generated    | `src/ui/icons/`, `src/theme.css`                                                                                          | Only the sync scripts. Never hand-edit.          |
| Upstream SDS | Everything else under `src/ui/`, `src/data/`, `src/figma/`, `src/stories/`, and the marketing sections in `src/examples/` | Left as written. Touch only for necessary fixes. |
| Ours         | `src/examples/SampleUI.tsx`, `src/examples/sample-ui-theme.css`, `src/sample-ui-main.tsx`, `sample-ui.html`               | Follows the global code-style rules.             |

## Build and run

Two HTML entry points share one component library. Vite serves both in
development and builds both into `dist/`.

```mermaid
flowchart LR
  vite["Vite dev server\nlocalhost:8000"]
  storybook["Storybook\nlocalhost:6006"]
  indexHtml["index.html\n(marketing demo)"]
  sampleHtml["sample-ui.html\n(Sample UI demo)"]
  lib["src/ui component library"]
  vite --> indexHtml
  vite --> sampleHtml
  indexHtml --> lib
  sampleHtml --> lib
  storybook --> lib
```

Both `tsconfig.json` and `vite.config.ts` define the same bare import
aliases (`primitives`, `compositions`, `layout`, `icons`, `hooks`, `utils`,
`images`, `data`). Storybook repeats them in `.storybook/main.ts`. Keep all
three in sync.

## How a Figma design becomes code

This is the loop we practice in the project. The Sample UI page and each of
its follow-up fixes went through it.

```mermaid
sequenceDiagram
  actor Doug
  participant Claude as Claude Code
  participant Console as figma-console MCP
  participant Bridge as Desktop Bridge plugin
  participant Figma as Figma file
  participant Repo as Repository
  participant Vite as Vite dev server

  Doug->>Claude: "Implement this frame" (with a Figma link)
  Claude->>Console: get node data for the frame
  Console->>Bridge: request over WebSocket
  Bridge->>Figma: read layers, variables, annotations
  Figma-->>Bridge: node tree + codeDependencies
  Bridge-->>Console: node data
  Console-->>Claude: node data
  Claude->>Repo: read the matching src/ui components for real prop names
  Claude->>Repo: write or edit src/examples/SampleUI.tsx
  Vite-->>Doug: page reloads at localhost:8000/sample-ui.html
  Doug->>Claude: "Also update the Figma file to match"
  Claude->>Console: set instance properties / rename nodes
  Console->>Bridge: write over WebSocket
  Bridge->>Figma: apply the edit
  Figma-->>Doug: design and code now match
```

Rules that keep this loop honest live in `CLAUDE.md` under "Figma MCP /
Code Connect workflow": extract the design first, map to existing
components, read the real `.tsx` files for prop names, respect the
annotation attributes, skip hidden nodes, and use tokens and layout
components rather than custom CSS.

## Development environment

```mermaid
flowchart LR
  subgraph mac["Mac"]
    vscode["VS Code"]
    colima["Colima (Docker runtime)"]
    files["Project folder on disk"]
  end
  subgraph container["Dev container (javascript-node:22-bookworm)"]
    node["Node 22 + npm"]
    git["git + GitHub CLI"]
    claudeCli["Claude Code CLI"]
    workspace["/workspaces/design-system-demo"]
    claudeHome["/home/node/.claude"]
  end
  claudeDir["~/.claude (global CLAUDE.md, login)"]
  vscode -- "Dev Containers extension" --> container
  colima --> container
  files -- "bind mount" --> workspace
  claudeDir -- "bind mount" --> claudeHome
```

Everything that executes runs inside the container. The project folder is
bind-mounted, so edits made from the Mac or from inside the container are the
same files. The Mac's `~/.claude` folder is mounted too, so Claude Code inside
the container reads the global rules and keeps its login across rebuilds.
`.devcontainer/post-create.sh` installs dependencies, installs Claude Code,
and makes bash and zsh load `.env` so the Figma token reaches `.mcp.json`.
