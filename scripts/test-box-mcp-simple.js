#!/usr/bin/env node
/**
 * Simplified programmatic test of box-minimal MCP server
 */

import { spawn } from 'child_process';

const server = spawn('npx', ['-y', 'mcp-box-minimal'], {
  env: {
    ...process.env,
    BOX_CLIENT_ID: '3xsda5fikhvgjua3s4gj7m6syr62hkty',
    BOX_CLIENT_SECRET: 'rLRTGenQG8qs60BZqC02rtD7DwwCLnzq',
    BOX_ACCESS_TOKEN: '6hpJLIspGbp8cue0ZxVYTIcwQSjH099b',
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

let requestId = 0;
let stdoutBuffer = '';

server.stdout.on('data', (data) => {
  stdoutBuffer += data.toString();

  // Process complete JSON-RPC messages
  const lines = stdoutBuffer.split('\n');
  stdoutBuffer = lines.pop() || ''; // Keep incomplete line

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const response = JSON.parse(line);

      if (response.result) {
        console.log('\n✅ Response:', JSON.stringify(response, null, 2).substring(0, 500));
      } else if (response.error) {
        console.error('\n❌ Error:', JSON.stringify(response.error, null, 2));
      }
    } catch (e) {
      // Not JSON, skip
    }
  }
});

server.stderr.on('data', (data) => {
  const line = data.toString().trim();
  if (line) {
    console.log('📋 stderr:', line);
  }
});

function send(method, params) {
  const id = ++requestId;
  const request = {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
  console.log(`\n📤 ${method}:`);
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Test sequence
setTimeout(() => {
  console.log('🧪 Testing box-minimal MCP server\n');

  // Initialize
  send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0' }
  });

  setTimeout(() => {
    // List tools
    send('tools/list', {});

    setTimeout(() => {
      // Test tool call
      console.log('\n🔹 Testing box_list_folder_items with folder_id="0"');
      send('tools/call', {
        name: 'box_list_folder_items',
        arguments: {
          folder_id: '0',
          limit: 3
        }
      });

      // Give it time to respond
      setTimeout(() => {
        console.log('\n⏱️  Waiting a bit longer for response...');
        setTimeout(() => {
          server.kill();
          process.exit(0);
        }, 5000);
      }, 3000);
    }, 500);
  }, 500);
}, 1000);

// Handle errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

