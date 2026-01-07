using SystemDesign.Application.Services;
using SystemDesign.Domain;
using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Features.AI;

/// <summary>
/// Service để tạo phân tích kiến trúc hệ thống bằng AI
/// </summary>
public class ArchitectureAnalysisService(IAIService aiService, PromptBuilder promptBuilder)
{
    /// <summary>
    /// Phân tích kiến trúc hệ thống và đưa ra đề xuất
    /// </summary>
    public async Task<string> AnalyzeArchitectureAsync(
        DiagramContent diagramData,
        CancellationToken cancellationToken = default)
    {
        // 1. Xây dựng prompt từ diagram
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        // 2. Tạo system prompt cho AI
        var systemPrompt = @"Bạn là một kiến trúc sư hệ thống chuyên nghiệp với nhiều năm kinh nghiệm.
                                Nhiệm vụ của bạn là phân tích kiến trúc hệ thống được mô tả và đưa ra:
                                1. Đánh giá tổng quan về kiến trúc
                                2. Điểm mạnh của thiết kế hiện tại
                                3. Các vấn đề tiềm ẩn hoặc bottleneck
                                4. Đề xuất cải thiện cụ thể
                                5. Best practices nên áp dụng

                                Trả lời bằng tiếng Việt, rõ ràng và có cấu trúc.";

        // 3. Gọi AI service
        var analysis = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return analysis;
    }

    /// <summary>
    /// Đề xuất cải thiện performance cho hệ thống
    /// </summary>
    public async Task<string> SuggestPerformanceImprovementsAsync(
        DiagramContent diagramData,
        CancellationToken cancellationToken = default)
    {
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        var systemPrompt = @"Bạn là chuyên gia về performance optimization cho hệ thống phân tán.
                                Phân tích kiến trúc và đưa ra các đề xuất cụ thể để:
                                1. Giảm latency
                                2. Tăng throughput
                                3. Cải thiện khả năng mở rộng (scalability)
                                4. Tối ưu hóa resource usage
                                5. Tăng reliability

                                Mỗi đề xuất cần bao gồm:
                                - Vấn đề hiện tại
                                - Giải pháp đề xuất
                                - Lợi ích kỳ vọng
                                - Trade-offs (nếu có)

                                Trả lời bằng tiếng Việt.";

        var suggestions = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return suggestions;
    }

    /// <summary>
    /// Phát hiện các vấn đề bảo mật tiềm ẩn
    /// </summary>
    public async Task<string> DetectSecurityIssuesAsync(
        DiagramContent diagramData,
        CancellationToken cancellationToken = default)
    {
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        var systemPrompt = @"Bạn là chuyên gia bảo mật hệ thống (Security Expert).
                            Phân tích kiến trúc và xác định:
                            1. Các lỗ hổng bảo mật tiềm ẩn
                            2. Điểm yếu trong authentication/authorization
                            3. Rủi ro về data security
                            4. Vấn đề về network security
                            5. Compliance concerns

                            Cho mỗi vấn đề, đề xuất:
                            - Mức độ nghiêm trọng (Critical/High/Medium/Low)
                            - Impact nếu bị tấn công
                            - Giải pháp khắc phục
                            - Best practices nên áp dụng

                            Trả lời bằng tiếng Việt.";

        var securityReport = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return securityReport;
    }

    /// <summary>
    /// Tạo tài liệu kiến trúc chi tiết
    /// </summary>
    public async Task<string> GenerateArchitectureDocumentationAsync(
        DiagramContent diagramData,
        string projectName,
        CancellationToken cancellationToken = default)
    {
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        var systemPrompt = $@"Bạn là technical writer chuyên nghiệp.
                            Tạo tài liệu kiến trúc chi tiết cho dự án ""{projectName}"" bao gồm:

                            1. Executive Summary
                            2. System Overview
                            3. Architecture Design
                               - Components Description
                               - Data Flow
                               - Communication Protocols
                            4. Technical Specifications
                            5. Scalability Strategy
                            6. Security Considerations
                            7. Deployment Architecture
                            8. Monitoring & Observability
                            9. Future Enhancements

                            Sử dụng format Markdown. Trả lời bằng tiếng Việt.";

        var documentation = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return documentation;
    }

    /// <summary>
    /// So sánh với các pattern phổ biến
    /// </summary>
    public async Task<string> CompareWithDesignPatternsAsync(
        DiagramContent diagramData,
        CancellationToken cancellationToken = default)
    {
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        var systemPrompt = @"Bạn là chuyên gia về Software Architecture Patterns.
                            Phân tích kiến trúc hiện tại và:

                            1. Xác định pattern nào đang được sử dụng (nếu có)
                               - Microservices
                               - Event-Driven
                               - Layered Architecture
                               - CQRS
                               - Saga Pattern
                               - etc.

                            2. So sánh với best practices của pattern đó

                            3. Đề xuất patterns phù hợp hơn (nếu cần)

                            4. Ví dụ cụ thể về cách áp dụng

                            Trả lời bằng tiếng Việt, có code examples nếu cần.";

        var comparison = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return comparison;
    }

    /// <summary>
    /// Ước tính chi phí vận hành
    /// </summary>
    public async Task<string> EstimateOperationalCostAsync(
        DiagramContent diagramData,
        int expectedTrafficPerDay,
        CancellationToken cancellationToken = default)
    {
        var systemDescription = promptBuilder.BuildFromDiagram(diagramData);

        var systemPrompt = $@"Bạn là chuyên gia về Cloud Cost Optimization.
                            Dựa trên kiến trúc và traffic ước tính {expectedTrafficPerDay:N0} requests/day:

                            1. Ước tính chi phí vận hành hàng tháng:
                               - Compute costs
                               - Storage costs
                               - Network costs
                               - Database costs
                               - Managed services costs

                            2. Đề xuất tối ưu hóa chi phí:
                               - Reserved instances
                               - Auto-scaling strategies
                               - Resource right-sizing
                               - Caching strategies

                            3. Cost breakdown theo component

                            4. ROI và cost-benefit analysis

                            Cung cấp con số ước tính cụ thể. Trả lời bằng tiếng Việt.";

        var costEstimate = await aiService.GenerateResponseAsync(
            systemPrompt,
            systemDescription,
            cancellationToken
        );

        return costEstimate;
    }
}
