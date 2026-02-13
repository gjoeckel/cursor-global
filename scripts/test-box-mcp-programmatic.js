#!/usr/bin/env node
/**
 * Programmatic test of box-minimal MCP server
 * Tests initialize, tools/list, and box_list_folder_items
 */

import { spawn } from 'child_process';
import { Readable } from 'stream';

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
const pendingRequests = new Map();

function sendRequest(method, params = {}) {
  const id = ++requestId;
  const request = {
    jsonrpc: '2.0',
    id,
    method,
    params
  };

  console.log(`\n📤 Sending: ${method}`);
  console.log(JSON.stringify(request, null, 2));

  pendingRequests.set(id, { method, startTime: Date.now() });
  server.stdin.write(JSON.stringify(request) + '\n');

  return id;
}

function waitForResponse(timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout waiting for response'));
    }, timeout);

    const onData = (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const response = JSON.parse(line);

          if (response.id && pendingRequests.has(response.id)) {
            const request = pendingRequests.get(response.id);
            clearTimeout(timer);
            pendingRequests.delete(response.id);

            console.log(`\n📥 Response to ${request.method} (${Date.now() - request.startTime}ms):`);
            console.log(JSON.stringify(response, null, 2));

            if (response.error) {
              console.error(`\n❌ ERROR: ${response.error.message}`);
              if (response.error.data) {
                console.error('Error data:', JSON.stringify(response.error.data, null, 2));
              }
            }

            resolve(response);
            return;
          }
        } catch (e) {
          // Not JSON, might be stderr output
          if (line.includes('Box Minimal MCP server')) {
            console.log(`\nℹ️  Server message: ${line}`);
          } else if (line.trim()) {
            console.log(`\n📋 Output: ${line}`);
          }
        }
      }
    };

    server.stdout.on('data', onData);
    server.stderr.on('data', (data) => {
      const line = data.toString().trim();
      if (line) {
        console.log(`\n📋 stderr: ${line}`);
      }
    });
  });
}

async function test() {
  try {
    console.log('🧪 Testing box-minimal MCP server programmatically\n');
    console.log('=' .repeat(60));

    // Step 1: Initialize
    console.log('\n🔹 Step 1: Initialize handshake');
    sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    const initResponse = await waitForResponse();

    if (initResponse.error) {
      console.error('❌ Initialize failed:', initResponse.error);
      process.exit(1);
    }

    console.log('✅ Initialize successful');

    // Step 2: Send initialized notification
    console.log('\n🔹 Step 2: Send initialized notification');
    sendRequest('notifications/initialized', {});
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 3: List tools
    console.log('\n🔹 Step 3: List tools');
    sendRequest('tools/list', {});

    const toolsResponse = await waitForResponse();

    if (toolsResponse.error) {
      console.error('❌ Tools list failed:', toolsResponse.error);
      process.exit(1);
    }

    const toolCount = toolsResponse.result?.tools?.length || 0;
    console.log(`✅ Found ${toolCount} tools`);

    if (toolCount > 0) {
      console.log('\nTools:');
      toolsResponse.result.tools.forEach((tool, i) => {
        console.log(`  ${i + 1}. ${tool.name}`);
      });
    }

    // Step 4: Test box_list_folder_items
    console.log('\n🔹 Step 4: Test box_list_folder_items');
    sendRequest('tools/call', {
      name: 'box_list_folder_items',
      arguments: {
        folder_id: '0',
        limit: 5
      }
    });

    const toolResponse = await waitForResponse(15000);

    if (toolResponse.error) {
      console.error('❌ Tool call failed:', toolResponse.error);
      console.error('\nError details:');
      console.error(JSON.stringify(toolResponse.error, null, 2));
      process.exit(1);
    }

    console.log('✅ Tool call successful');
    console.log('\nResult:', JSON.stringify(toolResponse.result, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    server.kill();
    process.exit(0);
  }
}

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Start test
test();

