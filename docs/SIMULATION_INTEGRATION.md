# Simulation Integration Documentation

## Overview
Tích hợp SimulationEngine (backend) với EditorPage (frontend) để tính toán latency và lưu run history.

## Architecture Flow

```
User clicks "Simulate" button in Header
          ↓
EditorPage.handleSimulate()
          ↓
1. Convert diagram (nodes/edges) → SimulationRequest
          ↓
2. useSimulation.runSimulation()
          ↓
3. simulationApi.analyze() → POST /api/simulation/analyze
          ↓
4. scenarioApi.getByDiagram() or create() → Get/Create Scenario
          ↓
5. runApi.create() → POST /api/runs (Start Run)
          ↓
6. runApi.updateStatus() → PATCH /api/runs/{id}/status (Complete Run)
          ↓
7. Display toast with results (critical path, avg latency)
```

## Key Components

### 1. Frontend Services

**simulation.service.ts** - API client cho SimulationEndpoints
- `calculateLongestPaths()` - Tính longest paths từ entry points
- `calculateFromNode()` - Tính từ node cụ thể
- `analyze()` - Phân tích toàn bộ system (critical path, statistics)

**run.service.ts** - API client cho RunEndpoints
- `create()` - Tạo run mới (bắt đầu simulation)
- `getByScenario()` - Lấy lịch sử runs
- `updateStatus()` - Cập nhật kết quả simulation

### 2. Custom Hook: useSimulation

**Purpose:** Orchestrate simulation flow and state management

**Features:**
- Convert diagram data to SimulationRequest format
- Call SimulationEngine API to analyze
- Auto-create Scenario if not exists
- Create Run record to track history
- Update Run with results
- Error handling with toast notifications

### 3. Data Transformation

**Diagram → SimulationRequest:**

```typescript
// Nodes
const simulationNodes: SimulationNode[] = nodes.map(node => ({
  id: node.id,
  type: node.data.label || 'Unknown',
  latencyMs: node.data.latency || 10,  // Default 10ms
  isEntryPoint: node.data.isEntryPoint || node.data.nodeCategory === 'entry'
}));

// Edges
const simulationEdges: SimulationEdge[] = edges.map(edge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  latencyMs: edge.data?.latency || 5  // Default 5ms network latency
}));
```

### 4. EditorPage Integration

**New Props:**
- `onToggleSimulate: () => void` - Toggle visual simulation state

**New State:**
- `simulationResult: AnalyzeResponse | null` - Latest simulation results

**New Handler:**
- `handleSimulate()` - Main simulation orchestrator
  1. Check if stopping or starting
  2. Build SimulationRequest
  3. Start visual animation (onToggleSimulate)
  4. Call backend APIs
  5. Display results

### 5. Header Button Enhancement

**Button behavior:**
- Normal click: Toggle visual simulation only
- Enhanced click: Call `window.__handleSimulate()` (EditorPage exposes this)
  - Triggers full backend simulation + visual animation
  - Saves run history to database

## Backend Endpoints Used

### SimulationEndpoints
- `POST /api/simulation/analyze` - Main endpoint
  - Returns: critical path, statistics, all paths

### RunEndpoints
- `POST /api/runs` - Create new run
- `PATCH /api/runs/{id}/status` - Update with results

### ScenarioEndpoints
- `GET /api/diagrams/{id}/scenarios` - Get scenarios
- `POST /api/diagrams/{id}/scenarios` - Create baseline scenario

## Database Records Created

**Run Table:**
```json
{
  "id": "guid",
  "scenarioId": "guid",
  "runName": "Simulation 12/29/2025 3:45 PM",
  "status": "Completed",
  "averageLatencyMs": 85.5,
  "successfulRequests": 3,  // Total paths
  "resultJson": "{...}"  // Full AnalyzeResponse
}
```

## User Experience

1. User clicks **"Simulate Flow"** button
2. Toast: "Analyzing system architecture..."
3. Visual animation starts (nodes pulsing)
4. Backend calculates critical path
5. Toast: "Critical path: 135.5ms | Avg: 85.2ms"
6. Run saved to database
7. User can view history in version control

## Error Handling

- Network errors → Toast notification
- Invalid diagram → Toast + stop animation
- Missing scenario → Auto-create baseline
- Run creation fails → Log warning, continue with results

## Future Enhancements

- [ ] Real-time simulation progress
- [ ] Compare runs side-by-side
- [ ] Export simulation reports
- [ ] Bottleneck detection and highlighting
- [ ] Performance recommendations
