# Box MCP Server Connection Issue - Research Prompt

## System Information

- **Operating System**: macOS 26.1 (Build 25B78)
- **Kernel**: Darwin 25.1.0
- **IDE**: Cursor IDE (latest version)
- **Shell**: zsh
- **Node.js Version**: v24.9.0 (inferred from error messages)

## Current Setup

### MCP Server Configuration
We are using a **local stdio-based MCP server** (`mcp-box-minimal`) configured in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "box-minimal": {
      "command": "npx",
      "args": ["-y", "mcp-box-minimal"],
      "env": {
        "BOX_CLIENT_ID": "3xsda5fikhvgjua3s4gj7m6syr62hkty",
        "BOX_CLIENT_SECRET": "rLRTGenQG8qs60BZqC02rtD7DwwCLnzq",
        "BOX_DEV_TOKEN": "${BOX_DEV_TOKEN}",
        "BOX_ACCESS_TOKEN": "6hpJLIspGbp8cue0ZxVYTIcwQSjH099b"
      }
    }
  }
}
```

### Server Implementation Details
- **Package**: `mcp-box-minimal` (version 1.0.5)
- **Transport**: `StdioServerTransport()` - communicates via standard input/output
- **Authentication**: Uses Box OAuth access tokens via environment variables
- **Client Initialization**: Lazy initialization (only creates Box client when tools are called)

### Server Code Architecture
```typescript
// From mcp-box-minimal/src/index.ts
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Box Minimal MCP server running on stdio');
}
```

## Why Box Remote MCP Proxy Doesn't Apply

The **Box Remote MCP Proxy** (https://github.com/box-community/box-remote-mcp-proxy) is designed for **remote HTTP/WebSocket-based MCP servers**, not local stdio-based servers.

**Key Differences**:
1. **Our Setup**: Local stdio server using `StdioServerTransport()` - direct parent-child process communication
2. **Proxy Target**: Remote servers using HTTP/WebSocket protocols - network-based communication

The proxy solution specifically addresses OAuth token refresh for remote MCP servers that communicate over HTTP. Our server uses stdio pipes for communication between Cursor and the MCP server process, which is a fundamentally different architecture.

## Current Issue

### Symptoms
1. ✅ **Process Running**: `box-minimal` MCP server process is running (confirmed via `ps aux`)
2. ✅ **Configuration Valid**: MCP config file exists and contains valid JSON with correct token
3. ✅ **Token Refreshed**: OAuth token was successfully refreshed and updated in config
4. ❌ **Not Connected**: Server does not appear in `claude mcp list` output
5. ❌ **Tools Unavailable**: Box-minimal MCP tools are not available in the AI agent's tool list

### Observed Behavior
- Other MCP servers connect successfully: `filesystem`, `memory`, `github-minimal`, `playwright-minimal`, `agent-autonomy`, `sequential-thinking-minimal`
- Box-minimal process runs but fails to establish connection with Cursor
- No error messages visible in standard output/error streams
- Server uses lazy initialization (only initializes Box client when tools are called), so authentication errors wouldn't prevent server startup

### Process Status
```bash
# Process is running:
node /Users/a00288946/.npm/_npx/2a727a4e7a4c98ad/node_modules/.bin/mcp-box-minimal
npm exec mcp-box-minimal
```

## What We've Tried

1. ✅ Refreshed OAuth token using `mcp-box-minimal/scripts/get-oauth-token.js`
2. ✅ Updated `~/.zshrc` with new token
3. ✅ Updated `~/.cursor/mcp.json` with new token value (hardcoded)
4. ✅ Restarted Cursor IDE twice
5. ✅ Verified token is present in environment variables
6. ✅ Confirmed process is running

## Configuration Context

### Other Working MCP Servers
The same MCP configuration file contains other servers that work correctly:
- `filesystem` - Official MCP server
- `memory` - Official MCP server
- `github-minimal` - Custom server (also uses OAuth tokens)
- `shell-minimal` - Custom server
- `agent-autonomy` - Custom server
- `asana-minimal` - Custom server (also uses access tokens)

**Note**: `asana-minimal` also uses access tokens and works correctly, suggesting the issue may be specific to `box-minimal`.

### Authentication Mechanism
- Server reads `BOX_ACCESS_TOKEN` from environment variables
- Uses `BoxDeveloperTokenAuth` with the access token
- Creates `BoxClient` instance when first tool is called
- No refresh token mechanism (removed in v1.0.5 per CHANGELOG)

## Research Questions

Please research the following:

1. **Why would a stdio-based MCP server process start but fail to connect to Cursor IDE?**
   - Are there known issues with stdio transport initialization?
   - Could there be buffering or timing issues?
   - Are there macOS-specific stdio transport issues?

2. **What could prevent Cursor from recognizing a running MCP server process?**
   - Are there MCP handshake protocol requirements not being met?
   - Could there be errors in the stdio communication that aren't visible?
   - Are there Cursor IDE-specific MCP connection requirements?

3. **Are there known issues with `mcp-box-minimal` or similar Box MCP implementations?**
   - GitHub issues, bug reports, or known compatibility problems
   - Issues specific to macOS or Cursor IDE
   - OAuth token handling problems in stdio-based MCP servers

4. **What debugging approaches could identify why the connection fails?**
   - How to capture stdio communication between Cursor and MCP server?
   - How to enable verbose logging in Cursor for MCP connections?
   - Are there diagnostic tools or commands for MCP servers?

5. **Could the environment variable configuration be the issue?**
   - Does Cursor properly pass environment variables to stdio-based MCP servers?
   - Are there differences in how Cursor handles env vars vs other IDEs?
   - Could there be character encoding or escaping issues with the token?

6. **Alternative solutions for Box MCP integration:**
   - Are there other Box MCP server implementations we should consider?
   - Could we modify the current implementation to work around the issue?
   - Are there workarounds for token refresh in stdio-based MCP servers?

## Additional Context

### Package Details
- **Repository**: https://github.com/gjoeckel/my-mcp-servers
- **Package**: `mcp-box-minimal`
- **Version**: 1.0.5
- **Installation**: Via `npx -y mcp-box-minimal`
- **Dependencies**: `@modelcontextprotocol/sdk`, `box-node-sdk`

### Token Management
- OAuth access tokens expire and must be manually refreshed
- Refresh token functionality was removed in v1.0.5 (intentionally per CHANGELOG)
- Token refresh script available at `mcp-box-minimal/scripts/get-oauth-token.js`
- Token stored in both `~/.zshrc` (for shell) and `~/.cursor/mcp.json` (for MCP config)

### Related Documentation
- MCP Server Architecture: Uses Model Context Protocol stdio transport
- Box SDK: Uses `box-node-sdk` package for API interactions
- Authentication: OAuth 2.0 with access tokens (no refresh token support)

## Expected Outcome

We need to understand:
1. Why the box-minimal MCP server process runs but doesn't connect to Cursor
2. How to diagnose and fix the connection issue
3. Whether there are known solutions or workarounds
4. Best practices for stdio-based MCP servers with OAuth authentication on macOS

Please provide research findings, potential solutions, and debugging recommendations.

