# Documentation Index - Find Docs by Task

**Quick navigation to find the right documentation for your task.**

## 📖 Cursor official docs

| Topic | Link |
|-------|------|
| **Rules** | [cursor.com/docs/context/rules](https://cursor.com/docs/context/rules) |
| **MCP** | [cursor.com/docs/context/mcp](https://cursor.com/docs/context/mcp) |
| **Agent security** | [cursor.com/docs/account/agent-security](https://cursor.com/docs/account/agent-security) |

## 🎯 Agent Workflow

| Task | Document | When to Use |
|------|----------|-------------|
| **Agent startup** | [AGENT-QUICKSTART.md](./AGENT-QUICKSTART.md) | After running `/yolo-full` |
| **Project startup** | `<resources>/AGENT-STARTUP.md` | Per-project overview and context |
| **Agent action policy** | `.cursor/rules/agent-action-policy.mdc` | When to run scripts without asking vs ask first |
| **Agent resource folders** | [AGENT-RESOURCE-FOLDERS.md](./AGENT-RESOURCE-FOLDERS.md) | Understanding project resources structure |

## 🔄 Workflows and Commands

| Task | Document | When to Use |
|------|----------|-------------|
| **yolo-full workflow** | [YOLO-FULL-WORKFLOW.md](./YOLO-FULL-WORKFLOW.md) | Understanding `/yolo-full` command |
| **Workflow creation** | [CURSOR-WORKFLOW-CREATION-GUIDE.md](./CURSOR-WORKFLOW-CREATION-GUIDE.md) | Creating new workflows |
| **RRW protocol** | [RRW-PROTOCOL-WORKFLOW.md](./RRW-PROTOCOL-WORKFLOW.md) | Read-Request-Wait protocol usage |
| **Workflow list** | `config/workflows.json` | Available workflow commands |
| **Command definitions** | `.cursor/commands/` | Cursor command definitions |
| **Production main & services plan** | [PRODUCTION-MAIN-AND-SERVICES-PLAN.md](./PRODUCTION-MAIN-AND-SERVICES-PLAN.md) | Syncing production → main on GitHub; services branch in onlinecourses-production |
| **Production files not used by services** | [PRODUCTION-FILES-NOT-USED-BY-SERVICES.md](./PRODUCTION-FILES-NOT-USED-BY-SERVICES.md) | Production paths not utilized by services or admin UI; can be ignored (preserved only) |
| **Services-branch doc index (otter)** | `Agents/resources/otter/SERVICES-BRANCH-DOCS-INDEX.md` | Find otter docs for creating/aligning services branch in onlinecourses-production |
| **Archived: old production sync** | [docs/archive/old-production-sync-methodology/README.md](./archive/old-production-sync-methodology/README.md) | Previous server→local baseline methodology |

## 🔌 MCP Servers

| Task | Document | When to Use |
|------|----------|-------------|
| **MCP setup** | [MCP-SERVERS-IMPLEMENTATION.md](./MCP-SERVERS-IMPLEMENTATION.md) | Setting up MCP servers |
| **MCP troubleshooting** | [ASANA-LOADING-TOOLS-TROUBLESHOOTING.md](./ASANA-LOADING-TOOLS-TROUBLESHOOTING.md) | MCP tool loading issues |
| **MCP config** | `config/mcp.json` | MCP server configuration |

## 📋 Asana Integration

| Task | Document | When to Use |
|------|----------|-------------|
| **Asana setup** | [ASANA-MCP-SETUP.md](./ASANA-MCP-SETUP.md) | Setting up Asana MCP |
| **Asana connection** | [ASANA-CONNECTION-GUIDE.md](./ASANA-CONNECTION-GUIDE.md) | Connecting to Asana |
| **Asana subtasks** | [ASANA-SUBTASK-BEST-PRACTICES.md](./ASANA-SUBTASK-BEST-PRACTICES.md) | Creating subtasks correctly |
| **Asana subtask pattern** | [ASANA-SUBTASK-PATTERN-SUMMARY.md](./ASANA-SUBTASK-PATTERN-SUMMARY.md) | Subtask creation patterns |
| **Asana tools** | [ASANA-TOOLS-DISCOVERY.md](./ASANA-TOOLS-DISCOVERY.md) | Available Asana tools |
| **Asana minimal** | [ASANA-MINIMAL-SUMMARY.md](./ASANA-MINIMAL-SUMMARY.md) | Asana minimal implementation |

## 📦 Box Integration

| Task | Document | When to Use |
|------|----------|-------------|
| **Box token** | `config/README.md` (Box section) | Getting/refreshing Box OAuth token |
| **Box authentication** | [box/BOX-MINIMAL-AUTHENTICATION.md](./box/BOX-MINIMAL-AUTHENTICATION.md) | Box authentication details |
| **Box MCP setup** | [BOX-MCP-SUCCESS-SUMMARY.md](./BOX-MCP-SUCCESS-SUMMARY.md) | Box MCP implementation |
| **Box troubleshooting** | [BOX-MCP-CURSOR-CONNECTION-ISSUE.md](./BOX-MCP-CURSOR-CONNECTION-ISSUE.md) | Box connection issues |
| **Box API** | [box/BOX-API-URL-RETRIEVAL.md](./box/BOX-API-URL-RETRIEVAL.md) | Box API usage |

## 📊 Google Apps Script & Sheets

| Task | Document | When to Use |
|------|----------|-------------|
| **Google Apps Script reference** | [GOOGLE-APPS-SCRIPTS.md](./GOOGLE-APPS-SCRIPTS.md) | Working on Apps Script projects (e.g. canvas_reports); Sheets/Range API, date-as-text, getRange, deployment |

## ⚙️ Setup and Configuration

| Task | Document | When to Use |
|------|----------|-------------|
| **DB PDO migration (otter)** | [DB-PDO-MIGRATION-OTTER.md](./DB-PDO-MIGRATION-OTTER.md) | Multi-phase migration of otter to production-style PDO API; mapping script and phases |
| **Cursor setup** | [CURSOR-AUTONOMOUS-SETUP.md](./CURSOR-AUTONOMOUS-SETUP.md) | Complete Cursor setup |
| **IDE setup** | [IDE-SETUP-GUIDE.md](./IDE-SETUP-GUIDE.md) | IDE configuration |
| **Recommended extensions** | [RECOMMENDED-EXTENSIONS.md](./RECOMMENDED-EXTENSIONS.md) | Cursor/VS Code extension recommendations |
| **Optimized config** | [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md) | Configuration optimization |
| **Project paths** | `config/project-paths.json` | Development and resources folder mappings |

## 🔍 Troubleshooting and Diagnostics

| Task | Document | When to Use |
|------|----------|-------------|
| **E2E review** | [E2E-YOLO-FULL-REVIEW.md](./E2E-YOLO-FULL-REVIEW.md) | End-to-end workflow review |
| **E2E report** | [E2E-REVIEW-REPORT.md](./E2E-REVIEW-REPORT.md) | Review report |
| **Fixes required** | [FIXES-REQUIRED.md](./FIXES-REQUIRED.md) | Known issues and fixes |
| **Clarifications** | [CLARIFICATIONS.md](./CLARIFICATIONS.md) | Common clarifications |

## 📚 Historical and Reference

| Task | Document | When to Use |
|------|----------|-------------|
| **Status reports** | [docs/status/](./status/) | Historical status and cleanup reports |
| **Cursor reference** | [status/cursor_composer_1_5.md](./status/cursor_composer_1_5.md), [status/cursor_pro_guide.md](./status/cursor_pro_guide.md) | Composer/Pro reference articles |
| **Branch docs** | Various branch-specific READMEs | Branch migration and structure |
| **Repo migration** | [REPO-MIGRATION-GUIDE.md](./REPO-MIGRATION-GUIDE.md) | Repository migration guide |

## 🎓 Recommendations and Best Practices

| Task | Document | When to Use |
|------|----------|-------------|
| **Agent startup recommendations** | [AGENT-STARTUP-RECOMMENDATIONS.md](./AGENT-STARTUP-RECOMMENDATIONS.md) | Agent startup best practices |
| **Agent action policy recommendations** | [AGENT-ACTION-POLICY-RECOMMENDATIONS.md](./AGENT-ACTION-POLICY-RECOMMENDATIONS.md) | Action policy guidance |
| **Agent comms integration** | [AGENT-COMMS-INTEGRATION.md](./AGENT-COMMS-INTEGRATION.md) | Agent communication integration |

---

**Quick Start:** If you're an AI agent, start with [AGENT-QUICKSTART.md](./AGENT-QUICKSTART.md) after running `/yolo-full`.
