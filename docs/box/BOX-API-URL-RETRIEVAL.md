# Box API: Retrieving Folder and File URLs

## Overview

This document describes the process for retrieving folder and file URLs from Box through the API. Box URLs are constructed from file/folder IDs rather than being directly returned by the API, except for shared links which are returned when explicitly requested.

## Authentication Setup

### 1. Get Box API Client

The Box API client is initialized using either:
- **OAuth Access Token** (recommended for production): `BOX_ACCESS_TOKEN`
- **Developer Token** (for testing, expires in 60 minutes): `BOX_DEV_TOKEN`

```typescript
import { getBoxClient } from './box-client';

const client = getBoxClient();
```

### 2. Authentication Methods

**Option A: OAuth Access Token (Production)**
1. Get `BOX_CLIENT_ID` and `BOX_CLIENT_SECRET` from Box Developer Console
2. Run: `node mcp-box-minimal/scripts/get-oauth-token.js`
3. Follow browser authorization flow
4. Copy the `BOX_ACCESS_TOKEN` from output
5. Add to environment variables: `export BOX_ACCESS_TOKEN='your_token'`

**Option B: Developer Token (Testing)**
1. Go to: https://app.box.com/developers/console
2. Select your app
3. Generate Developer Token (expires in 60 minutes)
4. Add to environment: `export BOX_DEV_TOKEN='your_token'`

## Retrieving File Information and URLs

### Method 1: Get File Details (Recommended)

```typescript
const client = getBoxClient();

const file = await client.files.getFileById(fileId, {
  queryParams: {
    fields: ['id', 'name', 'size', 'modified_at', 'version_number', 'shared_link', 'parent']
  }
});
```

**Standard File URLs** (constructed from file ID):
- **View URL**: `https://app.box.com/file/${file.id}`
- **Word Online URL**: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=${file.id}`
- **Download URL**: Use `client.downloads.getDownloadFileUrl(fileId)` or `client.downloads.downloadFile(fileId)`

**Shared Link** (if available):
- `file.shared_link.url` - Public shared link URL
- `file.shared_link.download_url` - Direct download URL
- `file.shared_link.vanity_url` - Custom vanity URL (if set)

### Method 2: Using MCP Box Tools

The MCP Box minimal package provides helper functions:

```typescript
// Get file details including URLs
const details = await getFileDetails({ file_id: '123456789' });

// Returns:
// {
//   file_id: '123456789',
//   name: 'document.docx',
//   shared_link: {
//     url: 'https://app.box.com/s/...',
//     download_url: 'https://app.box.com/shared/static/...',
//     vanity_url: null
//   },
//   parent: { id: '987654321', name: 'Folder Name' },
//   ...
// }
```

## Retrieving Folder Information and URLs

### Method 1: List Folder Items

```typescript
const client = getBoxClient();

const folder = await client.folders.getFolderItems(folderId, {
  queryParams: {
    limit: 100,
    offset: 0,
    fields: ['id', 'name', 'type', 'size', 'modified_at', 'created_at', 'parent']
  }
});

// Returns array of items (files, folders, web links)
folder.entries.forEach((item: any) => {
  if (item.type === 'file') {
    const fileUrl = `https://app.box.com/file/${item.id}`;
  } else if (item.type === 'folder') {
    const folderUrl = `https://app.box.com/folder/${item.id}`;
  }
});
```

### Method 2: Get Folder Details

```typescript
const client = getBoxClient();

const folder = await client.folders.getFolderById(folderId, {
  queryParams: {
    fields: ['id', 'name', 'type', 'modified_at', 'shared_link', 'parent']
  }
});

// Folder URL (constructed)
const folderUrl = `https://app.box.com/folder/${folder.id}`;

// Shared link (if available)
if (folder.shared_link) {
  const sharedUrl = folder.shared_link.url;
}
```

### Method 3: Using MCP Box Tools

```typescript
// List folder items
const items = await listFolderItems({
  folder_id: '123456789',
  limit: 100,
  offset: 0
});

// Returns:
// {
//   items: [
//     { id: '...', name: 'file.docx', type: 'file', ... },
//     { id: '...', name: 'subfolder', type: 'folder', ... }
//   ],
//   total_count: 50,
//   ...
// }
```

## URL Construction Patterns

### Standard URLs (Always Available)

These URLs can be constructed from file/folder IDs without API calls:

**Files:**
- View: `https://app.box.com/file/{file_id}`
- Word Online: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId={file_id}`
- Box Office Online Edit: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId={file_id}&sharedAccessCode=`

**Folders:**
- View: `https://app.box.com/folder/{folder_id}`
- Enterprise (usu.app.box.com): `https://usu.app.box.com/folder/{folder_id}`

### Shared Link URLs (API Required)

Shared links must be retrieved via API when the `shared_link` field is requested:

```typescript
const file = await client.files.getFileById(fileId, {
  queryParams: {
    fields: ['id', 'shared_link']  // Must explicitly request shared_link
  }
});

// If shared link exists
if (file.shared_link) {
  const publicUrl = file.shared_link.url;           // Public URL
  const downloadUrl = file.shared_link.download_url; // Direct download
  const vanityUrl = file.shared_link.vanity_url;     // Custom URL (optional)
}
```

## Complete Example: File URL Retrieval

```javascript
// JavaScript/TypeScript example
const boxClient = getBoxClient();

// Get file details
const fileDetails = await boxClient.files.getFileById(fileId, {
  queryParams: {
    fields: ['id', 'name', 'size', 'modified_at', 'version_number', 'shared_link']
  }
});

// Construct standard URLs
const fileUrls = {
  file_id: fileDetails.id,
  file_name: fileDetails.name,

  // Standard URLs (constructed)
  file_url: `https://app.box.com/file/${fileDetails.id}`,
  word_online_url: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=${fileDetails.id}`,

  // Shared link (if available, from API)
  shared_link_url: fileDetails.shared_link?.url || null,
  download_url: fileDetails.shared_link?.download_url || null,

  // Metadata
  modified_at: fileDetails.modified_at,
  version: fileDetails.version_number || 1
};
```

## Complete Example: Folder URL Retrieval

```javascript
// Get folder details
const folderDetails = await boxClient.folders.getFolderById(folderId, {
  queryParams: {
    fields: ['id', 'name', 'shared_link', 'parent']
  }
});

// Construct folder URL
const folderUrl = `https://app.box.com/folder/${folderDetails.id}`;

// Get folder contents
const folderItems = await boxClient.folders.getFolderItems(folderId, {
  queryParams: {
    limit: 100,
    fields: ['id', 'name', 'type']
  }
});

// Build URLs for each item
folderItems.entries.forEach(item => {
  if (item.type === 'file') {
    item.url = `https://app.box.com/file/${item.id}`;
  } else if (item.type === 'folder') {
    item.url = `https://app.box.com/folder/${item.id}`;
  }
});
```

## Python Example

```python
from boxsdk import Client, OAuth2

# Initialize client
auth = OAuth2(
    client_id=os.environ['BOX_CLIENT_ID'],
    client_secret=os.environ['BOX_CLIENT_SECRET'],
    access_token=os.environ['BOX_ACCESS_TOKEN']
)
client = Client(auth)

# Get file details
file = client.file(file_id='123456789').get(
    fields=['id', 'name', 'shared_link']
)

# Construct URLs
file_url = f'https://app.box.com/file/{file.id}'
word_online_url = f'https://app.box.com/integrations/officeonline/openOfficeOnline?fileId={file.id}'

# Get shared link if available
shared_url = file.shared_link.url if file.shared_link else None

# Get folder items
folder = client.folder(folder_id='987654321')
items = folder.get_items(
    limit=100,
    fields=['id', 'name', 'type']
)

# Build URLs for items
for item in items:
    if item.type == 'file':
        url = f'https://app.box.com/file/{item.id}'
    elif item.type == 'folder':
        url = f'https://app.box.com/folder/{item.id}'
```

## Key Points

1. **Standard URLs are constructed**, not returned by API:
   - File view: `https://app.box.com/file/{id}`
   - Folder view: `https://app.box.com/folder/{id}`
   - Word Online: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId={id}`

2. **Shared links require API call** with `shared_link` field:
   - Must explicitly request `shared_link` in fields parameter
   - Only available if file/folder has been shared
   - Returns `null` if not shared

3. **Parent folder information** is available:
   - File/folder objects include `parent` field with `id` and `name`
   - Can construct parent folder URL: `https://app.box.com/folder/{parent.id}`

4. **Download URLs**:
   - Use `client.downloads.getDownloadFileUrl(fileId)` for direct download
   - Or `client.downloads.downloadFile(fileId)` for stream
   - Shared links include `download_url` if shared

## Common Workflow

1. **List folder contents** to discover files/folders
2. **Get file/folder details** to retrieve metadata
3. **Construct standard URLs** from IDs
4. **Retrieve shared links** if needed (optional)
5. **Use download URLs** for file content retrieval

## Using box-minimal MCP

### Current Capabilities

The `mcp-box-minimal` package provides MCP tools that can retrieve file/folder information, but **do not automatically construct URLs**. You still need to construct URLs from the returned IDs.

**Available Tools:**
1. `box_get_file_details` - Returns file metadata including `file_id`, `shared_link`, `parent`
2. `box_list_folder_items` - Returns folder contents with `id`, `name`, `type` for each item

**Example with box-minimal:**
```typescript
// Using box_get_file_details MCP tool
const details = await box_get_file_details({ file_id: '123456789' });

// Returns:
// {
//   file_id: '123456789',
//   name: 'document.docx',
//   shared_link: { url: '...', download_url: '...' },
//   parent: { id: '987654321', name: 'Folder' },
//   ...
// }

// You still need to construct standard URLs:
const fileUrl = `https://app.box.com/file/${details.file_id}`;
const wordOnlineUrl = `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=${details.file_id}`;
const parentFolderUrl = `https://app.box.com/folder/${details.parent.id}`;
```

### Efficiency Improvement Opportunity

**Current Limitation:**
The MCP tools return IDs but don't construct standard URLs, requiring manual construction.

**Proposed Enhancement:**
Add URL construction directly in the tool responses:

```typescript
// Enhanced get_file_details return value:
{
  file_id: '123456789',
  name: 'document.docx',
  // ... existing fields ...

  // ADDED: Constructed URLs
  urls: {
    view: 'https://app.box.com/file/123456789',
    word_online: 'https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=123456789',
    parent_folder: 'https://app.box.com/folder/987654321'
  },
  shared_link: { ... } // Still returned as-is from API
}
```

**For `list_folder_items`:**
```typescript
// Enhanced list_folder_items return value:
{
  items: [
    {
      id: '123456789',
      name: 'file.docx',
      type: 'file',
      // ... existing fields ...

      // ADDED: Constructed URL based on type
      url: 'https://app.box.com/file/123456789'
    },
    {
      id: '987654321',
      name: 'folder',
      type: 'folder',
      // ... existing fields ...

      // ADDED: Constructed URL
      url: 'https://app.box.com/folder/987654321'
    }
  ],
  ...
}
```

**Benefits:**
- ✅ Eliminates manual URL construction
- ✅ Consistent URL format
- ✅ Reduces client-side code
- ✅ More efficient for AI agents using MCP tools

**Implementation:**
Would require updating:
- `mcp-box-minimal/src/tools/get-file-details.ts` - Add `urls` object
- `mcp-box-minimal/src/tools/list-folder-items.ts` - Add `url` to each item

### Current Workaround

Until URLs are added to tool responses, construct them client-side:

```javascript
// Helper function for file URLs
function constructBoxUrls(fileId, parentFolderId = null) {
  return {
    view: `https://app.box.com/file/${fileId}`,
    word_online: `https://app.box.com/integrations/officeonline/openOfficeOnline?fileId=${fileId}`,
    parent_folder: parentFolderId ? `https://app.box.com/folder/${parentFolderId}` : null
  };
}

// Helper function for folder URLs
function constructFolderUrl(folderId) {
  return `https://app.box.com/folder/${folderId}`;
}

// Usage
const details = await box_get_file_details({ file_id: '123456789' });
const urls = constructBoxUrls(details.file_id, details.parent?.id);
```

## References

- Box API Documentation: https://developer.box.com/reference
- Box SDK Node.js: https://github.com/box/box-node-sdk
- Box SDK Python: https://github.com/box/box-python-sdk
- Implementation examples in: `mcp-box-minimal/src/tools/`
- Usage examples in: `canvas-courses/scripts/discover-box-files.js`
- Authentication details: See `BOX-MINIMAL-AUTHENTICATION.md`
