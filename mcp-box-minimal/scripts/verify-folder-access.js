#!/usr/bin/env node
/**
 * Verify Box Folder Access
 * Tests connection to a specific Box folder using the current access token
 */

import { BoxClient, BoxDeveloperTokenAuth } from 'box-node-sdk';

const FOLDER_ID = process.argv[2] || '356056033736';
const ACCESS_TOKEN = process.env.BOX_ACCESS_TOKEN || process.env.BOX_DEV_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Error: BOX_ACCESS_TOKEN or BOX_DEV_TOKEN must be set');
  process.exit(1);
}

try {
  console.log('🔍 Verifying Box folder access...\n');
  console.log(`Folder ID: ${FOLDER_ID}\n`);

  const auth = new BoxDeveloperTokenAuth({ token: ACCESS_TOKEN });
  const client = new BoxClient({ auth });

  // Get folder details
  const folder = await client.folders.getFolderById(FOLDER_ID, {
    queryParams: {
      fields: ['id', 'name', 'type', 'modified_at', 'item_collection', 'parent'],
    },
  });

  console.log('✅ Successfully connected to Box!\n');
  console.log('Folder Details:');
  console.log(`  Name: ${folder.name}`);
  console.log(`  ID: ${folder.id}`);
  console.log(`  Type: ${folder.type}`);
  console.log(`  Modified: ${folder.modified_at}`);
  if (folder.parent) {
    console.log(`  Parent: ${folder.parent.name} (${folder.parent.id})`);
  }
  console.log(`  URL: https://usu.app.box.com/folder/${folder.id}\n`);

  // List folder items
  const items = await client.folders.getFolderItems(FOLDER_ID, {
    queryParams: {
      limit: 10,
      fields: ['id', 'name', 'type', 'size'],
    },
  });

  console.log(`📁 Folder contains ${items.total_count || items.entries.length} items (showing first 10):\n`);

  if (items.entries.length > 0) {
    items.entries.forEach((item, index) => {
      const size = item.size ? ` (${formatBytes(item.size)})` : '';
      const type = item.type === 'file' ? '📄' : item.type === 'folder' ? '📁' : '🔗';
      console.log(`  ${index + 1}. ${type} ${item.name}${size}`);
      if (item.type === 'file') {
        console.log(`     URL: https://app.box.com/file/${item.id}`);
      } else if (item.type === 'folder') {
        console.log(`     URL: https://app.box.com/folder/${item.id}`);
      }
    });
  } else {
    console.log('  (Folder is empty)');
  }

  console.log('\n✅ Folder access verified successfully!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error accessing Box folder:');
  console.error(`   ${error.message || String(error)}`);

  if (error.statusCode === 401 || error.statusCode === 403) {
    console.error('\n💡 This looks like an authentication error.');
    console.error('   Your token may have expired. Try:');
    console.error('   node mcp-box-minimal/scripts/get-oauth-token.js');
  }

  process.exit(1);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
