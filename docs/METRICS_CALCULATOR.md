# MetricsCalculator Service

## Tổng quan

`MetricsCalculatorService` là một service tính toán các chỉ số KPI (Key Performance Indicators) cho hệ thống dựa trên cấu hình nodes và edges trong diagram. Service này cung cấp hai chức năng chính:

1. **Calculate Metrics**: Tính toán các chỉ số hiện tại dựa trên diagram
2. **What-if Analysis**: Phân tích giả định khi thay đổi cấu hình (ví dụ: tăng số lượng instances)

## Kiến trúc

```
Domain Layer:
├── Models/SystemMetrics.cs          # Record chứa kết quả metrics
├── Models/NodePricingConfig.cs      # Cấu hình giá cho các node types
└── IMetricsCalculatorService.cs     # Interface của service

Application Layer:
└── Services/MetricsCalculatorService.cs  # Implementation logic

API Layer:
└── Endpoints/MetricsEndpoints.cs    # REST API endpoints
```

## SystemMetrics Model

```csharp
public record SystemMetrics(
    decimal MonthlyCost,              // Tổng chi phí hàng tháng (USD)
    double OverallErrorRate,          // Tỷ lệ lỗi trung bình (0.0 - 1.0)
    int HealthScore,                  // Điểm sức khỏe hệ thống (0-100)
    string EfficiencyRating,          // Đánh giá hiệu suất: "Excellent", "High Efficiency", "Medium Efficiency", "Needs Optimization"
    double AvailabilityPercentage,    // % Uptime (0-100)
    Dictionary<string, decimal>? CostBreakdown,  // Chi phí theo từng category
    List<string>? Bottlenecks         // Danh sách các điểm nghẽn
);
```

## Pricing Model

Service sử dụng bảng giá cơ sở cho từng loại node:

| Category | Base Price (USD/month) | Price per Instance (USD/month) |
|----------|------------------------|--------------------------------|
| EntryPoint | $50 | $30 |
| TrafficManager | $100 | $50 |
| Compute | $150 | $100 |
| Storage | $200 | $80 |
| Middleware | $80 | $40 |

**Công thức tính chi phí:**
```
Node Cost = Base Price + (Price per Instance × Instance Count)
Total Cost = Σ (Cost of all nodes)
```

## Các chỉ số tính toán

### 1. Monthly Cost
- Tính tổng chi phí dựa trên loại node và số lượng instances
- Cung cấp breakdown theo category để phân tích chi tiết

### 2. Overall Error Rate
- Tính trung bình có trọng số dựa trên:
  - Failure rate của từng node
  - Số lượng instances (nhiều instances = error rate thấp hơn nhờ redundancy)
- **Công thức:** 
  ```
  Adjusted Failure Rate = FailureRate / √(InstanceCount)
  Overall Error Rate = Σ(Adjusted FR × InstanceCount) / Σ(InstanceCount)
  ```

### 3. Health Score (0-100)
Bắt đầu từ 100 điểm, trừ/cộng dựa trên:

**Trừ điểm:**
- Error rate: `-errorRate × 400` (tối đa -40 điểm)
- Bottlenecks: `-10 điểm/bottleneck`

**Cộng điểm:**
- Clustered nodes: `+2 điểm/node`
- Redundant instances: `+3 điểm/node` (có >1 instance)

### 4. Bottleneck Detection

Service tự động phát hiện các vấn đề:

1. **Too many connections**: Node có >5 incoming edges (single point of failure)
2. **High failure without redundancy**: Single instance với failure rate >5%
3. **No backup policy**: Storage nodes không có backup policy

### 5. Availability Percentage
- Tính dựa trên reliability của từng node
- Sử dụng parallel redundancy model cho multiple instances
- **Công thức:**
  ```
  Node Availability = 1 - (1 - Reliability)^InstanceCount
  System Availability = Π(All Node Availabilities) × 100%
  ```

### 6. Efficiency Rating

| Health Score | Error Rate | Rating |
|--------------|------------|--------|
| ≥85 | <1% | Excellent |
| ≥70 | <3% | High Efficiency |
| ≥50 | <5% | Medium Efficiency |
| <50 or ≥5% | - | Needs Optimization |

## API Endpoints

### 1. Calculate Metrics

**Endpoint:** `POST /api/metrics/calculate`

**Request Body:** Toàn bộ `DiagramContent` object

**Response:**
```json
{
  "monthlyCost": 1240.00,
  "overallErrorRate": 0.0042,
  "healthScore": 91,
  "efficiencyRating": "Excellent",
  "availabilityPercentage": 99.87,
  "costBreakdown": {
    "EntryPoint": 110.00,
    "Compute": 450.00,
    "Storage": 560.00,
    "Middleware": 120.00
  },
  "bottlenecks": []
}
```

### 2. What-if Analysis

**Endpoint:** `POST /api/metrics/what-if`

**Request Body:**
```json
{
  "diagramContent": { /* Full diagram */ },
  "nodeId": "node-2",
  "newInstanceCount": 5
}
```

**Response:** Same as Calculate Metrics

**Use Case:** Khi user kéo slider tăng instance count từ 3 lên 5, frontend gọi endpoint này để xem:
- Cost tăng bao nhiêu?
- Error rate giảm bao nhiêu?
- Health score cải thiện như thế nào?

## Frontend Integration

### KPI Cards Components

```tsx
// 1. Cost Card
<KpiCard 
  title="Monthly Cost"
  value={`$${metrics.monthlyCost.toFixed(2)}`}
  icon="💰"
  status={metrics.monthlyCost > budget ? "warning" : "success"}
  breakdown={metrics.costBreakdown}
/>

// 2. Availability Card
<KpiCard
  title="Availability"
  value={`${metrics.availabilityPercentage.toFixed(2)}%`}
  icon="⚡"
  status={metrics.availabilityPercentage > 99.9 ? "success" : "warning"}
/>

// 3. Health Score Gauge
<GaugeChart
  value={metrics.healthScore}
  max={100}
  label="System Health"
  color={getColorByScore(metrics.healthScore)}
/>

// 4. Efficiency Badge
<Badge 
  text={metrics.efficiencyRating}
  variant={getRatingVariant(metrics.efficiencyRating)}
/>
```

### Real-time What-if Analysis

```tsx
const handleInstanceCountChange = async (nodeId: string, newCount: number) => {
  // Gọi What-if API
  const response = await fetch('/api/metrics/what-if', {
    method: 'POST',
    body: JSON.stringify({
      diagramContent: currentDiagram,
      nodeId,
      newInstanceCount: newCount
    })
  });
  
  const newMetrics = await response.json();
  
  // Update KPI Dashboard ngay lập tức
  setMetrics(newMetrics);
  
  // Hiển thị diff để user thấy impact
  showImpactDiff(oldMetrics, newMetrics);
};
```

### Impact Visualization

```tsx
interface MetricsDiff {
  costDelta: number;          // +$200
  errorRateDelta: number;     // -0.002 (giảm 0.2%)
  healthScoreDelta: number;   // +5 điểm
}

<ImpactPanel>
  <MetricChange 
    label="Cost Impact"
    value={`+$${diff.costDelta}`}
    trend="up"
    color="orange"
  />
  <MetricChange 
    label="Error Rate"
    value={`${(diff.errorRateDelta * 100).toFixed(2)}%`}
    trend="down"
    color="green"
  />
  <MetricChange 
    label="Health Score"
    value={`+${diff.healthScoreDelta}`}
    trend="up"
    color="green"
  />
</ImpactPanel>
```

## Testing

Test file đã được tạo: `metrics-tests.http`

**Test Scenarios:**
1. ✅ Simple e-commerce system (healthy configuration)
2. ✅ What-if analysis (increase web server instances)
3. ✅ Unstable system (should show low health score and bottlenecks)

## Use Cases

### 1. Dashboard Overview
- Hiển thị tổng quan về chi phí và hiệu suất hệ thống
- Real-time update khi user thay đổi diagram

### 2. Cost Optimization
- Xem breakdown chi phí theo category
- Tìm các node tốn kém nhất
- So sánh giữa các phương án architecture

### 3. Reliability Analysis
- Phát hiện single points of failure
- Đánh giá tác động của redundancy
- Xác định các bottlenecks cần xử lý

### 4. What-if Planning
- "Nếu tôi thêm 2 instances vào Web Server thì sao?"
- "Nếu tôi thêm Cache layer thì giảm được bao nhiêu latency?"
- "Upgrade lên clustered DB tốn thêm bao nhiêu?"

## Best Practices

### Backend
1. **Service là stateless**: Không lưu state, tất cả input qua parameters
2. **Validation**: Kiểm tra null/empty nodes trước khi tính toán
3. **Extensibility**: Dễ dàng thêm pricing configs mới
4. **Performance**: Sử dụng LINQ hiệu quả, tránh nested loops

### Frontend
1. **Debouncing**: Khi user kéo slider, debounce API calls
2. **Caching**: Cache metrics cho cùng một diagram configuration
3. **Loading States**: Hiển thị skeleton khi đang tính toán
4. **Error Handling**: Hiển thị friendly message khi API fails

## Mở rộng trong tương lai

### 1. Advanced Pricing
- Regional pricing differences
- Reserved instances discounts
- Volume discounts

### 2. Machine Learning
- Dự đoán cost trends
- Anomaly detection cho unusual patterns
- Recommendation system cho optimization

### 3. Historical Analytics
- So sánh metrics theo thời gian
- Track optimization improvements
- Cost projection

### 4. Custom Metrics
- Cho phép users định nghĩa custom KPIs
- Industry-specific metrics (fintech, e-commerce, etc.)

## Dependencies

```xml
<PackageReference Include="System.Text.Json" />
<ProjectReference Include="..\SystemDesign.Domain\SystemDesign.Domain.csproj" />
<ProjectReference Include="..\SystemDesign.Application\SystemDesign.Application.csproj" />
```

## Performance Considerations

- **Time Complexity**: O(n) với n = số lượng nodes
- **Memory**: Minimal - không cache, tính toán on-the-fly
- **Scalability**: Có thể handle diagrams với 100+ nodes

---

**Created by:** System Design Playground Team  
**Version:** 1.0  
**Last Updated:** January 2026
