# Data Structure Architecture: Diagram → Scenario → JSON Models

## 📊 Database Layer (Entities)

```
┌─────────────────────────────────────┐
│         Diagram (Entity)            │
│─────────────────────────────────────│
│ • Id: Guid (PK)                     │
│ • Name: string                      │
│ • Description: string?              │
│ • UserId: Guid?                     │
│ • CreatedBy: string?                │
│ • CreatedAt: DateTime               │
│ • UpdatedAt: DateTime               │
│                                     │
│ Navigation:                         │
│ • Scenarios: ICollection<Scenario>  │
└─────────────────────────────────────┘
            │ 1
            │
            │ N
            ▼
┌─────────────────────────────────────┐
│        Scenario (Entity)            │
│─────────────────────────────────────│
│ • Id: Guid (PK)                     │
│ • DiagramId: Guid (FK)              │
│ • ParentScenarioId: Guid?           │
│ • Name: string                      │
│ • VersionTag: string                │
│ • ChangeLog: string                 │
│ • IsSnapshot: bool                  │
│ • CreatedAt: DateTime               │
│ • UpdatedAt: DateTime               │
│                                     │
│ ** ContentJson: string **           │ ← Lưu DiagramContent as JSON
│    (DiagramContent serialized)      │
│                                     │
│ Navigation:                         │
│ • Diagram: Diagram?                 │
└─────────────────────────────────────┘
```

---

## 🎯 Domain Models Layer (Backend C#)

### ContentJson Structure
```json
// Scenario.ContentJson chứa DiagramContent
{
  "nodes": [
    {
      "id": "node_1",
      "type": "customNode",
      "metadata": {
        "label": "API Gateway",
        "category": "trafficManager",
        "specs": {
          "latencyBase": 10,
          "maxThroughput": 5000,
          "reliability": 0.999
        },
        "technologies": ["NGINX", "Kong"],
        "provider": "aws",
        "logic": {
          "canReceiveFrom": ["client", "loadBalancer"],
          "canSendTo": ["microservice", "database"]
        },
        "props": {
          "instanceCount": 3,
          "isClustered": true,
          "region": "us-east-1"
        },
        "simulation": {
          "processingTimeMs": 5,
          "failureRate": 0.001,
          "currentLoad": 0.65
        }
      },
      "position": {
        "x": 250,
        "y": 100
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1_2",
      "source": "node_1",
      "target": "node_2",
      "label": "HTTPS/JSON",
      "data": {
        "protocol": "https",
        "auth": "JWT",
        "trafficWeight": 1.0,
        "networkLatency": 15
      }
    }
  ]
}
```

### Backend Models Hierarchy

```
DiagramContent (Record)
├── Nodes: List<SystemNode>
└── Edges: List<EdgeModel>

SystemNode (Record)
├── Id: string
├── Type: string
├── Position: Position? (record)
│   ├── X: double
│   └── Y: double
└── Metadata: NodeMetadata (record)
    ├── Label: string
    ├── Category: NodeCategory (enum)
    ├── Specs: NodeSpecs (record)
    │   ├── LatencyBase: double
    │   ├── MaxThroughput: int
    │   └── Reliability: double
    ├── Technologies: List<string>?
    ├── Provider: string?
    ├── Logic: NodeLogic? (record)
    │   ├── CanReceiveFrom: List<string>
    │   └── CanSendTo: List<string>
    ├── Props: TechnicalProps? (record)
    │   ├── InstanceCount: int?
    │   ├── IsClustered: bool?
    │   ├── BackupPolicy: string?
    │   ├── Region: string?
    │   └── AdditionalProps: Dictionary<string, object>?
    └── Simulation: SimulationProps? (record)
        ├── ProcessingTimeMs: double
        ├── FailureRate: double
        ├── QueueSize: int?
        └── CurrentLoad: double?

EdgeModel (Record)
├── Id: string
├── Source: string
├── Target: string
├── Label: string?
└── Data: EdgeData? (record)
    ├── Protocol: string
    ├── Auth: string?
    ├── TrafficWeight: double
    └── NetworkLatency: double
```

---

## 🌐 API Response Model

```
SystemDiagram (Record) - API Response
├── Metadata: DiagramMetadata (record)
│   ├── Id: string
│   ├── Name: string
│   ├── Description: string?
│   ├── CreatedAt: DateTime
│   ├── UpdatedAt: DateTime
│   ├── Version: int
│   ├── CreatedBy: string?
│   └── Tags: List<string>?
├── Nodes: List<SystemNode>
└── Edges: List<EdgeModel>
```

---

## 🎨 Frontend Models (TypeScript)

### Frontend Models Hierarchy

```typescript
SystemDiagram (interface)
├── metadata: DiagramMetadata
│   ├── id: string
│   ├── name: string
│   ├── description?: string
│   ├── createdAt: string (ISO 8601)
│   ├── updatedAt: string
│   ├── version: number
│   ├── createdBy?: string
│   └── tags?: string[]
├── nodes: SystemNode[]
└── edges: SystemEdge[]

SystemNode (type = ReactFlowNode & {...})
├── id: string
├── type: string
├── position: { x: number, y: number }
└── data: CustomNodeData
    ├── category: NodeCategory (enum)
    ├── technologies?: string[]
    ├── props?: TechnicalProps
    │   ├── instanceCount?: number
    │   ├── isClustered?: boolean
    │   ├── backupPolicy?: string
    │   ├── region?: string
    │   └── [key: string]: any
    ├── simulation?: SimulationProps
    │   ├── processingTimeMs: number
    │   ├── failureRate: number
    │   ├── queueSize?: number
    │   └── currentLoad?: number
    ├── iconName?: string
    ├── status?: 'healthy' | 'warning' | 'error' | 'idle'
    └── isSimulating?: boolean

SystemEdge (type = ReactFlowEdge & {...})
├── id: string
├── source: string
├── target: string
├── label?: string
└── data?: EdgeData
    ├── protocol: string
    ├── auth?: string
    ├── trafficWeight?: number
    └── networkLatency?: number
```

---

## 🔄 Data Flow: Database → API → Frontend

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ Diagram Entity                                                 │
│ ├── Id: Guid                                                   │
│ ├── Name: "E-Commerce System"                                 │
│ └── Scenarios: [                                               │
│     {                                                          │
│       Id: Guid,                                                │
│       Name: "v1.0 - Initial Design",                           │
│       VersionTag: "1.0.0",                                     │
│       ContentJson: "<DiagramContent JSON>"  ← Stored as string │
│     }                                                          │
│   ]                                                            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                    1. Deserialize ContentJson
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ DiagramContent (C# Record)                                     │
│ ├── Nodes: List<SystemNode>                                   │
│ └── Edges: List<EdgeModel>                                    │
└────────────────────────────────────────────────────────────────┘
                              │
                    2. Build SystemDiagram
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ SystemDiagram (C# Record)                                      │
│ ├── Metadata: DiagramMetadata (from Diagram + Scenario)       │
│ ├── Nodes: List<SystemNode> (from ContentJson)                │
│ └── Edges: List<EdgeModel> (from ContentJson)                 │
└────────────────────────────────────────────────────────────────┘
                              │
                    3. Serialize with JsonConfig
                       (camelCase, enums as strings)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API RESPONSE                            │
└─────────────────────────────────────────────────────────────────┘
```json
{
  "metadata": {
    "id": "guid",
    "name": "E-Commerce System",
    "version": 1,
    "createdAt": "2025-12-26T10:00:00Z",
    "updatedAt": "2025-12-26T10:00:00Z"
  },
  "nodes": [...],
  "edges": [...]
}
```
                              │
                    4. HTTP Response
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                    5. TypeScript Interface
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ SystemDiagram (TypeScript)                                     │
│ ├── metadata: DiagramMetadata                                  │
│ ├── nodes: SystemNode[] (ReactFlow compatible)                │
│ └── edges: SystemEdge[] (ReactFlow compatible)                │
└────────────────────────────────────────────────────────────────┘
                              │
                    6. React Flow Rendering
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      REACT FLOW CANVAS                         │
│  ┌──────┐         ┌──────┐         ┌──────┐                   │
│  │ Node │────────▶│ Node │────────▶│ Node │                   │
│  └──────┘         └──────┘         └──────┘                   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Example

### Backend Service
```csharp
using System.Text.Json;
using SystemDesign.Domain.Models;
using SystemDesign.Domain.Configuration;

public class DiagramService
{
    public async Task<SystemDiagram> GetDiagramAsync(Guid diagramId, Guid scenarioId)
    {
        // 1. Load from DB
        var diagram = await _dbContext.Diagrams
            .Include(d => d.Scenarios)
            .FirstAsync(d => d.Id == diagramId);
            
        var scenario = diagram.Scenarios.First(s => s.Id == scenarioId);
        
        // 2. Deserialize ContentJson
        var content = JsonSerializer.Deserialize<DiagramContent>(
            scenario.ContentJson, 
            JsonConfig.DefaultOptions
        );
        
        // 3. Build SystemDiagram with metadata
        return new SystemDiagram(
            Metadata: new DiagramMetadata(
                Id: diagram.Id.ToString(),
                Name: diagram.Name,
                Description: diagram.Description,
                CreatedAt: diagram.CreatedAt,
                UpdatedAt: diagram.UpdatedAt,
                Version: int.Parse(scenario.VersionTag.Split('.')[0]),
                CreatedBy: diagram.CreatedBy,
                Tags: null
            ),
            Nodes: content.Nodes,
            Edges: content.Edges
        );
    }
    
    public async Task SaveDiagramAsync(Guid scenarioId, DiagramContent content)
    {
        // 1. Serialize DiagramContent only (không có metadata)
        var json = JsonSerializer.Serialize(content, JsonConfig.CompactOptions);
        
        // 2. Save to DB
        var scenario = await _dbContext.Scenarios.FindAsync(scenarioId);
        scenario.ContentJson = json;
        
        await _dbContext.SaveChangesAsync();
    }
}
```

### Frontend Usage
```typescript
import { SystemDiagram, SystemNode, SystemEdge } from './diagram.schema';

async function loadDiagram(diagramId: string, scenarioId: string) {
  const response = await fetch(`/api/diagrams/${diagramId}/scenarios/${scenarioId}`);
  const diagram: SystemDiagram = await response.json();
  
  // Use with React Flow
  const { nodes, edges } = diagram;
  
  return { nodes, edges };
}
```

---

## 📋 Key Points

1. **Separation of Concerns**:
   - `DiagramContent` = Pure data (nodes + edges) → Lưu DB
   - `SystemDiagram` = Data + Metadata → API Response

2. **Type Safety**:
   - Backend: Strongly typed C# records
   - Frontend: TypeScript interfaces matching backend

3. **JSON Serialization**:
   - Backend: PascalCase (C# convention)
   - JSON Wire: camelCase (via JsonConfig)
   - Frontend: camelCase (TypeScript convention)

4. **React Flow Integration**:
   - SystemNode extends ReactFlowNode
   - SystemEdge extends ReactFlowEdge
   - Compatible với React Flow library

5. **Versioning**:
   - Diagram: 1-N Scenarios
   - Mỗi Scenario có VersionTag
   - ParentScenarioId tạo version tree
