# k6 Load Test Export Feature

## Tổng quan

Tính năng **Export to k6** cho phép bạn tự động sinh ra mã k6 JavaScript để thực hiện load testing dựa trên kiến trúc hệ thống bạn đã thiết kế.

## Cách hoạt động

### 1. Phát hiện Entry Points
- Hệ thống duyệt qua tất cả các nodes trong diagram
- Chỉ xử lý các node có category là:
  - `Entry Point`: Điểm vào của hệ thống (user requests, external APIs)
  - `Traffic Manager`: API Gateway, Load Balancer

### 2. Trích xuất thông số
Từ mỗi Entry Point, hệ thống lấy:
- **RPS (Requests Per Second)**: `node.data.specs.maxThroughput`
- **P95 Latency**: `node.data.simulation.processingTimeMs` hoặc `node.data.specs.latencyBase`
- **HTTP Method**: `node.data.props.httpMethod` (GET, POST, PUT, DELETE, PATCH)
- **Endpoint URL**: `node.data.props.endpoint`
- **Headers**: `node.data.props.headers`
- **Request Body**: `node.data.props.requestBody` (cho POST/PUT/PATCH)

### 3. Tính toán k6 Configuration

#### Virtual Users (VUs)
Sử dụng Little's Law để tính số VUs cần thiết:
```
VUs = RPS × (P95 Latency / 1000) × 1.5 (buffer)
```

Ví dụ:
- RPS = 1000
- P95 Latency = 100ms
- VUs = 1000 × 0.1 × 1.5 = **150 VUs**

#### Thresholds
- **P95 Response Time**: `p(95) < [targetP95]ms`
- **Error Rate**: `rate < 1%`
- **Request Rate**: `rate >= 90% của target RPS`

#### Duration
- Default: 60 giây
- Có thể tùy chỉnh qua `K6ExportOptions.durationSeconds`

### 4. Sinh mã k6 Script

Output là một file JavaScript hoàn chỉnh với:
- ✅ Import k6 modules (http, check, sleep, metrics)
- ✅ Options configuration (VUs, duration, thresholds)
- ✅ Custom metrics (error rate, success rate, custom latency)
- ✅ Weighted endpoint selection (nếu có nhiều endpoints)
- ✅ Variable replacement ({{$randomInt}}, {{$timestamp}}, {{$uuid}})
- ✅ Setup và Teardown functions
- ✅ Default test function với error handling

## Cách sử dụng

### Trong UI

1. **Thiết kế Diagram**
   - Thêm các node `Entry Point` hoặc `Traffic Manager`
   - Cấu hình **Performance Specs** trong Property Panel:
     - Max Throughput (RPS)
     - Latency Base (ms)
   - Cấu hình **Technical Configuration**:
     - HTTP Method
     - Endpoint URL
     - Headers (optional)
     - Request Body (optional)

2. **Export k6 Script**
   - Click nút **Export** trên Header
   - Chọn **Export k6 Load Test**
   - File `load-test.js` sẽ được download

3. **Chạy k6 Test**
   ```bash
   # Install k6 (nếu chưa có)
   brew install k6  # macOS
   choco install k6 # Windows
   
   # Run test
   k6 run load-test.js
   
   # Run với custom options
   k6 run --vus 100 --duration 120s load-test.js
   ```

### Programmatically

```typescript
import { exportToK6, downloadK6Script } from './utils/exportK6';

// Basic export
const script = exportToK6({ nodes, edges });
downloadK6Script(script, 'my-load-test.js');

// Export với custom options
const customScript = exportToK6({ nodes, edges }, {
  targetRPS: 500,
  targetP95Ms: 200,
  durationSeconds: 120,
  vus: 50,
  rampUpSeconds: 20,
});
downloadK6Script(customScript, 'custom-test.js');
```

## Output Script Example

```javascript
/**
 * k6 Load Test Script
 * Generated from: Architecture Diagram
 * Generated at: 2026-01-15T10:00:00.000Z
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const customLatency = new Trend('custom_latency');

// Test configuration
export const options = {
  "vus": 150,
  "duration": "60s",
  "thresholds": {
    "http_req_duration": ["p(95)<100"],
    "http_req_failed": ["rate<0.01"],
    "http_reqs": ["rate>=900"]
  }
};

// Test endpoints with weights
const endpoints = [
  {
    "id": "entry-1",
    "name": "User Requests",
    "method": "GET",
    "url": "https://api.myapp.com/users",
    "headers": { "Content-Type": "application/json" },
    "weight": 1000
  },
  {
    "id": "gateway-1",
    "name": "API Gateway",
    "method": "POST",
    "url": "https://gateway.myapp.com/api/v1/process",
    "headers": {
      "Authorization": "Bearer token",
      "Content-Type": "application/json"
    },
    "body": {
      "action": "{{$randomInt}}",
      "timestamp": "{{$timestamp}}"
    },
    "weight": 5000
  }
];

export default function () {
  // Weighted random endpoint selection
  const rand = Math.random() * 6000;
  let cumWeight = 0;
  let endpoint = endpoints[0];
  
  for (const ep of endpoints) {
    cumWeight += ep.weight;
    if (rand <= cumWeight) {
      endpoint = ep;
      break;
    }
  }
  
  // Prepare request
  const params = {
    headers: endpoint.headers || {},
    timeout: '30s',
    tags: { 
      endpoint: endpoint.name,
      method: endpoint.method 
    },
  };
  
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
    default:
      response = http.get(endpoint.url, params);
  }
  
  const duration = Date.now() - startTime;
  customLatency.add(duration);
  
  // Assertions
  const success = check(response, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time OK': (r) => r.timings.duration < 100,
    'has response body': (r) => r.body && r.body.length > 0,
  });
  
  errorRate.add(!success);
  successRate.add(success);
  
  // Think time
  sleep(Math.random() * 2 + 1);
}
```

## K6ExportOptions API

```typescript
interface K6ExportOptions {
  targetRPS?: number;           // Override RPS (default: từ node specs)
  targetP95Ms?: number;         // Override P95 target (default: từ simulation)
  durationSeconds?: number;     // Test duration (default: 60s)
  vus?: number;                 // Virtual Users (default: auto-calculate)
  rampUpSeconds?: number;       // Ramp-up time (default: 10s)
}
```

## Template Variables

Script hỗ trợ các biến động:
- `{{$randomInt}}`: Random integer (0-999999)
- `{{$timestamp}}`: Current timestamp (milliseconds)
- `{{$uuid}}`: Random UUID v4

Các biến này sẽ được thay thế trong runtime của k6.

## Best Practices

### 1. Cấu hình Entry Points chính xác
```typescript
// ✅ Good
{
  category: "Entry Point",
  specs: {
    maxThroughput: 1000,  // RPS thực tế
    latencyBase: 50,      // P95 latency
  },
  props: {
    httpMethod: "GET",
    endpoint: "https://api.example.com/users"
  }
}

// ❌ Bad - thiếu thông tin
{
  category: "Entry Point",
  // No specs, no props
}
```

### 2. Sử dụng Simulation trước khi Export
- Chạy **Simulate Flow** để có được P95 latency chính xác
- System sẽ sử dụng kết quả simulation để tính VUs tốt hơn

### 3. Test dần dần
```bash
# Stage 1: Small load
k6 run --vus 10 --duration 30s load-test.js

# Stage 2: Medium load
k6 run --vus 50 --duration 60s load-test.js

# Stage 3: Full load
k6 run load-test.js  # Use default VUs
```

### 4. Monitor kết quả
```bash
# Output to JSON
k6 run --out json=test-results.json load-test.js

# Send to Grafana k6 Cloud
k6 cloud load-test.js
```

## Troubleshooting

### Error: "No Entry Point or API Gateway nodes found"
**Nguyên nhân**: Diagram không có node nào có category là `Entry Point` hoặc `Traffic Manager`

**Giải pháp**: 
- Thêm ít nhất 1 node Entry Point
- Đảm bảo node.data.category đúng format

### Script bị lỗi syntax
**Nguyên nhân**: Request body có format JSON không hợp lệ

**Giải pháp**:
- Kiểm tra props.requestBody phải là valid JSON object
- Sử dụng template variables cho dynamic data

### VUs quá cao/thấp
**Nguyên nhân**: Sai ước lượng RPS hoặc latency

**Giải pháp**:
- Override bằng `K6ExportOptions.vus`
- Điều chỉnh specs.maxThroughput và specs.latencyBase

## Testing

Chạy unit tests:
```bash
npm test exportK6.test.ts
```

Test với sample diagram:
```typescript
import sampleDiagram from './mock-data/k6-test-diagram.json';
const script = exportToK6(sampleDiagram);
```

## Future Enhancements

- [ ] Export to Grafana k6 Cloud API
- [ ] Multi-scenario support (ramp-up, stress, spike)
- [ ] Data-driven testing (CSV/JSON input)
- [ ] Custom assertions editor
- [ ] WebSocket protocol support
- [ ] Authentication templates (OAuth2, JWT)

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 HTTP Requests](https://k6.io/docs/using-k6/http-requests/)
- [k6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [Little's Law](https://en.wikipedia.org/wiki/Little%27s_law)
