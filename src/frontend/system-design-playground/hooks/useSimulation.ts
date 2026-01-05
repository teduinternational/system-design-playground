import { useState, useCallback } from 'react';
import { simulationApi, runApi, scenarioApi } from '../services/api';
import { toast } from '../components/Toast';
import { RunStatus } from '../services/types/run-status.types';
import type { 
  SimulationRequest, 
  AnalyzeResponse,
  CreateRunDto,
  PercentileSimulationResult
} from '../services/types/simulation.types';

interface UseSimulationOptions {
  diagramId?: string;
  onSimulationStart?: () => void;
  onSimulationComplete?: (result: AnalyzeResponse, percentileResult?: PercentileSimulationResult) => void;
  onSimulationError?: (error: Error) => void;
}

/**
 * Custom hook to manage simulation flow
 * Integrates with SimulationEngine and RunEndpoints
 */
export function useSimulation(options: UseSimulationOptions = {}) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<AnalyzeResponse | null>(null);
  const [percentileResult, setPercentileResult] = useState<PercentileSimulationResult | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  /**
   * Run simulation - analyze diagram and save run history
   */
  const runSimulation = useCallback(async (request: SimulationRequest) => {
    try {
      setIsSimulating(true);
      options.onSimulationStart?.();
      
      // Step 1: Analyze the diagram using SimulationEngine
      toast.info('Analyzing system architecture...');
      const analysisResult = await simulationApi.analyze(request);
      
      setSimulationResult(analysisResult);
      
      // Step 1.5: Run percentile simulation if entry point exists
      let percentileSimResult: PercentileSimulationResult | undefined;
      
      // Find first entry point for percentile simulation
      const entryNode = request.nodes.find(n => n.isEntryPoint);
      console.log('🔍 Entry node found:', entryNode);
      
      if (entryNode) {
        try {
          console.log('📊 Calling percentile simulation for node:', entryNode.id);
          toast.info('Running percentile analysis with 1000 simulations...');
          percentileSimResult = await simulationApi.simulateWithPercentiles(entryNode.id, request);
          console.log('✅ Percentile simulation result:', percentileSimResult);
          setPercentileResult(percentileSimResult);
        } catch (error) {
          console.warn('⚠️ Failed to run percentile simulation:', error);
          // Continue without percentile results
        }
      } else {
        console.warn('⚠️ No entry node found for percentile simulation');
      }
      
      // Step 2: Get or create a scenario for this diagram
      let scenarioId: string | undefined;
      
      if (options.diagramId) {
        try {
          // Try to get latest scenario for this diagram
          const scenarios = await scenarioApi.getByDiagram(options.diagramId);
          
          if (scenarios.length > 0) {
            // Use latest scenario
            scenarioId = scenarios[0].id;
          } else {
            // Create a new scenario if none exists
            const newScenario = await scenarioApi.create(options.diagramId, {
              name: 'Auto-generated Baseline',
              versionTag: 'v1.0.0',
              contentJson: JSON.stringify(request),
              changeLog: 'Initial simulation run',
              isSnapshot: true,
            });
            scenarioId = newScenario.id;
          }
        } catch (error) {
          console.warn('Failed to get/create scenario:', error);
        }
      }
      
      // Step 3: Create a Run record to track this simulation
      if (scenarioId) {
        const runDto: CreateRunDto = {
          scenarioId,
          runName: `Simulation ${new Date().toLocaleString()}`,
          environmentParams: JSON.stringify({
            totalNodes: analysisResult.systemOverview.totalNodes,
            totalEdges: analysisResult.systemOverview.totalEdges,
            entryPoints: analysisResult.systemOverview.entryPointsCount,
          }),
        };
        
        const run = await runApi.create(runDto);
        setCurrentRunId(run.id);
        
        // Step 4: Update run with simulation results
        await runApi.updateStatus(run.id, {
          status: RunStatus.Completed,
          averageLatencyMs: analysisResult.statistics.averagePathLatencyMs,
          successfulRequests: analysisResult.statistics.totalPaths,
          failedRequests: 0,
          errorRate: 0,
          resultJson: JSON.stringify(analysisResult),
        });
        
        toast.success('Simulation completed successfully!');
      } else {
        toast.success('Analysis completed!');
      }
      
      options.onSimulationComplete?.(analysisResult, percentileSimResult);
      
      return analysisResult;
    } catch (error) {
      console.error('Simulation failed:', error);
      toast.error('Simulation failed. Please try again.');
      options.onSimulationError?.(error as Error);
      
      // If we created a run, mark it as failed
      if (currentRunId) {
        try {
          await runApi.updateStatus(currentRunId, {
            status: RunStatus.Failed,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          });
        } catch (updateError) {
          console.error('Failed to update run status:', updateError);
        }
      }
      
      throw error;
    } finally {
      setIsSimulating(false);
    }
  }, [options, currentRunId]);

  /**
   * Get run history for current scenario
   */
  const getRunHistory = useCallback(async (scenarioId: string) => {
    try {
      return await runApi.getByScenario(scenarioId);
    } catch (error) {
      console.error('Failed to get run history:', error);
      toast.error('Failed to load run history');
      return [];
    }
  }, []);

  return {
    isSimulating,
    simulationResult,
    percentileResult,
    currentRunId,
    runSimulation,
    getRunHistory,
  };
}
