# My Custom MCP Servers

**Repository**: https://github.com/gjoeckel/my-mcp-servers
**Purpose**: Custom MCP servers with minimal tool sets for 40-tool limit compliance
**Target**: Exactly 39 tools across 6 servers for optimal AI autonomous operation

---

## 🎯 Quick Start

### **Recommended Configuration (39 Tools)**

See [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md) for the complete IDE-agnostic configuration.

### **IDE-Specific Setup Guides**

This repository uses **branch-based organization** for IDE-specific documentation:

| IDE | Branch | Setup Guide |
|-----|--------|-------------|
| **Cursor IDE** | [`cursor`](https://github.com/gjoeckel/my-mcp-servers/tree/cursor) | Complete Cursor setup with autonomous mode |
| **Antigravity IDE** | [`antigravity`](https://github.com/gjoeckel/my-mcp-servers/tree/antigravity) | Antigravity-specific setup |

**See [IDE Branches Guide](./docs/IDE-BRANCHES.md) for details.**

---

## 📦 Available Packages

All packages are published to npm and can be installed via `npx`:

| Package                         | npm | Tools | Description                    |
| ------------------------------- | --- | ----- | ------------------------------ |
| mcp-agent-autonomy              | ✅   | 4     | Workflow automation            |
| mcp-github-minimal              | ✅   | 4     | Essential GitHub operations    |
| mcp-shell-minimal               | ✅   | 4     | Shell command execution        |
| mcp-playwright-minimal          | ✅   | 4     | Browser automation             |
| mcp-sequential-thinking-minimal | ✅   | ~5    | Problem-solving workflows      |
| mcp-everything-minimal          | ✅   | ~25   | Protocol validation (optional) |

### **Official Servers** (used alongside custom servers):

* `@modelcontextprotocol/server-filesystem` - 15 tools
* `@modelcontextprotocol/server-memory` - 8 tools

---

## 🚀 Installation

### **Via npm (Recommended)**

No installation needed - packages auto-install via `npx`:

```json
{
  "mcpServers": {
    "agent-autonomy": {
      "command": "npx",
      "args": ["-y", "mcp-agent-autonomy"]
    }
  }
}
```

### **Local Development**

```bash
git clone https://github.com/gjoeckel/my-mcp-servers.git
cd my-mcp-servers/my-mcp-servers
npm run install-all
npm run build-all
```

---

## 📚 Documentation

### **Main Branch (This Branch)**

* **[OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md)** - Recommended 39-tool configuration (IDE-agnostic)
* **[docs/MCP-SERVERS-IMPLEMENTATION.md](./docs/MCP-SERVERS-IMPLEMENTATION.md)** - Complete implementation guide (IDE-agnostic)
* **[docs/IDE-BRANCHES.md](./docs/IDE-BRANCHES.md)** - Guide to IDE-specific branches

### **IDE-Specific Branches**

* **[cursor branch](https://github.com/gjoeckel/my-mcp-servers/tree/cursor)** - Complete Cursor IDE setup
* **[antigravity branch](https://github.com/gjoeckel/my-mcp-servers/tree/antigravity)** - Antigravity IDE setup

---

## 🎯 Recommended Configuration

**39-Tool Setup** (Under 40-tool limit):

* `filesystem` (15 tools) - Official
* `memory` (8 tools) - Official
* `agent-autonomy` (4 tools) - Custom
* `github-minimal` (4 tools) - Custom
* `shell-minimal` (4 tools) - Custom
* `playwright-minimal` (4 tools) - Custom

**Total: 39 tools** ✅

See [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md) for complete configuration details.

---

## 📝 License

ISC License - See individual package licenses for details.

---

## 🔗 Links

* **Repository**: https://github.com/gjoeckel/my-mcp-servers
* **npm Packages**: https://www.npmjs.com/~gjoeckel
* **MCP Documentation**: https://modelcontextprotocol.io

---

_Optimized MCP servers for AI autonomous operation within the 40-tool limit._

