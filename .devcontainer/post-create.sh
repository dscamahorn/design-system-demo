#!/bin/bash
# One-time setup that runs after the dev container is created.
# It does three things:
#   1. installs the project's npm dependencies
#   2. installs the Claude Code CLI for the container user
#   3. makes the shell load the project's .env file (Figma token) on startup
set -e

PROJECT_DIR="$PWD"

# The image provides both bash and zsh. Write shell setup to both so it
# works no matter which one VS Code opens in the terminal.
SHELL_RC_FILES="$HOME/.bashrc $HOME/.zshrc"

echo "==> Installing npm dependencies"
npm install

echo "==> Installing Claude Code CLI"
# The official installer puts the binary in ~/.local/bin, so it does not
# need root access or a global npm install.
curl -fsSL https://claude.ai/install.sh | bash

echo "==> Wiring PATH and .env auto-load into shell startup files"
LOCAL_BIN_LINE='export PATH="$HOME/.local/bin:$PATH"'
ENV_MARKER="# design-system-demo: auto-load project .env"

for shell_rc_file in $SHELL_RC_FILES; do
  touch "$shell_rc_file"

  # Make sure ~/.local/bin is on PATH for every new shell.
  if ! grep -qF "$LOCAL_BIN_LINE" "$shell_rc_file"; then
    echo "$LOCAL_BIN_LINE" >> "$shell_rc_file"
  fi

  # .mcp.json refers to ${FIGMA_ACCESS_TOKEN}, which Claude Code expands from
  # the shell environment. Loading .env here means the token is available
  # whenever the claude CLI is launched from a terminal in this container.
  if ! grep -qF "$ENV_MARKER" "$shell_rc_file"; then
    cat >> "$shell_rc_file" <<EOF

$ENV_MARKER
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  . "$PROJECT_DIR/.env"
  set +a
fi
EOF
  fi
done

echo "==> Done"
