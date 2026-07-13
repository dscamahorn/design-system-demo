# design-system-demo

## Environment

- **Docker runtime**: [Colima](https://github.com/abiosoft/colima), running locally. The `colima` Docker context is active, so both the CLI and the VS Code Dev Containers extension use it automatically.
- **Dev Containers**: open this folder in VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and "Reopen in Container". The current config (`.devcontainer/devcontainer.json`) is a minimal base image with the GitHub CLI feature — no language runtime is pinned yet.
- **GitHub**: repo is connected via `gh`. See remote with `git remote -v`.

## Not yet set up

- Framework/package manager (Storybook needs one chosen first)
- Storybook
- Figma MCP (remote)
