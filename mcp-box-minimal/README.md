# mcp-box-minimal

**Minimal Box MCP server with essential file operations (6 tools)**

A lightweight Model Context Protocol (MCP) server for Box that provides only the essential file management tools, designed to stay under Cursor's 40-tool limit.

---

## Features

- ✅ **6 Essential Tools** - Only what you need
- ✅ **OAuth 2.0 Authentication** - Secure access with Client ID/Secret
- ✅ **TypeScript** - Type-safe implementation
- ✅ **Lightweight** - Minimal dependencies

---

## Tools

1. **`box_list_folder_items`** - List files, folders, and web links in a folder
2. **`box_get_file_content`** - Read file content (text, PDF, Word, etc.)
3. **`box_get_file_details`** - Get file metadata and permissions
4. **`box_search_files`** - Search files using keywords and filters
5. **`box_upload_file`** - Upload files to Box folders
6. **`box_ai_qa_single_file`** - Ask questions to files using Box AI

---

## Installation

### Get Box OAuth Credentials

1. Go to: https://app.box.com/developers/console
2. Create a new app or select existing app
3. Choose "User Authentication (OAuth 2.0)"
4. Note your **Client ID** and **Client Secret**

### Get Access Token

**Option 1: Developer Token (Quick Testing)**
1. In Box Developer Console, go to your app's Configuration
2. Click "Generate Developer Token"
3. Copy the token (expires in 60 minutes)

**Option 2: OAuth Access Token (Production)**
1. Complete OAuth flow to get access token
2. Store token securely

### Set Environment Variables

```bash
export BOX_CLIENT_ID="your_client_id"
export BOX_CLIENT_SECRET="your_client_secret"
export BOX_ACCESS_TOKEN="your_access_token"  # or BOX_DEV_TOKEN for testing
```

Or add to your shell profile (`~/.zshrc` or `~/.bashrc`):
```bash
echo 'export BOX_CLIENT_ID="your_client_id"' >> ~/.zshrc
echo 'export BOX_CLIENT_SECRET="your_client_secret"' >> ~/.zshrc
echo 'export BOX_ACCESS_TOKEN="your_access_token"' >> ~/.zshrc
source ~/.zshrc
```

---

## Configuration

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "box-minimal": {
      "command": "node",
      "args": ["/path/to/mcp-box-minimal/dist/index.js"],
      "env": {
        "BOX_CLIENT_ID": "${BOX_CLIENT_ID}",
        "BOX_CLIENT_SECRET": "${BOX_CLIENT_SECRET}",
        "BOX_ACCESS_TOKEN": "${BOX_ACCESS_TOKEN}"
      }
    }
  }
}
```

---

## Usage

After configuration, restart Cursor and use natural language commands:

- "List files in Box folder 355472828832"
- "Read the content of file ABC123"
- "Search for PDF files containing 'report'"
- "Upload a file to folder XYZ"
- "Ask Box AI about the content of file ABC123"

---

## Development

### Build

```bash
npm install
npm run build
```

### Run Locally

```bash
npm start
```

---

## Tool Details

### box_list_folder_items

List contents of a Box folder.

**Parameters:**
- `folder_id` (required) - Folder ID to list
- `limit` (optional) - Max results (default: 100, max: 1000)
- `offset` (optional) - Pagination offset (default: 0)

### box_get_file_content

Read file content from Box.

**Parameters:**
- `file_id` (required) - File ID to read
- `as_text` (optional) - Return as text vs base64 (default: true)

### box_get_file_details

Get detailed file information.

**Parameters:**
- `file_id` (required) - File ID to get details for

### box_search_files

Search for files and folders.

**Parameters:**
- `query` (required) - Search keywords
- `file_extensions` (optional) - Filter by extensions (e.g., ["pdf", "docx"])
- `limit` (optional) - Max results (default: 30, max: 200)
- `offset` (optional) - Pagination offset

### box_upload_file

Upload a file to Box.

**Parameters:**
- `folder_id` (required) - Destination folder ID
- `file_name` (required) - Name for uploaded file
- `content` (required) - File content (text or base64)
- `content_encoding` (optional) - "text" or "base64" (default: "text")

### box_ai_qa_single_file

Ask questions to a file using Box AI.

**Parameters:**
- `file_id` (required) - File ID to query
- `question` (required) - Question to ask about file content

---

## License

MIT

---

**Created:** 2025-01-11
