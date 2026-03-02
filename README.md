# Cursor Global Configuration

**For AI agents: see [AGENTS.md](AGENTS.md)**

**✨ FULLY PORTABLE ✨ - Place it ANYWHERE on your machine!**

**Portable Cursor IDE configuration for AI-assisted development**

This directory contains all global Cursor IDE configurations, workflows, and automation scripts that can be easily replicated across multiple machines.

## 🎯 Key Feature: True Portability

**Place this folder wherever you want!**
- `~/cursor-global/` ✅ Home directory
- `~/Desktop/cursor-global/` ✅ Desktop
- `~/Documents/tools/cursor-global/` ✅ Documents
- `/Volumes/USB/cursor-global/` ✅ USB drive
- `~/Dropbox/cursor-global/` ✅ Cloud sync folder

**Just run `./setup.sh` from wherever you place it, and everything adapts automatically!**

All scripts use self-location detection - no hardcoded paths needed!

---

## 📁 Directory Structure

```
~/cursor-global/
├── config/                 # Cursor IDE configuration files
│   ├── workflows.json     # Global workflows (ai-*, mcp-*)
│   ├── mcp.json          # MCP server configuration
│   ├── settings.json     # Cursor IDE settings
│   └── global-scripts.json # Script registry
├── scripts/               # Automation scripts
│   ├── session-*.sh      # AI session management
│   ├── git-*.sh          # Git automation
│   ├── *-mcp-*.sh        # MCP server management
│   └── *.sh              # Other utilities
├── changelogs/            # AI session summaries and context
│   ├── config.json       # Changelog configuration
│   ├── context-summary.md # Development context
│   └── session-*.md      # Individual session summaries
├── docs/                  # Documentation
└── README.md              # This file
```

---

## 🚀 Quick Setup (New Machine)

### Super Simple - Works Anywhere!

```bash
# 1. Place cursor-global ANYWHERE you want
#    Examples:
#    - ~/cursor-global/
#    - ~/Desktop/cursor-global/
#    - ~/Documents/tools/cursor-global/
#    - /Volumes/USB/cursor-global/

# 2. Navigate to wherever you placed it
cd /path/to/cursor-global

# 3. Run setup (auto-detects location!)
./setup.sh

# 4. Reload shell
source ~/.zshrc  # or ~/.bashrc

# 5. Restart Cursor IDE

# Done! ✅
```

**That's it!** Setup auto-detects where you placed the folder and configures everything accordingly.

### Advanced: Automated Download

```bash
# Download from Git and setup in one go
git clone https://github.com/YOUR_USERNAME/cursor-global.git ~/Desktop/cursor-global
cd ~/Desktop/cursor-global
./setup.sh
```

---

## 🔬 How Portability Works

### Self-Locating Scripts

Every script automatically detects its own location:

```bash
# At the top of each script:
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_GLOBAL_DIR="$(dirname "$SCRIPT_DIR")"

# Then uses calculated paths:
CONFIG_DIR="$CURSOR_GLOBAL_DIR/config"
CHANGELOGS_DIR="$CURSOR_GLOBAL_DIR/changelogs"
SCRIPTS_DIR="$CURSOR_GLOBAL_DIR/scripts"
```

**Result:** Scripts work no matter where you place the folder!

### Smart Setup

When you run `./setup.sh`:

1. **Detects location:** Figures out where cursor-global is
2. **Updates workflows.json:** Writes absolute paths to your location
3. **Updates PATH:** Adds your actual scripts directory to shell PATH
4. **Creates symlinks:** Points ~/.cursor/ to your config/

**Move the folder?** Just run `./setup.sh` again from the new location!

---

## 🔧 Configuration Files

### `config/workflows.json`
Global Cursor workflows available in ALL projects:

### `config/recommended-extensions.txt`
List of recommended Cursor IDE extensions. See **[docs/RECOMMENDED-EXTENSIONS.md](docs/RECOMMENDED-EXTENSIONS.md)** for details.

**AI Session Management:**
- `ai-start` - Load session context
- `ai-end` - Save session & changelog
- `ai-update` - Record progress
- `ai-repeat` - Reload context
- `ai-compress` - Compress context
- `ai-clean` - Clean temp files

**Git Operations:**
- `ai-local-commit` - Commit with changelog update
- `ai-local-merge` - Smart merge (prevents changelog conflicts!)
- `ai-merge-finalize` - Complete merge after conflict resolution
- `ai-docs-sync` - Generate workflows.md

**MCP Management:**
- `mcp-health` - Check MCP server health
- `mcp-restart` - Restart all MCP servers

**Total:** 12 global workflows

### `config/mcp.json`
MCP (Model Context Protocol) server configuration for:
- Filesystem operations
- Shell command execution
- GitHub integration
- Agent autonomy
- Asana task management (minimal - 6 tools)
- Box file storage (minimal - 6 tools)

### `config/settings.json`
Cursor IDE settings optimized for AI-assisted development

---

## 📜 Scripts

### Session Management
- **`session-start.sh`** - Initialize AI session with full context
- **`session-end.sh`** - Save session summary and changelog
- **`session-update.sh`** - Record mid-session progress
- **`compress-context.sh`** - Compress session context into summary

### Git Automation
- **`git-local-commit.sh`** - Auto-commit with changelog update
- **`git-local-merge.sh`** - Smart merge with changelog conflict prevention
  - Extracts new changelog entries from feature branch
  - Pre-merges into main before Git merge
  - Eliminates changelog conflicts (~100% → ~0%)
  - Auto-updates merge status

### MCP Server Management
- **`start-mcp-servers.sh`** - Start all configured MCP servers
- **`restart-mcp-servers.sh`** - Restart MCP servers
- **`check-mcp-health.sh`** - Verify MCP server status
- **`check-mcp-tool-count.sh`** - Monitor tool count (40-tool limit)

### Utilities
- **`generate-workflows-doc.sh`** - Auto-generate workflows.md
- **`configure-cursor-autonomy.sh`** - Setup autonomous AI permissions
- **`setup-cursor-environment.sh`** - Full environment setup

---

## 💡 Usage Examples

### Start AI Session
```bash
# In Cursor chat, type:
ai-start

# Or run directly:
session-start.sh
```

### Commit Changes
```bash
# Auto-updates changelog and commits
ai-local-commit
```

### Merge Feature Branch
```bash
# Smart merge with changelog conflict prevention
git checkout feature-branch
ai-local-merge

# If conflicts occur:
# ... resolve conflicts ...
git commit
ai-merge-finalize
```

### Check MCP Status
```bash
# Quick health check
mcp-health

# Restart if needed
mcp-restart
```

---

## 🔄 Syncing with Other Machines

### Export Current Configuration
```bash
cd ~
tar -czf cursor-global-backup.tar.gz cursor-global/
# Copy cursor-global-backup.tar.gz to new machine
```

### Import on New Machine
```bash
tar -xzf cursor-global-backup.tar.gz -C ~/
cd ~/cursor-global
./setup.sh  # If you have the setup script
```

### Using Git (Recommended)
```bash
# On current machine (first time)
cd ~/cursor-global
git init
git add .
git commit -m "Initial cursor-global configuration"
git remote add origin https://github.com/YOUR_USERNAME/cursor-global.git
git push -u origin main

# On new machine
cd ~
git clone https://github.com/YOUR_USERNAME/cursor-global.git
cd cursor-global
# Follow "Quick Setup" steps above
```

---

## 🎯 Key Features

### Smart Changelog Merge
The `git-local-merge.sh` script uses an intelligent algorithm to prevent changelog conflicts:

1. **Identifies** main's last changelog entry before merge
2. **Extracts** only NEW entries from feature branch
3. **Pre-merges** new entries into main's changelog
4. **Stages** changelog before Git merge (conflict-free!)
5. **Result**: Changelog conflicts reduced from 100% → ~0%

### Automatic Context Management
Session scripts maintain development context across sessions:
- Project-specific context tracking
- Session summaries with key decisions
- Automatic changelog generation
- Progress tracking

### MCP Integration
Full MCP server lifecycle management:
- Auto-start on session initialization
- Health monitoring
- Tool count optimization (40-tool limit)
- Graceful restarts

---

## 📊 Project-Specific Integration

### In Your Project

Add project-specific workflows in `.cursor/workflows.json`:

```json
{
  "proj-custom": {
    "description": "Project-specific workflow",
    "commands": ["./scripts/custom-script.sh"],
    "auto_approve": true,
    "timeout": 30000
  }
}
```

These will combine with global workflows automatically!

### Auto-Documentation

Run `ai-docs-sync` in any project to generate `workflows.md` that combines:
- Global workflows (from `~/cursor-global/config/workflows.json`)
- Project workflows (from `.cursor/workflows.json`)

---

## 🔧 Customization

### Adding New Workflows

1. Edit `~/cursor-global/config/workflows.json`
2. Add your workflow entry
3. Create corresponding script in `~/cursor-global/scripts/` if needed
4. Run `ai-docs-sync` to update documentation

### Modifying Scripts

All scripts are in `~/cursor-global/scripts/` - edit directly!

Key paths used in scripts:
- `~/cursor-global/config/` - Config files
- `~/cursor-global/scripts/` - Script directory
- `~/cursor-global/changelogs/` - Session data
- `.cursor/` - Project-specific configs (in each project)

---

## 🐛 Troubleshooting

### Scripts Not Found
```bash
# Verify PATH
echo $PATH | grep cursor-global

# If not found, add to shell config
echo 'export PATH="$HOME/cursor-global/scripts:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Workflows Not Showing in Cursor
```bash
# Verify symlink
ls -la ~/.cursor/workflows.json

# If missing, create it
ln -s ~/cursor-global/config/workflows.json ~/.cursor/workflows.json

# Restart Cursor IDE
```

### MCP Servers Not Starting
```bash
# Check MCP configuration
cat ~/.cursor/mcp.json  # or ~/cursor-global/config/mcp.json

# Verify Node.js is installed
node --version

# Check MCP server logs
ls ~/.cursor/*.pid  # Should show running servers
```

---

## 📝 Version History

- **2025-10-15** - Initial portable configuration
  - Smart changelog merge implementation
  - 12 global workflows
  - Complete MCP integration
  - Session management automation

---

## 🤝 Contributing

If you improve these workflows or scripts:

1. Test thoroughly in your environment
2. Document changes in this README
3. Update relevant scripts/configs
4. Consider sharing improvements!

---

## 📄 License

These configurations and scripts are provided as-is for personal use. Modify freely to suit your workflow!

---

**Last Updated:** October 15, 2025
**Maintained By:** Your development team
**Repository:** https://github.com/YOUR_USERNAME/cursor-global (optional)
