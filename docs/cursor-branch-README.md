# Cursor IDE Setup Guide

**Complete setup guide for Cursor IDE with MCP servers and autonomous operation**

---

## Overview

This branch contains **Cursor IDE-specific documentation** for setting up MCP servers and enabling full autonomous operation.

For general MCP server information, see the [main branch](https://github.com/gjoeckel/my-mcp-servers).

---

## Quick Start

1. **Review Main Branch**
   - Read [main branch README](https://github.com/gjoeckel/my-mcp-servers)
   - Review [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md)
   - Check [MCP-SERVERS-IMPLEMENTATION.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/docs/MCP-SERVERS-IMPLEMENTATION.md)

2. **Follow Cursor Setup**
   - See [CURSOR-SETUP-GUIDE.md](./CURSOR-SETUP-GUIDE.md) for detailed setup
   - See [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md) for autonomous mode
   - See [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md) for YOLO mode

---

## Documentation

### Setup Guides

* **[CURSOR-SETUP-GUIDE.md](./CURSOR-SETUP-GUIDE.md)** - Complete Cursor IDE setup instructions
* **[CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md)** - Full autonomous operation setup (YOLO mode)

### Workflows

* **[YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md)** - Complete yolo-full workflow documentation
  - How `/yolo-full` command works
  - Command trigger mechanism
  - All Cursor settings for autonomy
  - Complete workflow integration

### Configuration

* **[config/mcp.json](./config/mcp.json)** - Cursor MCP server configuration
* **[config/settings.json](./config/settings.json)** - Cursor IDE settings for autonomous mode
* **[config/workflows.json](./config/workflows.json)** - Cursor workflows including yolo-full

---

## Key Features

### Autonomous Operation

- **YOLO Mode**: Zero confirmations, auto-execution
- **Full System Access**: Terminal, filesystem, shell
- **MCP Integration**: 6 servers, 39 tools
- **Auto-Execution**: Commands run automatically

### MCP Servers

- **filesystem** (15 tools) - Official
- **memory** (8 tools) - Official
- **github-minimal** (4 tools) - Custom
- **shell-minimal** (4 tools) - Custom
- **playwright-minimal** (4 tools) - Custom
- **agent-autonomy** (4 tools) - Custom

**Total: 39 tools** (under 40-tool limit)

---

## Setup Steps

1. **Prerequisites**
   - Node.js (v18+)
   - npm
   - Cursor IDE (latest version)
   - GitHub Personal Access Token

2. **Configure MCP Servers**
   - Copy configuration from [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md)
   - Create `~/.cursor/mcp.json`
   - Set environment variables

3. **Enable Autonomous Mode**
   - Follow [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md)
   - Apply Cursor settings
   - Configure permissions

4. **Verify Setup**
   - Restart Cursor IDE
   - Test `/yolo-full` command
   - Verify MCP servers

---

## Related Documentation

### Main Branch

- [Main README](https://github.com/gjoeckel/my-mcp-servers)
- [OPTIMIZED-CONFIG.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/OPTIMIZED-CONFIG.md)
- [MCP-SERVERS-IMPLEMENTATION.md](https://github.com/gjoeckel/my-mcp-servers/blob/main/docs/MCP-SERVERS-IMPLEMENTATION.md)

### Other IDE Branches

- [Antigravity Branch](https://github.com/gjoeckel/my-mcp-servers/tree/antigravity)

---

**Last Updated**: November 26, 2025

