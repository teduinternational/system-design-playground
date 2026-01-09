using SystemDesign.Application.Services;
using SystemDesign.Domain.Enums;
using SystemDesign.Domain.Models;

namespace SystemDesign.Tests.Services;

public class PromptBuilderTests
{
    [Fact]
    public void BuildFromDiagram_ShouldGenerateDetailedPrompt()
    {
        // Arrange
        var builder = new PromptBuilder();

        var diagramData = new DiagramContent(
            Metadata: new DiagramMetadata(
                Id: "test-diagram-1",
                Name: "Test Architecture",
                Description: "Test diagram for unit tests",
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                Version: 1,
                CreatedBy: "test-user",
                Tags: new List<string> { "test", "architecture" }
            ),
            Nodes: new List<NodeModel>
            {
                new NodeModel(
                    Id: "node_1",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "API Gateway",
                        Category: "TrafficManager",
                        Specs: new NodeSpecs(
                            LatencyBase: 10,
                            MaxThroughput: 5000,
                            Reliability: 0.999
                        ),
                        Technologies: new List<string> { "NGINX", "Kong" },
                        Provider: "AWS",
                        Logic: new NodeLogic(
                            CanReceiveFrom: new List<string> { "client", "loadBalancer" },
                            CanSendTo: new List<string> { "microservice", "database" }
                        ),
                        Props: new TechnicalProps(
                            InstanceCount: 3,
                            IsClustered: true,
                            Region: "us-east-1"
                        ),
                        Simulation: new SimulationProps(
                            ProcessingTimeMs: 5,
                            FailureRate: 0.001,
                            QueueSize: 100
                        )
                    ),
                    Position: new Position(100, 100)
                ),
                new NodeModel(
                    Id: "node_2",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "User Service",
                        Category: "Compute",
                        Specs: new NodeSpecs(
                            LatencyBase: 50,
                            MaxThroughput: 1000,
                            Reliability: 0.995
                        ),
                        Technologies: new List<string> { "Node.js", "Express" },
                        Provider: "AWS",
                        Props: new TechnicalProps(
                            InstanceCount: 5,
                            IsClustered: true,
                            Region: "us-east-1"
                        ),
                        Simulation: new SimulationProps(
                            ProcessingTimeMs: 20,
                            FailureRate: 0.005
                        )
                    ),
                    Position: new Position(300, 100)
                ),
                new NodeModel(
                    Id: "node_3",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "PostgreSQL",
                        Category: "Storage",
                        Specs: new NodeSpecs(
                            LatencyBase: 5,
                            MaxThroughput: 10000,
                            Reliability: 0.9999
                        ),
                        Technologies: new List<string> { "PostgreSQL" },
                        Provider: "AWS RDS",
                        Props: new TechnicalProps(
                            InstanceCount: 1,
                            IsClustered: false,
                            BackupPolicy: "Daily",
                            Region: "us-east-1"
                        )
                    ),
                    Position: new Position(500, 100)
                )
            },
            Edges: new List<EdgeModel>
            {
                new EdgeModel(
                    Id: "edge_1",
                    Source: "node_1",
                    Target: "node_2",
                    Type: "smoothstep",
                    Data: new EdgeData(
                        Protocol: "HTTPS",
                        Auth: "JWT",
                        TrafficWeight: 1.0,
                        NetworkLatency: 5
                    )
                ),
                new EdgeModel(
                    Id: "edge_2",
                    Source: "node_2",
                    Target: "node_3",
                    Type: "smoothstep",
                    Data: new EdgeData(
                        Protocol: "TCP",
                        Auth: "Password",
                        TrafficWeight: 0.8,
                        NetworkLatency: 2
                    )
                )
            }
        );

        // Act
        var prompt = builder.BuildFromDiagram(diagramData);

        // Assert
        Assert.NotNull(prompt);
        Assert.NotEmpty(prompt);

        // Kiểm tra các phần chính của prompt
        Assert.Contains("Total Components: 3", prompt);
        Assert.Contains("Total Connections: 2", prompt);

        // Kiểm tra mô tả nodes
        Assert.Contains("API Gateway", prompt);
        Assert.Contains("User Service", prompt);
        Assert.Contains("PostgreSQL", prompt);

        // Kiểm tra technologies
        Assert.Contains("NGINX", prompt);
        Assert.Contains("Node.js", prompt);

        // Kiểm tra protocol
        Assert.Contains("HTTPS", prompt);
        Assert.Contains("JWT", prompt);

        // In ra prompt để kiểm tra trực quan
        Console.WriteLine(prompt);
    }

    [Fact]
    public void BuildFromDiagram_EmptyDiagram_ShouldHandleGracefully()
    {
        // Arrange
        var builder = new PromptBuilder();
        var emptyDiagram = new DiagramContent(
            Metadata: new DiagramMetadata(
                Id: "empty-diagram",
                Name: "Empty Diagram",
                Description: null,
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                Version: 1
            ),
            Nodes: new List<NodeModel>(),
            Edges: new List<EdgeModel>()
        );

        // Act
        var prompt = builder.BuildFromDiagram(emptyDiagram);

        // Assert
        Assert.NotNull(prompt);
        Assert.Contains("Total Components: 0", prompt);
        Assert.Contains("Total Connections: 0", prompt);
    }

    [Fact]
    public void BuildFromDiagram_MinimalNode_ShouldGenerateBasicPrompt()
    {
        // Arrange
        var builder = new PromptBuilder();
        var minimalDiagram = new DiagramContent(
            Metadata: new DiagramMetadata(
                Id: "minimal-diagram",
                Name: "Minimal Diagram",
                Description: null,
                CreatedAt: DateTime.UtcNow,
                UpdatedAt: DateTime.UtcNow,
                Version: 1
            ),
            Nodes: new List<NodeModel>
            {
                new NodeModel(
                    Id: "node_1",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "Simple Service",
                        Category: "Compute",
                        Specs: new NodeSpecs(
                            LatencyBase: 10,
                            MaxThroughput: 100,
                            Reliability: 0.99
                        )
                    )
                )
            },
            Edges: new List<EdgeModel>()
        );

        // Act
        var prompt = builder.BuildFromDiagram(minimalDiagram);

        // Assert
        Assert.NotNull(prompt);
        Assert.Contains("Simple Service", prompt);
        Assert.Contains("Compute", prompt);
        Assert.Contains("Latency Base: 10ms", prompt);
    }
}
