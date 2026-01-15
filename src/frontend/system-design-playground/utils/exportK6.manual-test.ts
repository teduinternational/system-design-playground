/**
 * Quick manual test for k6 export
 * Run this in browser console or Node
 */

import { exportToK6 } from '../utils/exportK6';
import type { SystemNode, SystemEdge } from '../diagram.schema';

// Create test data
const testNodes: SystemNode[] = [
  {
    id: 'entry-1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      category: 'Entry Point',
      label: 'User API',
      technologies: ['REST'],
      specs: {
        latencyBase: 50,
        maxThroughput: 1000,
        reliability: 0.99,
      },
      simulation: {
        processingTimeMs: 50,
        failureRate: 0.01,
      },
      props: {
        httpMethod: 'GET',
        endpoint: 'https://api.example.com/users',
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json',
        },
      },
    },
  },
  {
    id: 'gateway-1',
    type: 'custom',
    position: { x: 350, y: 100 },
    data: {
      category: 'Traffic Manager',
      label: 'API Gateway',
      technologies: ['Kong'],
      specs: {
        latencyBase: 10,
        maxThroughput: 5000,
        reliability: 0.999,
      },
      simulation: {
        processingTimeMs: 10,
        failureRate: 0.001,
      },
      props: {
        httpMethod: 'POST',
        endpoint: 'https://gateway.example.com/api',
        requestBody: {
          action: '{{$randomInt}}',
          timestamp: '{{$timestamp}}',
          uuid: '{{$uuid}}',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
    },
  },
  {
    id: 'compute-1',
    type: 'custom',
    position: { x: 600, y: 100 },
    data: {
      category: 'Compute',
      label: 'Web Server',
      specs: {
        latencyBase: 20,
        maxThroughput: 2000,
        reliability: 0.99,
      },
      simulation: {
        processingTimeMs: 20,
        failureRate: 0.005,
      },
    },
  },
];

const testEdges: SystemEdge[] = [
  {
    id: 'entry-1_gateway-1',
    source: 'entry-1',
    target: 'gateway-1',
  },
  {
    id: 'gateway-1_compute-1',
    source: 'gateway-1',
    target: 'compute-1',
  },
];

// Test 1: Basic export
console.log('=== Test 1: Basic Export ===');
try {
  const script = exportToK6({ nodes: testNodes, edges: testEdges });
  console.log('✅ Script generated successfully');
  console.log('Script length:', script.length, 'characters');
  console.log('Contains entry-1:', script.includes('entry-1'));
  console.log('Contains gateway-1:', script.includes('gateway-1'));
  console.log('Does NOT contain compute-1:', !script.includes('Web Server'));
  console.log('\n--- Generated Script Preview ---');
  console.log(script.substring(0, 500) + '...\n');
} catch (error) {
  console.error('❌ Test 1 failed:', error);
}

// Test 2: Custom options
console.log('\n=== Test 2: Custom Options ===');
try {
  const customScript = exportToK6(
    { nodes: testNodes, edges: testEdges },
    {
      targetRPS: 2000,
      targetP95Ms: 100,
      durationSeconds: 120,
      vus: 200,
      rampUpSeconds: 20,
    }
  );
  console.log('✅ Custom script generated');
  console.log('Contains vus: 200:', customScript.includes('"vus": 200'));
  console.log('Contains p(95)<100:', customScript.includes('p(95)<100'));
} catch (error) {
  console.error('❌ Test 2 failed:', error);
}

// Test 3: No entry points (should throw error)
console.log('\n=== Test 3: No Entry Points (should error) ===');
try {
  const noEntryNodes: SystemNode[] = [
    {
      id: 'compute-only',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        category: 'Compute',
        specs: { latencyBase: 10, maxThroughput: 100, reliability: 0.99 },
        simulation: { processingTimeMs: 10, failureRate: 0.01 },
      },
    },
  ];
  exportToK6({ nodes: noEntryNodes, edges: [] });
  console.error('❌ Test 3 failed: Should have thrown error');
} catch (error) {
  if (error instanceof Error && error.message.includes('No Entry Point')) {
    console.log('✅ Correctly threw error:', error.message);
  } else {
    console.error('❌ Test 3 failed with unexpected error:', error);
  }
}

// Test 4: Verify script structure
console.log('\n=== Test 4: Script Structure ===');
try {
  const script = exportToK6({ nodes: testNodes, edges: testEdges });
  
  const checks = [
    { name: 'Import http', check: script.includes("import http from 'k6/http'") },
    { name: 'Import check', check: script.includes("import { check, sleep } from 'k6'") },
    { name: 'Custom metrics', check: script.includes('const errorRate = new Rate') },
    { name: 'Options export', check: script.includes('export const options') },
    { name: 'Thresholds', check: script.includes('thresholds') },
    { name: 'Default function', check: script.includes('export default function ()') },
    { name: 'Setup function', check: script.includes('export function setup()') },
    { name: 'Teardown function', check: script.includes('export function teardown(data)') },
    { name: 'Variable replacement', check: script.includes('function replaceVariables') },
    { name: 'UUID generator', check: script.includes('function generateUUID()') },
    { name: 'HTTP methods switch', check: script.includes("case 'POST'") },
    { name: 'Check assertions', check: script.includes('const success = check(response') },
  ];
  
  checks.forEach(({ name, check }) => {
    console.log(check ? `✅ ${name}` : `❌ ${name}`);
  });
} catch (error) {
  console.error('❌ Test 4 failed:', error);
}

console.log('\n=== All Tests Complete ===');
