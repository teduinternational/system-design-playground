# Export k6 Load Test Utility

## Overview

Tự động sinh mã k6 JavaScript từ System Design Playground diagram để thực hiện load testing.

## Files

- `exportK6.ts` - Core logic export k6 script
- `exportK6.test.ts` - Unit tests
- `exportK6.manual-test.ts` - Manual testing script

## Quick Start

```typescript
import { exportToK6, downloadK6Script } from './utils/exportK6';

// Get diagram data from store
const nodes = useDiagramStore.getState().nodes;
const edges = useDiagramStore.getState().edges;

// Export
const script = exportToK6({ nodes, edges });

// Download
downloadK6Script(script, 'load-test.js');
```

## Features

✅ **Auto-detect Entry Points** - Tìm các node Entry Point và Traffic Manager  
✅ **Calculate VUs** - Dựa trên Little's Law (RPS × Latency × Buffer)  
✅ **Generate Thresholds** - P95 latency, error rate, RPS  
✅ **Weighted Distribution** - Phân phối requests theo throughput của mỗi endpoint  
✅ **Template Variables** - {{$randomInt}}, {{$timestamp}}, {{$uuid}}  
✅ **Custom Metrics** - Error rate, success rate, custom latency  
✅ **Setup/Teardown** - Lifecycle hooks  

## API

### exportToK6(diagramData, options?)

```typescript
function exportToK6(
  diagramData: DiagramData,
  options?: K6ExportOptions
): string
```

**Parameters:**
- `diagramData` - Diagram nodes và edges
- `options` - Custom configuration (optional)

**Returns:** k6 JavaScript script

### downloadK6Script(script, filename?)

```typescript
function downloadK6Script(
  script: string,
  filename?: string
): void
```

**Parameters:**
- `script` - k6 script content
- `filename` - Output filename (default: 'load-test.js')

## Configuration

```typescript
interface K6ExportOptions {
  targetRPS?: number;          // Override RPS
  targetP95Ms?: number;        // Override P95 latency
  durationSeconds?: number;    // Test duration (default: 60)
  vus?: number;                // Virtual users (default: auto)
  rampUpSeconds?: number;      // Ramp-up time (default: 10)
}
```

## Node Requirements

Để export được k6 script, diagram cần có ít nhất 1 node với:

```typescript
{
  data: {
    category: 'Entry Point' | 'Traffic Manager',
    specs: {
      maxThroughput: number,  // RPS
      latencyBase: number,    // Base latency (ms)
    },
    props: {
      httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      endpoint?: string,
      headers?: Record<string, string>,
      requestBody?: any,
    }
  }
}
```

## Example Output

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const options = {
  vus: 150,
  duration: "60s",
  thresholds: {
    http_req_duration: ["p(95)<50"],
    http_req_failed: ["rate<0.01"],
    http_reqs: ["rate>=900"]
  }
};

export default function () {
  // Test logic
}
```

## Testing

```bash
# Run unit tests
npm test exportK6.test.ts

# Run manual test
npm run test:manual exportK6.manual-test.ts
```

## Integration

Integrated in:
- `pages/EditorPage.tsx` - Export handler
- `components/Header.tsx` - Export button UI
- `App.tsx` - Handler propagation

## Documentation

See [K6_EXPORT_FEATURE.md](../../../docs/K6_EXPORT_FEATURE.md) for detailed documentation.
