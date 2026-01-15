/**
 * Test suite for k6 export functionality
 */

import { exportToK6 } from './exportK6';
import type { SystemNode, SystemEdge } from '../diagram.schema';

describe('exportToK6', () => {
  // Sample Entry Point node
  const createEntryPointNode = (id: string, rps: number = 100, latency: number = 50): SystemNode => ({
    id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      category: 'Entry Point',
      label: `API ${id}`,
      technologies: ['REST API'],
      specs: {
        latencyBase: latency,
        maxThroughput: rps,
        reliability: 0.99,
      },
      simulation: {
        processingTimeMs: latency,
        failureRate: 0.001,
      },
      props: {
        httpMethod: 'GET',
        endpoint: `https://api.example.com/${id}`,
      },
    },
  });

  // Sample Traffic Manager (API Gateway) node
  const createApiGatewayNode = (): SystemNode => ({
    id: 'gateway-1',
    type: 'custom',
    position: { x: 100, y: 0 },
    data: {
      category: 'Traffic Manager',
      label: 'API Gateway',
      technologies: ['Kong', 'NGINX'],
      specs: {
        latencyBase: 10,
        maxThroughput: 5000,
        reliability: 0.999,
      },
      simulation: {
        processingTimeMs: 10,
        failureRate: 0.0001,
      },
      props: {
        httpMethod: 'POST',
        endpoint: 'https://gateway.example.com/api',
        requestBody: { action: 'process' },
      },
    },
  });

  // Sample Compute node (should be ignored)
  const createComputeNode = (): SystemNode => ({
    id: 'compute-1',
    type: 'custom',
    position: { x: 200, y: 0 },
    data: {
      category: 'Compute',
      label: 'Web Server',
      specs: {
        latencyBase: 20,
        maxThroughput: 1000,
        reliability: 0.99,
      },
      simulation: {
        processingTimeMs: 20,
        failureRate: 0.01,
      },
    },
  });

  const createEdge = (source: string, target: string): SystemEdge => ({
    id: `${source}-${target}`,
    source,
    target,
  });

  test('should throw error when no entry points exist', () => {
    const nodes: SystemNode[] = [createComputeNode()];
    const edges: SystemEdge[] = [];

    expect(() => exportToK6({ nodes, edges })).toThrow(
      'No Entry Point or API Gateway nodes found'
    );
  });

  test('should generate k6 script with single entry point', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 100, 50)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('import http from \'k6/http\';');
    expect(script).toContain('export const options');
    expect(script).toContain('https://api.example.com/api-1');
    expect(script).toContain('p(95)<50');
    expect(script).toContain('export default function ()');
  });

  test('should generate k6 script with multiple entry points', () => {
    const nodes: SystemNode[] = [
      createEntryPointNode('api-1', 100, 50),
      createEntryPointNode('api-2', 200, 30),
      createApiGatewayNode(),
    ];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('https://api.example.com/api-1');
    expect(script).toContain('https://api.example.com/api-2');
    expect(script).toContain('https://gateway.example.com/api');
    expect(script).toContain('Weighted random endpoint selection');
  });

  test('should calculate correct VUs based on RPS and latency', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 1000, 100)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    // VUs = RPS * (latency/1000) * 1.5 = 1000 * 0.1 * 1.5 = 150
    expect(script).toMatch(/vus["\s]*:["\s]*\d+/);
    const vusMatch = script.match(/"vus":\s*(\d+)/);
    expect(vusMatch).toBeTruthy();
    const vus = parseInt(vusMatch![1]);
    expect(vus).toBeGreaterThanOrEqual(100); // At least 100 VUs
  });

  test('should include thresholds in options', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 100, 80)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('thresholds');
    expect(script).toContain('http_req_duration');
    expect(script).toContain('http_req_failed');
    expect(script).toContain('p(95)<80');
  });

  test('should support custom export options', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 100, 50)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges }, {
      targetRPS: 500,
      targetP95Ms: 200,
      durationSeconds: 120,
      vus: 50,
    });

    expect(script).toContain('p(95)<200');
    expect(script).toContain('"vus": 50');
    expect(script).toContain('"duration": "120s"');
  });

  test('should handle different HTTP methods', () => {
    const postNode: SystemNode = {
      id: 'post-api',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        category: 'Entry Point',
        specs: { latencyBase: 50, maxThroughput: 100, reliability: 0.99 },
        simulation: { processingTimeMs: 50, failureRate: 0.001 },
        props: {
          httpMethod: 'POST',
          endpoint: 'https://api.example.com/create',
          requestBody: { name: 'test' },
        },
      },
    };

    const script = exportToK6({ nodes: [postNode], edges: [] });

    expect(script).toContain('case \'POST\'');
    expect(script).toContain('http.post');
  });

  test('should filter out non-entry point nodes', () => {
    const nodes: SystemNode[] = [
      createEntryPointNode('api-1', 100, 50),
      createComputeNode(),
      createApiGatewayNode(),
    ];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    // Should only include Entry Point and Traffic Manager
    expect(script).toContain('https://api.example.com/api-1');
    expect(script).toContain('https://gateway.example.com/api');
    expect(script).not.toContain('Web Server');
  });

  test('should include setup and teardown functions', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 100, 50)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('export function setup()');
    expect(script).toContain('export function teardown(data)');
  });

  test('should include custom metrics', () => {
    const nodes: SystemNode[] = [createEntryPointNode('api-1', 100, 50)];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('const errorRate = new Rate(\'errors\')');
    expect(script).toContain('const successRate = new Rate(\'success\')');
    expect(script).toContain('const customLatency = new Trend(\'custom_latency\')');
  });

  test('should include variable replacement helpers', () => {
    const nodes: SystemNode[] = [createApiGatewayNode()];
    const edges: SystemEdge[] = [];

    const script = exportToK6({ nodes, edges });

    expect(script).toContain('function replaceVariables(obj)');
    expect(script).toContain('{{$randomInt}}');
    expect(script).toContain('{{$timestamp}}');
    expect(script).toContain('{{$uuid}}');
  });
});
