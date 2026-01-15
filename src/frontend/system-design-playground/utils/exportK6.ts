import type { SystemNode, SystemEdge, NodeCategory } from '../diagram.schema';

/**
 * K6 Export Configuration Options
 */
export interface K6ExportOptions {
  targetRPS?: number;           // Override RPS (default: từ node specs)
  targetP95Ms?: number;         // Override P95 target (default: từ simulation)
  durationSeconds?: number;     // Test duration (default: 60s)
  vus?: number;                 // Virtual Users (default: tính từ RPS)
  rampUpSeconds?: number;       // Ramp-up time (default: 10s)
}

/**
 * K6 Endpoint Configuration
 */
export interface K6Endpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  weight?: number;              // Trọng số cho weighted distribution
}

/**
 * K6 Options Structure
 */
interface K6Options {
  vus: number;
  duration: string;
  thresholds: {
    http_req_duration: string[];
    http_req_failed: string[];
    http_reqs?: string[];
  };
  stages?: Array<{
    duration: string;
    target: number;
  }>;
}

/**
 * Diagram Data Input
 */
export interface DiagramData {
  nodes: SystemNode[];
  edges: SystemEdge[];
}

/**
 * Tìm các node Entry Point và API Gateway
 */
function findEntryPointNodes(nodes: SystemNode[]): SystemNode[] {
  return nodes.filter(node => {
    const category = node.data?.category;
    return category === 'Entry Point' || category === 'Traffic Manager';
  });
}

/**
 * Extract endpoints từ các entry point nodes
 */
function extractEndpoints(entryNodes: SystemNode[]): K6Endpoint[] {
  return entryNodes.map((node, index) => {
    const props = node.data?.props || {};
    const label = node.data?.category || node.id;
    
    // Lấy HTTP method từ props hoặc default GET
    const method = (props.httpMethod as K6Endpoint['method']) || 'GET';
    
    // Lấy endpoint URL từ props hoặc tạo default
    const url = props.endpoint || 
                props.url || 
                `http://api.example.com/api/${node.id.toLowerCase()}`;
    
    // Lấy headers từ props
    const headers = props.headers || {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-load-test',
    };
    
    // Lấy body cho POST/PUT/PATCH
    const body = ['POST', 'PUT', 'PATCH'].includes(method) 
      ? props.requestBody || { id: '{{$randomInt}}', timestamp: '{{$timestamp}}' }
      : undefined;
    
    // Weight dựa trên maxThroughput
    const weight = node.data?.specs?.maxThroughput || 100;
    
    return {
      id: node.id,
      name: label,
      method,
      url,
      headers,
      body,
      weight,
    };
  });
}

/**
 * Tính toán k6 options dựa trên RPS và P95
 */
function calculateK6Options(
  nodes: SystemNode[],
  options?: K6ExportOptions
): K6Options {
  // Aggregate RPS from all entry points
  const totalRPS = nodes.reduce((sum, node) => 
    sum + (node.data?.specs?.maxThroughput || 100), 0
  );
  
  // Find max P95 latency (từ simulation hoặc latencyBase)
  const maxP95 = Math.max(...nodes.map(n => {
    const simLatency = n.data?.simulation?.processingTimeMs;
    const baseLatency = n.data?.specs?.latencyBase;
    return simLatency || baseLatency || 100;
  }));
  
  const targetRPS = options?.targetRPS || totalRPS || 100;
  const targetP95 = options?.targetP95Ms || maxP95;
  const duration = options?.durationSeconds || 60;
  const rampUp = options?.rampUpSeconds || 10;
  
  // Calculate VUs: targetRPS * (targetP95 / 1000) * 1.2 (buffer)
  // Little's Law: L = λ * W
  // VUs = RPS * (avg_response_time + think_time)
  const calculatedVUs = Math.ceil(targetRPS * (targetP95 / 1000) * 1.5);
  const vus = options?.vus || Math.max(calculatedVUs, 10);
  
  const k6Options: K6Options = {
    vus,
    duration: `${duration}s`,
    thresholds: {
      http_req_duration: [`p(95)<${targetP95}`],
      http_req_failed: ['rate<0.01'],  // 1% error rate threshold
    },
  };
  
  // Add RPS threshold if specified
  if (targetRPS > 0) {
    k6Options.thresholds.http_reqs = [`rate>=${targetRPS * 0.9}`]; // 90% of target
  }
  
  // Add ramp-up stages if specified
  if (rampUp > 0) {
    k6Options.stages = [
      { duration: `${rampUp}s`, target: vus },
      { duration: `${duration - rampUp - 10}s`, target: vus },
      { duration: '10s', target: 0 }, // ramp-down
    ];
    delete k6Options.duration; // Use stages instead
  }
  
  return k6Options;
}

/**
 * Generate k6 JavaScript script
 */
function generateK6Script(
  endpoints: K6Endpoint[],
  options: K6Options,
  diagramName?: string
): string {
  const timestamp = new Date().toISOString();
  
  // Calculate total weight for weighted selection
  const totalWeight = endpoints.reduce((sum, ep) => sum + (ep.weight || 1), 0);
  
  // Generate weighted endpoint selection logic
  const endpointSelection = endpoints.length > 1 ? `
  // Weighted random endpoint selection
  const rand = Math.random() * ${totalWeight};
  let cumWeight = 0;
  let endpoint = endpoints[0];
  
  for (const ep of endpoints) {
    cumWeight += ep.weight;
    if (rand <= cumWeight) {
      endpoint = ep;
      break;
    }
  }
` : `
  // Single endpoint
  const endpoint = endpoints[0];
`;

  return `/**
 * k6 Load Test Script
 * Generated from: ${diagramName || 'System Design Playground'}
 * Generated at: ${timestamp}
 * 
 * Usage:
 *   k6 run ${diagramName?.toLowerCase().replace(/\s+/g, '-') || 'load-test'}.js
 * 
 * Options:
 *   k6 run --vus ${options.vus} --duration ${options.duration || '60s'} load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const customLatency = new Trend('custom_latency');

// Test configuration
export const options = ${JSON.stringify(options, null, 2)};

// Test endpoints with weights
const endpoints = ${JSON.stringify(endpoints, null, 2)};

// Helper: Replace template variables
function replaceVariables(obj) {
  if (typeof obj === 'string') {
    return obj
      .replace('{{$randomInt}}', Math.floor(Math.random() * 1000000))
      .replace('{{$timestamp}}', Date.now())
      .replace('{{$uuid}}', generateUUID());
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, replaceVariables(v)])
    );
  }
  return obj;
}

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Main test function - executed by each VU
 */
export default function () {
${endpointSelection}
  
  // Prepare request parameters
  const params = {
    headers: endpoint.headers || {},
    timeout: '30s',
    tags: { 
      endpoint: endpoint.name,
      method: endpoint.method 
    },
  };
  
  // Prepare request body with variable replacement
  const requestBody = endpoint.body 
    ? JSON.stringify(replaceVariables(endpoint.body)) 
    : null;
  
  // Execute request
  const startTime = Date.now();
  let response;
  
  switch (endpoint.method) {
    case 'POST':
      response = http.post(endpoint.url, requestBody, params);
      break;
    case 'PUT':
      response = http.put(endpoint.url, requestBody, params);
      break;
    case 'PATCH':
      response = http.patch(endpoint.url, requestBody, params);
      break;
    case 'DELETE':
      response = http.del(endpoint.url, params);
      break;
    default:
      response = http.get(endpoint.url, params);
  }
  
  const duration = Date.now() - startTime;
  customLatency.add(duration);
  
  // Assertions
  const success = check(response, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time OK': (r) => r.timings.duration < ${options.thresholds.http_req_duration[0].match(/\d+/)?.[0] || 500},
    'has response body': (r) => r.body && r.body.length > 0,
  });
  
  // Record metrics
  errorRate.add(!success);
  successRate.add(success);
  
  // Log errors for debugging
  if (!success) {
    console.error(\`[\${endpoint.name}] Failed: \${response.status} - \${response.body?.substring(0, 100)}\`);
  }
  
  // Think time (simulate user behavior)
  sleep(Math.random() * 2 + 1); // 1-3 seconds
}

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('Starting load test...');
  console.log(\`Total endpoints: \${endpoints.length}\`);
  console.log(\`Target VUs: \${options.vus || 'N/A'}\`);
  console.log(\`Duration: \${options.duration || 'stages-based'}\`);
  return { startTime: Date.now() };
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(\`Test completed in \${duration.toFixed(2)} seconds\`);
}
`;
}

/**
 * Main export function
 */
export function exportToK6(
  diagramData: DiagramData,
  exportOptions?: K6ExportOptions
): string {
  const { nodes, edges } = diagramData;
  
  // Step 1: Find entry point nodes
  const entryNodes = findEntryPointNodes(nodes);
  
  if (entryNodes.length === 0) {
    throw new Error(
      'No Entry Point or API Gateway nodes found in the diagram. ' +
      'Please add at least one Entry Point node to generate a k6 test.'
    );
  }
  
  // Step 2: Extract endpoints
  const endpoints = extractEndpoints(entryNodes);
  
  // Step 3: Calculate k6 options
  const k6Options = calculateK6Options(entryNodes, exportOptions);
  
  // Step 4: Generate script
  const script = generateK6Script(endpoints, k6Options, 'Architecture Diagram');
  
  return script;
}

/**
 * Helper: Download k6 script as file
 */
export function downloadK6Script(script: string, filename: string = 'load-test.js'): void {
  const blob = new Blob([script], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
