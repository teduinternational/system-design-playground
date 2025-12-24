# Tiêu chuẩn Dự án System Design Playground
## Công nghệ & Ngôn ngữ
- Backend: .NET 10 (C# 14+), Minimal API.
- Frontend: React (Functional Components, Hooks), TypeScript, Tailwind CSS.
- Database: SQL Server (Entity Framework Core).
## Quy tắc Backend (.NET 10)
- Luôn sử dụng **Primary Constructors** cho Dependency Injection.
- Sử dụng **Minimal API** map trong Extension methods, không dùng Controllers.
- Áp dụng **Clean Architecture**: Domain -> Application -> Infrastructure -> Api.
- Sử dụng **Result Pattern** cho các Service thay vì throw Exceptions.
- Ưu tiên sử dụng `System.Text.Json` với các tính năng mới của .NET 10.
## Quy tắc Frontend (React)
- Sử dụng Vite làm build tool.
- Luôn khai báo Type/Interface rõ ràng cho Props (dùng TS) hoặc JSDoc.
- Các component UI phức tạp phải tách ra khỏi logic của React Flow.
