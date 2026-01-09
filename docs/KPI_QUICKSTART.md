# Quick Start: KPI Dashboard & What-if Analysis

## 🚀 3 Steps to Integrate

### 1. Import Components in EditorPage

```tsx
import { MetricsDashboardPanel } from '../components/MetricsDashboardPanel';
import { EnhancedPropertiesPanel } from '../components/EnhancedPropertiesPanel';
import { useMetrics } from '../hooks/useMetrics';
```

### 2. Add useMetrics Hook

```tsx
const { metrics } = useMetrics();
const [currentMetrics, setCurrentMetrics] = useState<SystemMetrics | null>(null);

useEffect(() => {
  if (metrics) setCurrentMetrics(metrics);
}, [metrics]);
```

### 3. Replace Components

```tsx
// Add Dashboard above Canvas
<MetricsDashboardPanel />

// Replace PropertiesPanel with Enhanced version
<EnhancedPropertiesPanel
  currentMetrics={currentMetrics}
  onMetricsUpdate={setCurrentMetrics}
/>
```

## 🎯 Features

✅ **Real-time KPIs**: Auto-calculate cost, health score, availability
✅ **What-if Analysis**: Preview impact of configuration changes
✅ **Interactive Sliders**: Change instance count and see cost/performance trade-offs
✅ **Bottleneck Detection**: Automatically identify system weaknesses

## 📦 Files Created

### Components
- `KpiCard.tsx` - Individual KPI display
- `GaugeChart.tsx` - Health score visualization
- `ImpactPanel.tsx` - What-if results
- `KpiDashboard.tsx` - Complete dashboard
- `EnhancedPropertiesPanel.tsx` - Properties with what-if
- `MetricsDashboardPanel.tsx` - Dashboard wrapper

### Services & Hooks
- `services/metrics.service.ts` - API calls
- `services/types/metrics.types.ts` - Type definitions
- `hooks/useMetrics.ts` - Auto metrics calculation
- `utils/debounce.ts` - Debounce utility

## 🎨 Usage Example

```tsx
// Basic KPI Display
<KpiCard
  title="Monthly Cost"
  value="$1,240.00"
  icon={<DollarSign />}
  status="warning"
/>

// Gauge Chart
<GaugeChart
  value={85}
  label="Health Score"
  size="lg"
/>

// Full Dashboard
<KpiDashboard metrics={metrics} loading={loading} />
```

## 🔧 Configuration

All metrics are calculated automatically based on:
- Node configuration (instances, reliability, latency)
- Simulation parameters (failure rate, processing time)
- Technical properties (clustered, backup policy)

No manual configuration needed!

## 📊 API Endpoints

```bash
POST /api/metrics/calculate     # Calculate current metrics
POST /api/metrics/what-if       # What-if analysis
```

## 🐛 Troubleshooting

**Metrics not showing?**
- Ensure backend is running on port 7074
- Check nodes have `specs` and `simulation` fields
- Open browser console for errors

**What-if not working?**
- Verify node has `props.instanceCount`
- Check network tab for API errors

## 📚 Full Documentation

See [FRONTEND_KPI_INTEGRATION.md](./FRONTEND_KPI_INTEGRATION.md) for complete guide.

---

**Backend Ready**: ✅ MetricsCalculatorService implemented
**Frontend Ready**: ✅ All components created
**Integration**: 🔄 Follow 3 steps above

Happy coding! 🎉
