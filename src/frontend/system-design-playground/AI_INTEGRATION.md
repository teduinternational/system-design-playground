# AI Integration - Frontend

Tích hợp AI Analysis features vào frontend của System Design Playground.

## 📁 File Structure

```
src/frontend/system-design-playground/
├── services/
│   ├── ai.service.ts              # AI API service
│   └── types/
│       └── ai.types.ts            # TypeScript types cho AI
├── hooks/
│   └── useAIAnalysis.ts           # React hooks cho AI analysis
├── components/
│   ├── AIAnalysisModal.tsx        # Modal hiển thị kết quả AI
│   └── AIButton.tsx               # Button components cho AI
└── examples/
    └── AIIntegration.example.tsx  # Ví dụ tích hợp
```

## 🚀 Quick Start

### 1. Import AI Service

```typescript
import { aiApi } from '@/services/ai.service';
import { convertToBackendFormat } from '@/utils/convertDiagram';
import { useDiagramStore } from '@/stores/useDiagramStore';

// Chuyển đổi React Flow data sang Backend format
const { nodes, edges } = useDiagramStore.getState();
const diagramData = convertToBackendFormat(nodes, edges);

// Phân tích kiến trúc
const result = await aiApi.analyzeArchitecture(diagramData);

// Đề xuất performance
const suggestions = await aiApi.suggestPerformance(diagramData);

// Audit bảo mật
const security = await aiApi.detectSecurityIssues(diagramData);
```

### 2. Sử dụng React Hooks

```typescript
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';

function MyComponent() {
  const { analyze, status, result, error } = useAIAnalysis();
  const { nodes, edges } = useDiagramStore();

  const handleAnalyze = async () => {
    const diagramData = convertToBackendFormat(nodes, edges);
    await analyze('architecture', diagramData);
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={status === 'loading'}>
        Analyze
      </button>
      {result && <pre>{result}</pre>}
    </div>
  );
}
```

### 3. Sử dụng UI Components

```typescript
import { AIAnalysisModal } from '@/components/AIAnalysisModal';
import { AIButton } from '@/components/AIButton';

function MyEditor() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <AIButton onClick={() => setShowModal(true)} />
      <AIAnalysisModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
```

## 📚 API Reference

### AI Service (`ai.service.ts`)

#### `aiApi.test(question?: string)`
Test AI service với câu hỏi đơn giản.

#### `aiApi.chat(request: ChatRequest)`
Chat với AI sử dụng custom prompts.

#### `aiApi.analyzeArchitecture(diagramData: DiagramContent)`
Phân tích kiến trúc tổng thể, đưa ra đánh giá và đề xuất.

**Returns:** `{ analysis: string, timestamp: string }`

#### `aiApi.suggestPerformance(diagramData: DiagramContent)`
Đề xuất cải thiện performance (latency, throughput, scalability).

**Returns:** `{ suggestions: string, timestamp: string }`

#### `aiApi.detectSecurityIssues(diagramData: DiagramContent)`
Phát hiện lỗ hổng bảo mật tiềm ẩn.

**Returns:** `{ securityReport: string, timestamp: string }`

#### `aiApi.generateDocumentation(diagramData: DiagramContent, projectName: string)`
Tạo tài liệu kiến trúc chi tiết (Markdown format).

**Returns:** `{ documentation: string, projectName: string, timestamp: string }`

#### `aiApi.compareWithPatterns(diagramData: DiagramContent)`
So sánh kiến trúc với các design patterns phổ biến.

**Returns:** `{ comparison: string, timestamp: string }`

#### `aiApi.estimateCost(diagramData: DiagramContent, expectedTrafficPerDay: number)`
Ước tính chi phí vận hành hệ thống.

**Returns:** `{ costEstimate: string, expectedTrafficPerDay: number, timestamp: string }`

### React Hooks

#### `useAIAnalysis()`
Hook chính để thực hiện AI analysis.

```typescript
const {
  status,        // 'idle' | 'loading' | 'success' | 'error'
  result,        // Kết quả analysis (string)
  error,         // Error message (nếu có)
  isLoading,     // Boolean
  isSuccess,     // Boolean
  isError,       // Boolean
  analyze,       // Function để run analysis
  reset,         // Function để reset state
} = useAIAnalysis();
```

**Usage:**
```typescript
await analyze(
  'architecture',  // Type: AIAnalysisType
  diagramData,     // DiagramContent
  {
    projectName: 'My Project',        // Optional for 'documentation'
    expectedTrafficPerDay: 1000000,   // Optional for 'cost'
  }
);
```

#### `useAIChat()`
Hook đơn giản cho chat với AI.

```typescript
const { chat, isLoading, error } = useAIChat();

const response = await chat(
  'How to optimize my API Gateway?',
  'You are a system architect'  // Optional system prompt
);
```

#### `useBatchAIAnalysis()`
Hook để chạy nhiều analyses cùng lúc.

```typescript
const { analyzeMultiple, results, errors, status } = useBatchAIAnalysis();

const { results, errors } = await analyzeMultiple(
  ['architecture', 'performance', 'security'],
  diagramData,
  options
);

// results: Map<AIAnalysisType, string>
// errors: Map<AIAnalysisType, string>
```

## 🎨 UI Components

### `<AIAnalysisModal />`
Modal đầy đủ với selection và kết quả.

**Props:**
- `isOpen: boolean` - Control modal visibility
- `onClose: () => void` - Callback khi đóng modal

**Features:**
- Select analysis type
- Input project name (for documentation)
- Input traffic (for cost estimation)
- Display results with copy functionality
- Error handling

### `<AIButton />`
Button đơn giản để mở AI analysis.

**Props:**
- `onClick: () => void` - Callback khi click
- `disabled?: boolean` - Disable button

### `<QuickAIActions />`
Dropdown với quick actions.

**Props:**
- `onAnalyze: (type: 'architecture' | 'performance' | 'security') => void`

## 📊 Data Format

### Backend API DiagramContent Structure

Backend API sử dụng format khác với React Flow. Sử dụng `convertToBackendFormat()` để convert:

```typescript
import type { BackendDiagramContent } from '@/services/types/ai.types';

interface BackendDiagramContent {
  nodes: Array<{
    id: string;
    type: string;
    metadata: {
      label: string;
      category: string;
      specs: {
        latencyBase: number;
        maxThroughput: number;
        reliability: number;
      };
      technologies?: string[];
      props?: Record<string, any>;
      simulation?: {
        processingTimeMs: number;
        failureRate: number;
        queueSize?: number;
        currentLoad?: number;
      };
    };
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: {
      protocol: string;
      auth?: string;
      trafficWeight?: number;
      networkLatency?: number;
    };
  }>;
}
```

### Converting from React Flow Store

```typescript
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';

const { nodes, edges } = useDiagramStore.getState();

// Automatic conversion
const diagramData = convertToBackendFormat(nodes, edges);

// Now ready for API calls
await aiApi.analyzeArchitecture(diagramData);
```

## 🔧 Configuration

### Environment Variables

```env
# .env.local
VITE_API_BASE_URL=https://localhost:7074
```

Đảm bảo backend AI endpoints đang chạy tại URL này.

## 💡 Usage Examples

### Example 1: Basic Analysis

```typescript
import { aiApi } from '@/services/ai.service';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';

async function analyzeCurrentDiagram() {
  const { nodes, edges } = useDiagramStore.getState();
  
  // Convert to backend format
  const diagramData = convertToBackendFormat(nodes, edges);

  try {
    const result = await aiApi.analyzeArchitecture(diagramData);
    console.log('Analysis:', result.analysis);
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

### Example 2: With React Hook

```typescript
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';

function AnalysisButton() {
  const { analyze, status, result } = useAIAnalysis();
  const { nodes, edges } = useDiagramStore();

  const handleClick = async () => {
    const diagramData = convertToBackendFormat(nodes, edges);
    await analyze('architecture', diagramData);
  };

  return (
    <div>
      <button onClick={handleClick}>
        {status === 'loading' ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && <pre>{result}</pre>}
    </div>
  );
}
```

### Example 3: Complete Integration

```typescript
import React, { useState } from 'react';
import { AIAnalysisModal } from '@/components/AIAnalysisModal';
import { AIButton } from '@/components/AIButton';

function MyEditorPage() {
  const [showAI, setShowAI] = useState(false);

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <AIButton onClick={() => setShowAI(true)} />
      </div>

      {/* Canvas */}
      <div className="canvas">
        {/* ... */}
      </div>

      {/* AI Modal */}
      <AIAnalysisModal 
        isOpen={showAI} 
        onClose={() => setShowAI(false)} 
      />
    </div>
  );
}
```

## 🐛 Error Handling

```typescript
try {
  const result = await aiApi.analyzeArchitecture(diagramData);
  // Success
} catch (error) {
  if (error instanceof Error) {
    // Network error, timeout, or API error
    console.error('API Error:', error.message);
  }
}
```

Hooks tự động handle errors và expose qua `error` state.

## 🧪 Testing

```typescript
// Mock AI service
jest.mock('@/services/ai.service', () => ({
  aiApi: {
    analyzeArchitecture: jest.fn().mockResolvedValue({
      analysis: 'Mock analysis result',
      timestamp: '2026-01-07T00:00:00Z',
    }),
  },
}));
```

## 📝 Best Practices

1. **Always validate diagram data** trước khi gửi lên AI
2. **Handle loading states** để UX tốt hơn
3. **Implement timeout** cho API calls
4. **Cache results** nếu diagram không thay đổi
5. **Show progress indicators** cho long-running analyses
6. **Provide copy/export** functionality cho results
7. **Log errors** để debug

## 🔗 Related Files

- Backend: `SystemDesign.Api/Endpoints/AIEndpoints.cs`
- Backend: `SystemDesign.Application/Services/PromptBuilder.cs`
- Backend: `SystemDesign.Application/Features/AI/ArchitectureAnalysisService.cs`
- Docs: `docs/PROMPT_BUILDER.md`

## 📄 License

Part of SystemDesignPlayground project.
