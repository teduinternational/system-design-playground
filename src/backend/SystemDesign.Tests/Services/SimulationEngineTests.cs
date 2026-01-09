using FluentAssertions;
using SystemDesign.Application.Services;
using SystemDesign.Domain.Models;

namespace SystemDesign.Tests.Services;

/// <summary>
/// Unit tests cho SimulationEngine service
/// Test thuật toán BFS tính longest path và total latency
/// </summary>
public class SimulationEngineTests
{
    private readonly ISimulationEngine _simulationEngine;

    public SimulationEngineTests()
    {
        _simulationEngine = new SimulationEngine();
    }

    /// <summary>
    /// Test case 1: 3 nodes nối tiếp - Linear path
    /// Client -> Server -> Database
    /// Expected: Tổng latency = node latencies + edge latencies
    /// </summary>
    [Fact]
    public async Task CalculateLongestPath_WithThreeLinearNodes_ShouldReturnCorrectLatency()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel(
                    Id: "client",
                    Type: "Client",
                    Metadata: new NodeMetadata(
                        Label: "Client",
                        Category: "EntryPoint",
                        Specs: new NodeSpecs(5, 1000, 0.99),
                        Simulation: new SimulationProps(5, 0.001)
                    )
                ),
                new NodeModel(
                    Id: "server",
                    Type: "Server",
                    Metadata: new NodeMetadata(
                        Label: "Server",
                        Category: "Compute",
                        Specs: new NodeSpecs(10, 1000, 0.99),
                        Simulation: new SimulationProps(10, 0.001)
                    )
                ),
                new NodeModel(
                    Id: "database",
                    Type: "Database",
                    Metadata: new NodeMetadata(
                        Label: "Database",
                        Category: "Storage",
                        Specs: new NodeSpecs(50, 1000, 0.99),
                        Simulation: new SimulationProps(50, 0.001)
                    )
                )
            ],
            Edges =
            [
                new EdgeModel(
                    Id: "e1",
                    Source: "client",
                    Target: "server",
                    Type: "default",
                    Data: new EdgeData("HTTP", NetworkLatency: 15)
                ),
                new EdgeModel(
                    Id: "e2",
                    Source: "server",
                    Target: "database",
                    Type: "default",
                    Data: new EdgeData("TCP", NetworkLatency: 20)
                )
            ]
        };

        // Expected calculation:
        // client (5ms) + e1 (15ms) + server (10ms) + e2 (20ms) + database (50ms) = 100ms

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        results.Should().NotBeNull();
        results.Should().HaveCount(1, "có duy nhất 1 entry point");

        var result = results.First();
        result.EntryNodeId.Should().Be("client");
        result.EndNodeId.Should().Be("database");
        result.TotalLatencyMs.Should().Be(100, "tổng latency = 5 + 15 + 10 + 20 + 50");
        result.PathLength.Should().Be(3, "có 3 nodes trong path");
        result.Path.Should().BeEquivalentTo(new[] { "client", "server", "database" });
    }

    /// <summary>
    /// Test case 2: 3 nodes nối tiếp với latency = 0
    /// Verify thuật toán hoạt động đúng khi không có delay
    /// </summary>
    [Fact]
    public async Task CalculateLongestPath_WithZeroLatencies_ShouldReturnZero()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("n1", "Node1", new NodeMetadata("Node1", "EntryPoint", new NodeSpecs(0, 1000, 0.99), Simulation: new SimulationProps(0, 0.001))),
                new NodeModel("n2", "Node2", new NodeMetadata("Node2", "Compute", new NodeSpecs(0, 1000, 0.99), Simulation: new SimulationProps(0, 0.001))),
                new NodeModel("n3", "Node3", new NodeMetadata("Node3", "Compute", new NodeSpecs(0, 1000, 0.99), Simulation: new SimulationProps(0, 0.001)))
            ],
            Edges =
            [
                new EdgeModel("e1", "n1", "n2", "default", new EdgeData("HTTP", NetworkLatency: 0)),
                new EdgeModel("e2", "n2", "n3", "default", new EdgeData("HTTP", NetworkLatency: 0))
            ]
        };

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        var result = results.First();
        result.TotalLatencyMs.Should().Be(0, "tất cả latencies đều = 0");
        result.Path.Should().HaveCount(3);
    }

    /// <summary>
    /// Test case 3: Branching path - Chọn đường dài nhất
    /// Entry -> Middle -> (Branch1 hoặc Branch2)
    /// Branch2 có latency cao hơn nên được chọn
    /// </summary>
    [Fact]
    public async Task CalculateLongestPath_WithBranchingPaths_ShouldSelectLongestPath()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("entry", "Entry", new NodeMetadata("Entry", "EntryPoint", new NodeSpecs(5, 1000, 0.99), Simulation: new SimulationProps(5, 0.001))),
                new NodeModel("middle", "Middle", new NodeMetadata("Middle", "Compute", new NodeSpecs(10, 1000, 0.99), Simulation: new SimulationProps(10, 0.001))),
                new NodeModel("branch1", "FastBranch", new NodeMetadata("FastBranch", "Compute", new NodeSpecs(20, 1000, 0.99), Simulation: new SimulationProps(20, 0.001))),
                new NodeModel("branch2", "SlowBranch", new NodeMetadata("SlowBranch", "Compute", new NodeSpecs(100, 1000, 0.99), Simulation: new SimulationProps(100, 0.001)))
            ],
            Edges =
            [
                new EdgeModel("e1", "entry", "middle", "default", new EdgeData("HTTP", NetworkLatency: 5)),
                new EdgeModel("e2", "middle", "branch1", "default", new EdgeData("HTTP", NetworkLatency: 10)),
                new EdgeModel("e3", "middle", "branch2", "default", new EdgeData("HTTP", NetworkLatency: 15))
            ]
        };

        // Path 1: entry (5) + e1 (5) + middle (10) + e2 (10) + branch1 (20) = 50ms
        // Path 2: entry (5) + e1 (5) + middle (10) + e3 (15) + branch2 (100) = 135ms
        // Expected: Path 2 được chọn (longest)

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        var result = results.First();
        result.TotalLatencyMs.Should().Be(135, "path qua branch2 dài nhất");
        result.EndNodeId.Should().Be("branch2");
        result.Path.Should().BeEquivalentTo(new[] { "entry", "middle", "branch2" });
    }

    /// <summary>
    /// Test case 4: Multiple entry points
    /// Verify thuật toán tìm được tất cả paths từ các entry points khác nhau
    /// </summary>
    [Fact]
    public async Task CalculateLongestPaths_WithMultipleEntryPoints_ShouldReturnMultiplePaths()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("entry1", "Entry1", new NodeMetadata("Entry1", "EntryPoint", new NodeSpecs(10, 1000, 0.99), Simulation: new SimulationProps(10, 0.001))),
                new NodeModel("entry2", "Entry2", new NodeMetadata("Entry2", "EntryPoint", new NodeSpecs(5, 1000, 0.99), Simulation: new SimulationProps(5, 0.001))),
                new NodeModel("end", "End", new NodeMetadata("End", "Compute", new NodeSpecs(20, 1000, 0.99), Simulation: new SimulationProps(20, 0.001)))
            ],
            Edges =
            [
                new EdgeModel("e1", "entry1", "end", "default", new EdgeData("HTTP", NetworkLatency: 15)),
                new EdgeModel("e2", "entry2", "end", "default", new EdgeData("HTTP", NetworkLatency: 10))
            ]
        };

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        results.Should().HaveCount(2, "có 2 entry points");
        results.Should().Contain(r => r.EntryNodeId == "entry1" && r.TotalLatencyMs == 45); // 10 + 15 + 20
        results.Should().Contain(r => r.EntryNodeId == "entry2" && r.TotalLatencyMs == 35); // 5 + 10 + 20
    }

    /// <summary>
    /// Test case 5: Single node without edges
    /// Edge case - chỉ có 1 node entry point
    /// </summary>
    [Fact]
    public async Task CalculateLongestPath_WithSingleNode_ShouldReturnNodeLatency()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("single", "Single", new NodeMetadata("Single", "EntryPoint", new NodeSpecs(42, 1000, 0.99), Simulation: new SimulationProps(42, 0.001)))
            ],
            Edges = []
        };

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        var result = results.First();
        result.TotalLatencyMs.Should().Be(42, "chỉ có latency của node duy nhất");
        result.Path.Should().HaveCount(1);
        result.Path.First().Should().Be("single");
    }

    /// <summary>
    /// Test case 6: CalculateLongestPathFromNodeAsync - Specific node
    /// </summary>
    [Fact]
    public async Task CalculateLongestPathFromNode_WithValidNode_ShouldReturnPath()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("start", "Start", new NodeMetadata("Start", "EntryPoint", new NodeSpecs(5, 1000, 0.99), Simulation: new SimulationProps(5, 0.001))),
                new NodeModel("end", "End", new NodeMetadata("End", "Compute", new NodeSpecs(10, 1000, 0.99), Simulation: new SimulationProps(10, 0.001)))
            ],
            Edges =
            [
                new EdgeModel("e1", "start", "end", "default", new EdgeData("HTTP", NetworkLatency: 8))
            ]
        };

        // Act
        var result = await _simulationEngine.CalculateLongestPathFromNodeAsync(request, "start");

        // Assert
        result.Should().NotBeNull();
        result!.EntryNodeId.Should().Be("start");
        result.EndNodeId.Should().Be("end");
        result.TotalLatencyMs.Should().Be(23); // 5 + 8 + 10
    }

    /// <summary>
    /// Test case 7: CalculateLongestPathFromNodeAsync - Invalid node
    /// </summary>
    [Fact]
    public async Task CalculateLongestPathFromNode_WithInvalidNode_ShouldReturnNull()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes = [new NodeModel("node1", "Node", new NodeMetadata("Node1", "Compute", new NodeSpecs(5, 1000, 0.99), Simulation: new SimulationProps(5, 0.001)))],
            Edges = []
        };

        // Act
        var result = await _simulationEngine.CalculateLongestPathFromNodeAsync(request, "nonexistent");

        // Assert
        result.Should().BeNull("node không tồn tại");
    }

    /// <summary>
    /// Test case 8: Complex graph - Diamond pattern
    ///     Entry
    ///    /     \
    ///   A       B
    ///    \     /
    ///     End
    /// </summary>
    [Fact]
    public async Task CalculateLongestPath_WithDiamondPattern_ShouldSelectLongestBranch()
    {
        // Arrange
        var request = new SimulationRequest
        {
            Nodes =
            [
                new NodeModel("entry", "Entry", new NodeMetadata("Entry", "EntryPoint", new NodeSpecs(10, 1000, 0.99), Simulation: new SimulationProps(10, 0.001))),
                new NodeModel("nodeA", "Fast", new NodeMetadata("Fast", "Compute", new NodeSpecs(5, 1000, 0.99), Simulation: new SimulationProps(5, 0.001))),
                new NodeModel("nodeB", "Slow", new NodeMetadata("Slow", "Compute", new NodeSpecs(30, 1000, 0.99), Simulation: new SimulationProps(30, 0.001))),
                new NodeModel("end", "End", new NodeMetadata("End", "Compute", new NodeSpecs(15, 1000, 0.99), Simulation: new SimulationProps(15, 0.001)))
            ],
            Edges =
            [
                new EdgeModel("e1", "entry", "nodeA", "default", new EdgeData("HTTP", NetworkLatency: 2)),
                new EdgeModel("e2", "entry", "nodeB", "default", new EdgeData("HTTP", NetworkLatency: 3)),
                new EdgeModel("e3", "nodeA", "end", "default", new EdgeData("HTTP", NetworkLatency: 4)),
                new EdgeModel("e4", "nodeB", "end", "default", new EdgeData("HTTP", NetworkLatency: 5))
            ]
        };

        // Path A: entry(10) + e1(2) + nodeA(5) + e3(4) + end(15) = 36
        // Path B: entry(10) + e2(3) + nodeB(30) + e4(5) + end(15) = 63
        // Expected: Path B (longest)

        // Act
        var results = await _simulationEngine.CalculateLongestPathsAsync(request);

        // Assert
        var result = results.First();
        result.TotalLatencyMs.Should().Be(63, "path qua nodeB dài nhất");
        result.Path.Should().BeEquivalentTo(new[] { "entry", "nodeB", "end" });
    }
}
