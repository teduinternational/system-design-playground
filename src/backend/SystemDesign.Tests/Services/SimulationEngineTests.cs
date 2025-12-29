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
                new SimulationNode
                {
                    Id = "client",
                    Type = "Client",
                    LatencyMs = 5,
                    IsEntryPoint = true
                },
                new SimulationNode
                {
                    Id = "server",
                    Type = "Server",
                    LatencyMs = 10
                },
                new SimulationNode
                {
                    Id = "database",
                    Type = "Database",
                    LatencyMs = 50
                }
            ],
            Edges =
            [
                new SimulationEdge
                {
                    Id = "e1",
                    Source = "client",
                    Target = "server",
                    LatencyMs = 15
                },
                new SimulationEdge
                {
                    Id = "e2",
                    Source = "server",
                    Target = "database",
                    LatencyMs = 20
                }
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
                new SimulationNode { Id = "n1", Type = "Node1", LatencyMs = 0, IsEntryPoint = true },
                new SimulationNode { Id = "n2", Type = "Node2", LatencyMs = 0 },
                new SimulationNode { Id = "n3", Type = "Node3", LatencyMs = 0 }
            ],
            Edges =
            [
                new SimulationEdge { Id = "e1", Source = "n1", Target = "n2", LatencyMs = 0 },
                new SimulationEdge { Id = "e2", Source = "n2", Target = "n3", LatencyMs = 0 }
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
                new SimulationNode { Id = "entry", Type = "Entry", LatencyMs = 5, IsEntryPoint = true },
                new SimulationNode { Id = "middle", Type = "Middle", LatencyMs = 10 },
                new SimulationNode { Id = "branch1", Type = "FastBranch", LatencyMs = 20 },
                new SimulationNode { Id = "branch2", Type = "SlowBranch", LatencyMs = 100 }
            ],
            Edges =
            [
                new SimulationEdge { Id = "e1", Source = "entry", Target = "middle", LatencyMs = 5 },
                new SimulationEdge { Id = "e2", Source = "middle", Target = "branch1", LatencyMs = 10 },
                new SimulationEdge { Id = "e3", Source = "middle", Target = "branch2", LatencyMs = 15 }
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
                new SimulationNode { Id = "entry1", Type = "Entry1", LatencyMs = 10, IsEntryPoint = true },
                new SimulationNode { Id = "entry2", Type = "Entry2", LatencyMs = 5, IsEntryPoint = true },
                new SimulationNode { Id = "end", Type = "End", LatencyMs = 20 }
            ],
            Edges =
            [
                new SimulationEdge { Id = "e1", Source = "entry1", Target = "end", LatencyMs = 15 },
                new SimulationEdge { Id = "e2", Source = "entry2", Target = "end", LatencyMs = 10 }
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
                new SimulationNode { Id = "single", Type = "Single", LatencyMs = 42, IsEntryPoint = true }
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
                new SimulationNode { Id = "start", Type = "Start", LatencyMs = 5 },
                new SimulationNode { Id = "end", Type = "End", LatencyMs = 10 }
            ],
            Edges =
            [
                new SimulationEdge { Id = "e1", Source = "start", Target = "end", LatencyMs = 8 }
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
            Nodes = [new SimulationNode { Id = "node1", Type = "Node", LatencyMs = 5 }],
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
                new SimulationNode { Id = "entry", Type = "Entry", LatencyMs = 10, IsEntryPoint = true },
                new SimulationNode { Id = "nodeA", Type = "Fast", LatencyMs = 5 },
                new SimulationNode { Id = "nodeB", Type = "Slow", LatencyMs = 30 },
                new SimulationNode { Id = "end", Type = "End", LatencyMs = 15 }
            ],
            Edges =
            [
                new SimulationEdge { Id = "e1", Source = "entry", Target = "nodeA", LatencyMs = 2 },
                new SimulationEdge { Id = "e2", Source = "entry", Target = "nodeB", LatencyMs = 3 },
                new SimulationEdge { Id = "e3", Source = "nodeA", Target = "end", LatencyMs = 4 },
                new SimulationEdge { Id = "e4", Source = "nodeB", Target = "end", LatencyMs = 5 }
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
