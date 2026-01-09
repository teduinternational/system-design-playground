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
            Nodes: new List<NodeModel>
            {
                new NodeModel(
                    Id: "node_1",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "API Gateway",
                        Category: NodeCategory.TrafficManager,
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
                        Category: NodeCategory.Compute,
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
                        Category: NodeCategory.Storage,
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
        Assert.Contains("SYSTEM ARCHITECTURE DESCRIPTION", prompt);
        Assert.Contains("Total Components: 3", prompt);
        Assert.Contains("Total Connections: 2", prompt);

        // Kiểm tra mô tả nodes
        Assert.Contains("API Gateway", prompt);
        Assert.Contains("User Service", prompt);
        Assert.Contains("PostgreSQL", prompt);

        // Kiểm tra technologies
        Assert.Contains("NGINX", prompt);
        Assert.Contains("Kong", prompt);
        Assert.Contains("Node.js", prompt);

        // Kiểm tra connections
        Assert.Contains("HTTP Request", prompt);
        Assert.Contains("Database Query", prompt);
        Assert.Contains("HTTPS", prompt);
        Assert.Contains("JWT", prompt);

        // Kiểm tra summary
        Assert.Contains("ARCHITECTURE SUMMARY", prompt);
        Assert.Contains("Components by Category", prompt);
        Assert.Contains("Technologies Used", prompt);
        Assert.Contains("Communication Protocols", prompt);

        // In ra prompt để kiểm tra trực quan
        Console.WriteLine(prompt);
    }

    [Fact]
    public void BuildFromDiagram_EmptyDiagram_ShouldHandleGracefully()
    {
        // Arrange
        var builder = new PromptBuilder();
        var emptyDiagram = new DiagramContent(
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
            Nodes: new List<NodeModel>
            {
                new NodeModel(
                    Id: "node_1",
                    Type: "customNode",
                    Metadata: new NodeMetadata(
                        Label: "Simple Service",
                        Category: NodeCategory.Compute,
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
