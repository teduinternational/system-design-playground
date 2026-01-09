# KPI Dashboard & What-if Analysis - Frontend Integration Guide

## 📦 Components Created

### 1. **KpiCard** - Reusable KPI Card Component
**File:** `components/KpiCard.tsx`

Display individual KPI metrics with status, trend, and breakdown support.

**Props:**
```typescript
{
  title: string;              // Card title
  value: string | number;     // Main value display
  icon?: React.ReactNode;     // Icon component
  status?: 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;          // Optional subtitle
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;        // Trend indicator value
  breakdown?: Record<string, number>;  // Cost breakdown data
  showBreakdown?: boolean;    // Show breakdown section
}
```

**Usage:**
```tsx
<KpiCard
  title="Monthly Cost"
  value={`$${metrics.monthlyCost.toFixed(2)}`}
  icon={<DollarSign className="w-5 h-5" />}
  status="warning"
  breakdown={metrics.costBreakdown}
  showBreakdown={true}
/>
```

---

### 2. **GaugeChart** - Circular Gauge Visualization
**File:** `components/GaugeChart.tsx`

Semi-circular gauge chart for displaying scores (0-100).

**Props:**
```typescript
{
  value: number;              // Current value
  max?: number;               // Max value (default: 100)
  min?: number;               // Min value (default: 0)
  label: string;              // Chart label
  size?: 'sm' | 'md' | 'lg';  // Size variant
  showValue?: boolean;        // Show value text
}
```

**Color Logic:**
- ≥85: Green (Excellent)
- ≥70: Blue (Good)
- ≥50: Orange (Fair)
- <50: Red (Poor)

---

### 3. **ImpactPanel** - What-if Analysis Results
**File:** `components/ImpactPanel.tsx`

Floating panel showing impact of configuration changes.

**Props:**
```typescript
{
  diff: MetricsDiff;          // Metrics differences
  isVisible: boolean;         // Show/hide panel
  onClose: () => void;        // Close handler
}
```

**MetricsDiff Interface:**
```typescript
{
  costDelta: number;          // Cost change ($)
  errorRateDelta: number;     // Error rate change (%)
  healthScoreDelta: number;   // Health score change (points)
  availabilityDelta: number;  // Availability change (%)
}
```

---

### 4. **KpiDashboard** - Complete Dashboard
**File:** `components/KpiDashboard.tsx`

Main dashboard component combining all KPI displays.

**Props:**
```typescript
{
  metrics: SystemMetrics | null;
  loading?: boolean;
  compact?: boolean;          // Compact mode for header
}
```

**Features:**
- 4 Main KPI Cards (Cost, Health, Availability, Error Rate)
- Health Score Gauge Chart
- Efficiency Rating Badge
- Bottleneck Detection List
- Cost Breakdown by Category

---

### 5. **EnhancedPropertiesPanel** - Properties Panel with What-if
**File:** `components/EnhancedPropertiesPanel.tsx`

Enhanced version of PropertiesPanel with What-if Analysis integration.

**New Features:**
- **Instance Count Slider** with real-time preview
- **What-if Calculation** on slider change (debounced 500ms)
- **Impact Preview** showing cost and health impacts inline
- **Apply Changes** button to commit what-if results

**Props:**
```typescript
{
  currentMetrics?: SystemMetrics | null;
  onMetricsUpdate?: (metrics: SystemMetrics) => void;
}
```

**Integration Flow:**
1. User moves Instance Count slider
2. Debounced API call to `/api/metrics/what-if`
3. Display impact diff in real-time
4. Show ImpactPanel with detailed breakdown
5. User clicks "Apply Changes" to commit

---

### 6. **MetricsDashboardPanel** - Collapsible Dashboard Wrapper
**File:** `components/MetricsDashboardPanel.tsx`

Collapsible panel wrapper for KPI Dashboard.

**Features:**
- Auto-collapse/expand functionality
- Loading indicator
- Responsive layout

---

## 🔧 Services & Utilities

### Metrics Service
**File:** `services/metrics.service.ts`

```typescript
// Calculate current metrics
await calculateMetrics(diagramContent: DiagramContent): Promise<SystemMetrics>

// Calculate what-if scenario
await calculateWhatIf(request: WhatIfRequest): Promise<SystemMetrics>
```

### Custom Hook: useMetrics
**File:** `hooks/useMetrics.ts`

Automatic metrics calculation on diagram changes.

```typescript
const { metrics, loading, error, refreshMetrics } = useMetrics();
```

**Features:**
- Auto-recalculates when nodes/edges change
- Debounced updates (1000ms)
- Manual refresh function
- Error handling

### Utility: debounce
**File:** `utils/debounce.ts`

Generic debounce function for delaying API calls.

---

## 🎨 Integration Steps

### Step 1: Add MetricsDashboardPanel to Editor

```tsx
// In EditorPage.tsx
import { MetricsDashboardPanel } from '../components/MetricsDashboardPanel';

// Add above the main canvas area
<div className="flex flex-col flex-1">
  <MetricsDashboardPanel />
  <Canvas />
</div>
```

### Step 2: Replace PropertiesPanel with EnhancedPropertiesPanel

```tsx
// In EditorPage.tsx
import { EnhancedPropertiesPanel } from '../components/EnhancedPropertiesPanel';
import { useMetrics } from '../hooks/useMetrics';

// In component body
const { metrics, loading } = useMetrics();
const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);

useEffect(() => {
  if (metrics) setCurrentMetrics(metrics);
}, [metrics]);

// Replace PropertiesPanel with
<EnhancedPropertiesPanel
  currentMetrics={currentMetrics}
  onMetricsUpdate={setCurrentMetrics}
/>
```

### Step 3: Add Compact KPI to Header (Optional)

```tsx
// In Header.tsx
import { KpiDashboard } from './KpiDashboard';
import { useMetrics } from '../hooks/useMetrics';

const { metrics } = useMetrics();

// Add to header
<KpiDashboard metrics={metrics} compact={true} />
```

---

## 🎯 Features Implemented

### ✅ Real-time Metrics Calculation
- Automatically calculates when diagram changes
- Debounced to avoid excessive API calls
- Loading states and error handling

### ✅ What-if Analysis
- Interactive instance count slider
- Real-time impact preview
- Detailed cost/performance trade-offs
- Apply/Reset functionality

### ✅ Comprehensive KPIs
1. **Monthly Cost** - with breakdown by category
2. **Health Score** - 0-100 gauge visualization
3. **Availability** - % uptime prediction
4. **Error Rate** - average failure rate
5. **Efficiency Rating** - text classification
6. **Bottleneck Detection** - list of issues

### ✅ Visual Feedback
- Color-coded status indicators
- Trend arrows (up/down)
- Animated transitions
- Toast notifications

---

## 📊 API Integration

### Backend Endpoints Used

```http
POST /api/metrics/calculate
Content-Type: application/json

{
  "metadata": { "name": "...", "version": 1 },
  "nodes": [...],
  "edges": [...]
}

Response: SystemMetrics
```

```http
POST /api/metrics/what-if
Content-Type: application/json

{
  "diagramContent": { ... },
  "nodeId": "node-123",
  "newInstanceCount": 5
}

Response: SystemMetrics
```

---

## 🎨 Styling & Theme

All components use Tailwind CSS with the project's design system:

**Colors:**
- Success: `green-500`
- Warning: `orange-500`
- Danger: `red-500`
- Info: `blue-500`
- Primary: Existing project primary color

**Background:**
- Surface: `bg-gray-900`
- Border: `border-gray-800`
- Hover: `hover:bg-gray-800`

---

## 🧪 Testing

### Manual Testing Checklist

1. ✅ Add nodes to diagram → Metrics update automatically
2. ✅ Change instance count slider → Impact panel appears
3. ✅ View cost breakdown → Correct values per category
4. ✅ Check bottleneck detection → Single instance nodes flagged
5. ✅ Apply what-if changes → Metrics update in dashboard
6. ✅ Collapse/expand dashboard → State preserved
7. ✅ Remove all nodes → "No metrics available" message

### Performance Considerations

- ✅ Debounced API calls (500ms for what-if, 1000ms for metrics)
- ✅ Memoized components (React.memo)
- ✅ Optimized zustand selectors
- ✅ Lazy calculation (only when visible)

---

## 🔮 Future Enhancements

### Planned Features
1. **Historical Metrics** - Track changes over time
2. **Cost Optimization Suggestions** - AI-powered recommendations
3. **Export Reports** - PDF/Excel export of metrics
4. **Custom KPI** - User-defined metrics
5. **Comparison View** - Compare multiple configurations
6. **Budget Alerts** - Notifications when exceeding budget

### Technical Improvements
1. WebSocket support for real-time updates
2. Caching layer for metrics
3. Progressive loading for large diagrams
4. Accessibility (ARIA labels, keyboard navigation)
5. Mobile responsive design

---

## 📚 Type Definitions

All types are defined in:
- `services/types/metrics.types.ts`

Key types:
```typescript
SystemMetrics
DiagramContent
NodeModel
EdgeModel
MetricsDiff
WhatIfRequest
```

---

## 🐛 Troubleshooting

### Metrics not updating
- Check browser console for API errors
- Verify backend is running on correct port
- Ensure nodes have required fields (specs, simulation)

### What-if calculation failing
- Verify node has props.instanceCount field
- Check network tab for 400/500 errors
- Ensure diagram has valid nodes/edges

### Performance issues
- Reduce debounce delay if too slow
- Check number of nodes (optimize for 50+)
- Disable auto-calculation if needed

---

**Created by:** System Design Playground Team
**Version:** 1.0
**Last Updated:** January 2026
