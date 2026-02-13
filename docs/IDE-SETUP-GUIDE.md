# IDE Setup Guide

**Complete setup instructions for Cursor IDE and Antigravity IDE**

---

## Table of Contents

1. [Cursor IDE Setup](#cursor-ide-setup)
2. [Antigravity IDE Setup](#antigravity-ide-setup)
3. [Common Configuration](#common-configuration)
4. [Troubleshooting](#troubleshooting)

---

## Cursor IDE Setup

### Quick Setup

1. **Install Node.js** (v18 or higher)
   ```bash
   node --version  # Should show v18+ or v20+
   ```

2. **Set Environment Variables**
   ```bash
   export GITHUB_TOKEN="github_pat_..."
   echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Create MCP Configuration**

   Create `~/.cursor/mcp.json` with the optimized configuration:

   See [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md) for complete configuration.

4. **Restart Cursor IDE**
   - Quit Cursor completely (`Cmd+Q` / `Ctrl+Q`)
   - Reopen Cursor IDE
   - MCP servers auto-start on launch

5. **Verify Setup**
   - Check MCP server status in Cursor settings
   - Verify 39 tools are available
   - Test MCP tools in chat

### Detailed Setup

For complete autonomous Cursor setup with YOLO mode, see:

**[Complete Cursor Autonomous Setup Guide](https://github.com/yourusername/cursor-ops/blob/main/docs/CURSOR-AUTONOMOUS-SETUP.md)**

This includes:
- Full autonomous operation configuration
- YOLO mode setup
- All Cursor settings
- Workflow integration
- Session management

---

## Antigravity IDE Setup

### Configuration Location

Antigravity IDE uses the same MCP configuration format as Cursor IDE.

### Setup Steps

1. **Install Node.js** (v18 or higher)

2. **Set Environment Variables**
   ```bash
   export GITHUB_TOKEN="github_pat_..."
   ```

3. **Create MCP Configuration**

   Create `~/.antigravity/mcp.json` (or check Antigravity documentation for config location):

   Use the same configuration from [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md)

4. **Restart Antigravity IDE**

5. **Verify Setup**
   - Check MCP server status
   - Verify tools are available

### Notes

- Antigravity IDE may use a different config location - check their documentation
- Configuration format is identical to Cursor IDE
- All servers use the same npx installation method

---

## Common Configuration

### All IDEs

All IDEs use the same MCP server configuration format. The key differences are:

1. **Config File Location**
   - Cursor: `~/.cursor/mcp.json`
   - Antigravity: Check Antigravity documentation

2. **Path Resolution**
   - Replace `${HOME}` with actual home directory path
   - Use absolute paths for better compatibility

3. **Environment Variables**
   - Must be set in shell that launches the IDE
   - Add to `~/.zshrc` or `~/.bashrc` for persistence

### Recommended Configuration

See [OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md) for the complete 39-tool configuration.

---

## Troubleshooting

### Servers Not Starting

**Problem**: MCP servers fail to start

**Solutions**:
1. Check Node.js is installed: `node --version`
2. Check npm is installed: `npm --version`
3. Verify npx works: `npx --version`
4. Check config file syntax is valid JSON
5. Review IDE logs for errors
6. Verify environment variables are set

### GitHub Server Not Working

**Problem**: GitHub operations fail

**Solutions**:
1. Verify `GITHUB_TOKEN` is set: `echo $GITHUB_TOKEN`
2. Check token has required permissions (repo, read, write)
3. Restart IDE after setting token
4. Test token: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user`

### Tools Not Available

**Problem**: MCP tools not showing in IDE

**Solutions**:
1. Verify servers are connected (check IDE settings)
2. Restart IDE completely
3. Check config file location is correct
4. Verify JSON syntax is valid
5. Check IDE version supports MCP

### Path Issues

**Problem**: Paths not resolving correctly

**Solutions**:
1. Use absolute paths instead of `${HOME}`
2. Replace `${HOME}` with actual path: `/Users/username` or `/home/username`
3. Check path separators (use `:` for ALLOWED_PATHS on macOS/Linux)

---

## Additional Resources

### Documentation

- **[MCP-SERVERS-IMPLEMENTATION.md](./docs/MCP-SERVERS-IMPLEMENTATION.md)** - Complete implementation guide
- **[OPTIMIZED-CONFIG.md](./OPTIMIZED-CONFIG.md)** - Recommended 39-tool configuration

### Official MCP Documentation

- **MCP Protocol**: https://modelcontextprotocol.io
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk

### Package Information

- **npm Packages**: https://www.npmjs.com/~gjoeckel
- **Repository**: https://github.com/gjoeckel/my-mcp-servers

---

**Last Updated**: November 26, 2025

