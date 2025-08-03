export interface BeamRequirement {
  length: number;
  quantity: number;
  priority: "low" | "normal" | "high";
}

export interface OptimizationRequest {
  masterRollLength: number;
  materialCost?: number;
  algorithm: "column_generation" | "first_fit_decreasing" | "best_fit_decreasing" | "hybrid";
  optimizationGoal: "minimize_waste" | "minimize_rolls" | "minimize_cost" | "balance_all";
  beamRequirements: BeamRequirement[];
}

export interface CuttingPattern {
  id: string;
  cuts: Array<{
    length: number;
    quantity: number;
  }>;
  totalLength: number;
  waste: number;
  rollsUsed: number;
}

export interface CuttingInstruction {
  step: number;
  description: string;
  pattern: string;
  rollsCount: number;
}

export interface AlgorithmStep {
  step: number;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  duration?: number;
  details?: string;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  patternsEvaluated: number;
  iterations: number;
  convergence: "optimal" | "near_optimal" | "timeout" | "error";
}

export interface OptimizationResult {
  totalRolls: number;
  efficiency: number;
  wastePercentage: number;
  totalWaste: number;
  costSavings?: number;
  patterns: CuttingPattern[];
  cuttingInstructions: CuttingInstruction[];
  algorithmSteps: AlgorithmStep[];
  performance: PerformanceMetrics;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  masterRollLength: number;
  beamRequirements: BeamRequirement[];
}
