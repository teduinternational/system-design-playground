# Diagram Versioning Design

## Mô hình dữ liệu

### Diagram (Working Copy)
- `JsonData`: **Current working state** - Bản đang được edit
- `Version`: Version number tăng dần (1, 2, 3...)
- Mỗi lần auto-save → Update `JsonData` và tăng `Version`
- Đây là "latest unstable version"

### Scenario (Saved Snapshots)
- `ContentJson`: **Frozen snapshot** - Bản đã lưu cố định
- `VersionTag`: Semantic version (v1.0.0, v1.1.0, v2.0.0)
- `IsSnapshot`: true = read-only, false = editable branch
- `ParentScenarioId`: Tạo version tree (branching)

## Use Cases

### Use Case 1: Normal Editing Flow
```
1. User mở diagram
   → Frontend load Diagram.JsonData (working copy)

2. User edit nodes/edges
   → Auto-save vào Diagram.JsonData mỗi X giây
   → Diagram.Version tăng dần (internal counter)

3. User muốn lưu milestone
   → Click "Save Version" button
   → Tạo Scenario mới từ Diagram.JsonData
   → Scenario.ContentJson = snapshot of current state
   → Scenario.VersionTag = "v1.0.0" (user input)
```

### Use Case 2: Load Previous Version
```
1. User vào "Version History" tab
   → List tất cả Scenarios của Diagram

2. User click "View v1.0.0"
   → Load Scenario.ContentJson vào canvas (read-only mode)

3. User click "Restore v1.0.0"
   → Copy Scenario.ContentJson → Diagram.JsonData
   → Continue editing từ version đó
```

### Use Case 3: Version Branching
```
1. User đang ở version v1.0.0
2. User click "Create Branch"
   → Tạo Scenario mới với ParentScenarioId = v1.0.0
   → User edit branch này độc lập
3. Kết quả: Version tree
   v1.0.0
   ├─ v1.1.0 (main branch)
   └─ v1.0.1-experimental (feature branch)
```

## API Design

### Create Scenario (Save Version)
```typescript
POST /api/diagrams/{diagramId}/scenarios
{
  "name": "Added payment gateway",
  "versionTag": "v1.1.0",
  "contentJson": "{...}", // Copy from Diagram.JsonData
  "changeLog": "Integrated Stripe payment processing",
  "parentScenarioId": "...", // Optional: parent version
  "isSnapshot": true // true = freeze, false = editable
}
```

### Get All Scenarios (Version History)
```typescript
GET /api/diagrams/{diagramId}/scenarios
// Returns: List<ScenarioDto> sorted by CreatedAt
```

### Restore Scenario to Working Copy
```typescript
PUT /api/diagrams/{diagramId}
{
  "name": "...",
  "description": "...",
  "jsonData": "{...}" // Copy from Scenario.ContentJson
}
```

## Frontend Implementation

### 1. Version History Component
```tsx
// components/VersionHistory.tsx
export const VersionHistory: React.FC<{ diagramId: string }> = ({ diagramId }) => {
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  
  useEffect(() => {
    scenarioApi.getByDiagram(diagramId).then(setScenarios);
  }, [diagramId]);
  
  const handleRestore = async (scenario: ScenarioDto) => {
    // Copy scenario content back to diagram
    await diagramApi.update(diagramId, {
      name: diagram.name,
      jsonData: scenario.contentJson
    });
    // Reload canvas
    loadDiagramFromApi(diagramId);
  };
  
  return (
    <div>
      {scenarios.map(scenario => (
        <div key={scenario.id}>
          <h3>{scenario.versionTag} - {scenario.name}</h3>
          <p>{scenario.changeLog}</p>
          <button onClick={() => handleRestore(scenario)}>Restore</button>
        </div>
      ))}
    </div>
  );
};
```

### 2. Save Version Button
```tsx
// In Header or Toolbar
const handleSaveVersion = async () => {
  const versionTag = prompt('Enter version tag (e.g., v1.1.0):');
  const changeLog = prompt('Describe changes:');
  
  if (!versionTag || !diagramId) return;
  
  const diagram = serializeDiagram();
  
  await scenarioApi.create(diagramId, {
    name: `Version ${versionTag}`,
    versionTag,
    contentJson: JSON.stringify(diagram),
    changeLog: changeLog || '',
    isSnapshot: true
  });
  
  alert('Version saved successfully!');
};
```

## Database Queries

### Get Latest Working Copy
```sql
SELECT JsonData, Version 
FROM Diagrams 
WHERE Id = @diagramId AND IsDeleted = false
```

### Get Version History
```sql
SELECT * 
FROM Scenarios 
WHERE DiagramId = @diagramId 
ORDER BY CreatedAt DESC
```

### Get Version Tree (with hierarchy)
```sql
WITH RECURSIVE VersionTree AS (
  -- Root versions (no parent)
  SELECT *, 0 as Level
  FROM Scenarios
  WHERE ParentScenarioId IS NULL AND DiagramId = @diagramId
  
  UNION ALL
  
  -- Child versions
  SELECT s.*, vt.Level + 1
  FROM Scenarios s
  JOIN VersionTree vt ON s.ParentScenarioId = vt.Id
)
SELECT * FROM VersionTree ORDER BY Level, CreatedAt
```

## Recommendation: Refactor Entity

### Option A: Keep current design (Recommended)
```csharp
// Diagram.cs - làm rõ purpose
public sealed class Diagram : BaseEntity
{
    // ... existing properties
    
    /// <summary>
    /// Working copy - Current state đang được edit
    /// Auto-saved frequently, not frozen
    /// </summary>
    public required string JsonData { get; set; }
    
    /// <summary>
    /// Internal version counter (tăng mỗi lần save)
    /// Dùng cho conflict detection và optimistic locking
    /// </summary>
    public int Version { get; set; } = 1;
}
```

### Option B: Remove JsonData from Diagram (Alternative)
```csharp
// Nếu muốn mọi version đều là Scenario:
public sealed class Diagram : BaseEntity
{
    // Không có JsonData
    // Thay vào đó:
    public Guid? CurrentScenarioId { get; set; } // Point to active scenario
}

// Luôn có 1 scenario "current" cho mỗi diagram
// Scenario với IsSnapshot = false là working copy
```

## Best Practices

1. **Auto-save Working Copy**
   - Mỗi 5-10 giây → PUT /api/diagrams/{id} (update JsonData)
   - Không tạo Scenario mới

2. **Manual Save Version**
   - User click "Save Version" → POST /api/diagrams/{id}/scenarios
   - Tạo snapshot với VersionTag và ChangeLog

3. **Version Naming**
   - Follow semantic versioning: v{major}.{minor}.{patch}
   - v1.0.0: Initial release
   - v1.1.0: New features
   - v1.1.1: Bug fixes
   - v2.0.0: Breaking changes

4. **Soft Delete**
   - Không xóa Scenarios (history preservation)
   - Chỉ hide khỏi UI nếu cần

## Summary

**Diagram.JsonData** = 📝 Working copy (đang edit)
**Scenario.ContentJson** = 📸 Snapshot (đã lưu cố định)

Flow: Edit → Auto-save to JsonData → Manual "Save Version" → Create Scenario
