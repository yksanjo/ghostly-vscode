# Ghostly VSCode

> VSCode extension for terminal memory - remember commands and errors in your editor.

Part of the Ghostly Memory Bank ecosystem - editor-native memory.

## Features

- **Cmd+Shift+M** - Show past memories for current project
- **Capture** - Select text and save as a command/fix
- **Search** - Find past fixes for current workspace
- **Shared Storage** - Uses same `~/.ghostly/memory.json` as ghostly-cli

## Commands

- `Ghostly: Capture Terminal Command` - Save selected text
- `Ghostly: Search Memories` - Search past commands
- `Ghostly: Show Past Fixes` - View memory panel

## Keybinding

- `Cmd+Shift+M` (Mac) / `Ctrl+Shift+M` (Windows/Linux) - Show memory

## Installation

1. Open VSCode
2. Search for "Ghostly" in Extensions
3. Or manually: `code --install-extension yksanjo.ghostly-vscode`

## Usage

1. Open a project in VSCode
2. Press `Cmd+Shift+M` to see past fixes
3. Click any fix to copy to clipboard

## Shared Memory

This extension shares memory with ghostly-cli. Install both for:
- CLI: `npm install -g ghostly-cli`
- VSCode: This extension

Memory is stored at `~/.ghostly/memory.json`

## License

MIT
