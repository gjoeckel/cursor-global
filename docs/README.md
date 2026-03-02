# Documentation Suite (cursor-ops)

**Complete documentation for autonomous Cursor IDE setup with MCP integration**

---

## 🎯 For AI Agents - Start Here

**Primary entry point:** [AGENT-QUICKSTART.md](./AGENT-QUICKSTART.md)

After running `/yolo-full`, read AGENT-QUICKSTART.md for current-project context and next steps.

**Task-based navigation:** See [INDEX.md](./INDEX.md) to find docs by task (Asana, Box, MCP, workflows, etc.).

**Cursor official docs:** [Rules](https://cursor.com/docs/context/rules) · [MCP](https://cursor.com/docs/context/mcp) · [Agent security](https://cursor.com/docs/account/agent-security)

---

## Documentation Overview

This documentation suite provides complete information for two primary use cases:

### Repository A: Custom MCP Servers Implementation
**Document**: [MCP-SERVERS-IMPLEMENTATION.md](./MCP-SERVERS-IMPLEMENTATION.md)

Covers:
- All 6 MCP servers (official and custom)
- npx installation mechanism
- Configuration details
- Environment variables
- Troubleshooting

### Repository B: Complete Cursor Autonomous Setup
**Document**: [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md)

Covers:
- Step-by-step setup instructions
- All Cursor settings for autonomy
- Configuration files
- Verification steps
- Troubleshooting

### Main Workflow Documentation
**Document**: [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md)

Covers:
- How `/yolo-full` command works
- Command trigger mechanism
- Complete workflow integration
- All settings and configurations

---

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| **[AGENT-QUICKSTART.md](./AGENT-QUICKSTART.md)** | **Agent entry point after yolo-full** | **AI agents** |
| [INDEX.md](./INDEX.md) | Find docs by task | All users |
| [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md) | Complete workflow documentation | All users |
| [MCP-SERVERS-IMPLEMENTATION.md](./MCP-SERVERS-IMPLEMENTATION.md) | MCP servers guide | MCP developers |
| [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md) | Setup instructions | New users |

---

## Key Features Documented

### 1. Command System
- How `/yolo-full` is triggered from chat
- Command definition structure
- Integration with workflows

### 2. Cursor Settings
- All autonomous settings explained
- YOLO mode configuration
- Permission settings
- MCP integration settings

### 3. MCP Servers
- 6 servers, 39 tools total
- Official servers (filesystem, memory)
- Custom servers (GitHub, shell, Playwright, agent-autonomy)
- npx automatic installation

### 4. Setup Process
- Automated setup script
- Manual setup alternative
- Environment configuration
- Verification steps

---

## Usage

### For MCP Server Developers

See [MCP-SERVERS-IMPLEMENTATION.md](./MCP-SERVERS-IMPLEMENTATION.md) for:
- Server architecture
- npx installation details
- Configuration examples
- Environment variables

### For Cursor Setup

See [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md) for:
- Quick setup guide
- Detailed setup steps
- Configuration files
- Troubleshooting

### For Workflow Understanding

See [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md) for:
- Command trigger mechanism
- Complete workflow
- Integration details
- All components

---

## Documentation Structure

```
docs/
├── README.md                          # This file
├── YOLO-FULL-WORKFLOW.md              # Main workflow documentation
├── MCP-SERVERS-IMPLEMENTATION.md      # MCP servers guide (Repo A)
└── CURSOR-AUTONOMOUS-SETUP.md         # Setup guide (Repo B)
```

---

## Related Files

### Configuration Files
- `config/settings.json` - Cursor IDE settings
- `config/mcp.json` - MCP server configuration
- `config/workflows.json` - Global workflows (includes `yolo-full`)

### Setup Scripts
- `setup.sh` - Main setup orchestrator
- `scripts/configure-cursor-autonomy.sh` - Autonomy configuration
- `scripts/setup-mcp-servers.sh` - MCP server setup

---

**Last Updated**: November 26, 2025
**Maintained By**: Cursor Ops Team

