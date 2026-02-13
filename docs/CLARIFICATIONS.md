# Documentation Clarifications

**Important points about the documentation structure and security**

---

## 1. npx Installation and Location Independence

### ✅ Confirmed: Location Independent

**Yes, the documentation recommends installing MCP servers from npx on startup, making the setup location independent.**

### How It Works

1. **npx Auto-Installation**
   - All MCP servers use `npx -y <package-name>`
   - npx automatically downloads packages from npm registry
   - No local installation required
   - Works from any directory

2. **Configuration Files**
   - `mcp.json` uses relative paths or environment variables
   - `${HOME}` is expanded to actual home directory
   - No hardcoded absolute paths in server configuration

3. **Benefits**
   - ✅ Works on any machine
   - ✅ No manual package installation
   - ✅ Always uses latest versions (or cached versions)
   - ✅ Portable across different systems
   - ✅ No dependency on repository location

### Example

```json
{
  "mcpServers": {
    "github-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-github-minimal"]
    }
  }
}
```

This works regardless of where the `mcp.json` file is located, as long as:
- Node.js and npm are installed
- Internet access is available (for first-time download)
- npx can access npm registry

---

## 2. Credentials and Identifying Information

### ✅ Confirmed: No Credentials, Methods Documented

**The repository contains NO actual credentials, tokens, or identifying information. Only the METHODS for setting up credentials are documented.**

### What's NOT Included

❌ **No actual credentials**:
- No GitHub tokens
- No SSH keys
- No API keys
- No passwords
- No system-specific paths (in repo files)
- No user-specific information

### What IS Included

✅ **Methods and instructions**:
- How to create GitHub Personal Access Token
- Where to get tokens (GitHub settings URL)
- How to set environment variables
- How to add credentials to shell config
- How to make credentials available for each new chat/session

### Credential Setup Methods

#### For GitHub Token

**Documented Method**:
```bash
# Step 1: Get token from GitHub
# URL: https://github.com/settings/tokens

# Step 2: Set environment variable
export GITHUB_TOKEN="github_pat_..."

# Step 3: Add to shell config for persistence
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

**What users need to do**:
1. Go to GitHub settings
2. Create their own token
3. Set it in their environment
4. Add to shell config

#### For Each New Chat/Session

**Documented Methods**:

1. **Shell Config (Persistent)**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export GITHUB_TOKEN="your_token_here"
   ```
   - Available in all new terminal sessions
   - Available to IDE when launched from terminal

2. **IDE Environment Variables**
   - Some IDEs can read from shell config
   - Some IDEs require setting in IDE settings
   - Documentation explains IDE-specific methods

3. **Session-Specific**
   ```bash
   # Set in current session only
   export GITHUB_TOKEN="your_token_here"
   ```

### Security Best Practices

The documentation follows these practices:

1. **Placeholders Only**
   - Examples use `github_pat_...` (placeholder)
   - Examples use `your_token_here` (placeholder)
   - No actual tokens shown

2. **Instructions, Not Values**
   - Explains WHERE to get tokens
   - Explains HOW to set them
   - Does NOT include actual values

3. **User Responsibility**
   - Users create their own tokens
   - Users set their own credentials
   - Users manage their own security

---

## Verification Checklist

Before publishing repository, verify:

- [ ] No actual GitHub tokens in any files
- [ ] No SSH keys or credentials
- [ ] No system-specific paths (like `/Users/username/`)
- [ ] All paths use placeholders (`${HOME}`, `/path/to/`, etc.)
- [ ] All tokens use placeholders (`github_pat_...`, `your_token_here`)
- [ ] Methods for credential setup are clearly documented
- [ ] Instructions for making credentials available are included

---

## Summary

### ✅ npx Installation = Location Independent

- All servers use `npx -y` for automatic installation
- No dependency on repository or file location
- Works on any machine with Node.js
- Packages downloaded from npm on first use

### ✅ No Credentials, Methods Only

- No actual tokens, keys, or credentials in repository
- Only methods and instructions for setting up credentials
- Users create and manage their own credentials
- Documentation explains how to make credentials available for each session

---

**Last Updated**: November 26, 2025

