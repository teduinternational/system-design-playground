# API Integration Guide

## Tổng quan

Frontend đã được tích hợp với backend API tại `https://localhost:7074`. Tất cả các thao tác CRUD với diagrams giờ đây sẽ gọi trực tiếp đến backend API thay vì sử dụng mock data hoặc localStorage.

## Cấu hình

### Environment Variables

File `.env.local` đã được cấu hình với:

```env
VITE_API_BASE_URL=https://localhost:7074
```

Bạn có thể thay đổi URL này nếu backend chạy ở địa chỉ khác.

## Cấu trúc Code

### 1. API Service (`services/api.ts`)

Service layer chứa tất cả các API calls:

- **diagramApi**: CRUD operations cho diagrams
  - `getAll()` - Lấy tất cả diagrams
  - `getById(id)` - Lấy diagram theo ID
  - `create(data)` - Tạo diagram mới
  - `update(id, data)` - Cập nhật diagram
  - `delete(id)` - Xóa diagram (soft delete)

- **scenarioApi**: Operations cho scenarios (chưa dùng trong UI)
  - `getByDiagram(diagramId)` - Lấy scenarios của diagram
  - `create(diagramId, data)` - Tạo scenario mới
  - `update(id, data)` - Cập nhật scenario

### 2. Custom Hook (`hooks/useApiDiagramPersistence.ts`)

Hook này cung cấp các functions để làm việc với API:

```typescript
const {
  isLoading,           // Loading state
  error,               // Error message
  loadDiagramFromApi,  // Load diagram từ API
  saveDiagramToApi,    // Save diagram mới
  updateDiagramOnApi,  // Update diagram existing
  deleteDiagramFromApi,// Delete diagram
  getAllDiagrams,      // Get all diagrams
  exportDiagram,       // Export JSON file
  importDiagram        // Import JSON file
} = useApiDiagramPersistence();
```

### 3. Data Flow

#### Load Diagram

1. User click vào diagram trong ProjectListPage
2. Navigate to `/editor?id={diagramId}`
3. EditorPage detect ID từ URL
4. Call `loadDiagramFromApi(id)` 
5. API trả về DiagramDto
6. Convert sang SerializedDiagram format
7. Load vào Zustand store

#### Save Diagram

1. User click nút "Save" ở Header
2. EditorPage gọi `handleSave()`
3. Nếu có `diagramId`: call `updateDiagramOnApi(id)`
4. Nếu không có: call `saveDiagramToApi()` (create new)
5. Backend trả về DiagramDto với ID
6. URL được update với diagram ID mới

#### List Diagrams

1. ProjectListPage load
2. Call `getAllDiagrams()` trong useEffect
3. Backend trả về array of DiagramDto
4. Render danh sách diagrams

## API Request/Response Format

### Create Diagram

**Request:**
```typescript
POST /api/diagrams
{
  name: string;
  description?: string;
  jsonData: string;  // Serialized diagram JSON
  createdBy?: string;
}
```

**Response:**
```typescript
{
  id: string;        // GUID
  name: string;
  description?: string;
  jsonData: string;
  version: number;
  createdBy?: string;
  createdAt: string; // ISO datetime
  updatedAt?: string;
}
```

### Update Diagram

**Request:**
```typescript
PUT /api/diagrams/{id}
{
  name: string;
  description?: string;
  jsonData: string;
}
```

### Get All Diagrams

**Request:**
```typescript
GET /api/diagrams
// Optional query params:
// ?userId=xxx
// ?search=xxx
```

**Response:**
```typescript
DiagramDto[]
```

## Tính năng đã implement

✅ Load diagram từ API khi mở editor với ID
✅ Save diagram mới lên backend
✅ Update diagram existing
✅ List tất cả diagrams từ backend
✅ Loading và error states
✅ Export/Import JSON local (backup)
✅ Auto-save to localStorage (fallback)

## Tính năng chưa implement

⏳ Delete diagram từ UI
⏳ Search diagrams
⏳ Filter diagrams theo user
⏳ Scenarios management
⏳ Version history
⏳ Real-time collaboration

## Testing

### 1. Kiểm tra Backend Running

```bash
curl https://localhost:7074/api/diagrams -k
```

Nếu backend chạy đúng, sẽ trả về array (có thể empty).

### 2. Test Create Diagram

1. Mở `/editor`
2. Tạo một vài nodes
3. Click "Save" button
4. Nhập tên diagram
5. Check console log: "✅ New diagram created on API"
6. URL sẽ update với diagram ID

### 3. Test Load Diagram

1. Quay về `/projects`
2. Sẽ thấy diagram vừa tạo
3. Click vào diagram
4. Editor sẽ load đúng diagram content

### 4. Test Update Diagram

1. Mở một diagram existing
2. Thêm/xóa nodes
3. Click "Save"
4. Reload page -> changes được persist

## Error Handling

Tất cả API errors sẽ:
1. Log ra console với prefix "❌"
2. Set error state trong hook
3. Display alert cho user (có thể cải thiện với toast notifications)

## CORS & HTTPS

Backend chạy trên HTTPS với self-signed certificate. Nếu gặp CORS issues:

1. Check backend CORS configuration
2. Đảm bảo frontend URL được whitelist
3. Browser có thể yêu cầu accept certificate lần đầu

## Next Steps

1. **Improve UX**: Thay alert() bằng toast notifications
2. **Loading UI**: Thêm skeleton loaders
3. **Error Recovery**: Retry logic cho failed requests
4. **Optimistic Updates**: Update UI trước, sync backend sau
5. **Offline Support**: Queue requests khi offline
6. **Delete Confirmation**: Modal xác nhận trước khi xóa
7. **Search & Filter**: Implement search bar ở ProjectListPage
