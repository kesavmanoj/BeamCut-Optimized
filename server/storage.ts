import { type BeamRequirement, type InsertBeamRequirement, type OptimizationJob, type InsertOptimizationJob, type OptimizationRequest, type OptimizationResult, type Project, type InsertProject, type RangeOptimizationRequest, type RangeOptimizationResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Beam requirements
  getBeamRequirement(id: string): Promise<BeamRequirement | undefined>;
  createBeamRequirement(requirement: InsertBeamRequirement): Promise<BeamRequirement>;
  deleteBeamRequirement(id: string): Promise<void>;
  
  // Optimization jobs
  getOptimizationJob(id: string): Promise<OptimizationJob | undefined>;
  getOptimizationJobs(projectId?: string): Promise<OptimizationJob[]>;
  createOptimizationJob(job: InsertOptimizationJob): Promise<OptimizationJob>;
  updateOptimizationJob(id: string, updates: Partial<OptimizationJob>): Promise<OptimizationJob | undefined>;
  
  // Optimization processing
  processOptimization(request: OptimizationRequest): Promise<OptimizationResult>;
  processRangeOptimization(request: RangeOptimizationRequest): Promise<RangeOptimizationResult>;
  processRangeOptimizationWithProgress(
    request: RangeOptimizationRequest, 
    progressCallback: (progress: { completed: number; total: number; currentConfiguration: number }) => void
  ): Promise<RangeOptimizationResult>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private beamRequirements: Map<string, BeamRequirement>;
  private optimizationJobs: Map<string, OptimizationJob>;

  constructor() {
    this.projects = new Map();
    this.beamRequirements = new Map();
    this.optimizationJobs = new Map();
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOptimizationId: null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async getBeamRequirement(id: string): Promise<BeamRequirement | undefined> {
    return this.beamRequirements.get(id);
  }

  async createBeamRequirement(requirement: InsertBeamRequirement): Promise<BeamRequirement> {
    const id = randomUUID();
    const beamRequirement: BeamRequirement = { 
      ...requirement, 
      id,
      createdAt: new Date()
    };
    this.beamRequirements.set(id, beamRequirement);
    return beamRequirement;
  }

  async deleteBeamRequirement(id: string): Promise<void> {
    this.beamRequirements.delete(id);
  }

  async getOptimizationJob(id: string): Promise<OptimizationJob | undefined> {
    return this.optimizationJobs.get(id);
  }

  async getOptimizationJobs(projectId?: string): Promise<OptimizationJob[]> {
    const jobs = Array.from(this.optimizationJobs.values());
    if (projectId) {
      return jobs.filter(job => (job as any).projectId === projectId);
    }
    return jobs;
  }

  async createOptimizationJob(job: InsertOptimizationJob): Promise<OptimizationJob> {
    const id = randomUUID();
    const optimizationJob: OptimizationJob = { 
      ...job, 
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.optimizationJobs.set(id, optimizationJob);
    return optimizationJob;
  }

  async updateOptimizationJob(id: string, updates: Partial<OptimizationJob>): Promise<OptimizationJob | undefined> {
    const job = this.optimizationJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.optimizationJobs.set(id, updatedJob);
    return updatedJob;
  }

  async processOptimization(request: OptimizationRequest): Promise<OptimizationResult> {
    // This will be implemented to call the Python optimization algorithm
    // For now, return a placeholder structure that will be replaced with real results
    return {
      totalRolls: 0,
      efficiency: 0,
      wastePercentage: 0,
      totalWaste: 0,
      patterns: [],
      cuttingInstructions: [],
      algorithmSteps: [],
      performance: {
        executionTime: 0,
        memoryUsage: 0,
        patternsEvaluated: 0,
        iterations: 0,
        convergence: "optimal"
      }
    };
  }

  async processRangeOptimization(request: RangeOptimizationRequest): Promise<RangeOptimizationResult> {
    const { masterRollLengthRange, beamRequirements, algorithm = "column_generation", optimizationGoal = "minimize_waste" } = request;
    const startTime = Date.now();
    
    // Generate configurations to test
    const configurations = [];
    for (let length = masterRollLengthRange.min; length <= masterRollLengthRange.max; length += masterRollLengthRange.step) {
      configurations.push({ masterRollLength: length });
    }

    // Import runOptimizationAlgorithm function
    const { runOptimizationAlgorithm } = await import('./optimization-utils');
    
    // Run actual optimization for each configuration
    const results = [];
    for (const config of configurations) {
      try {
        const optimizationRequest = {
          masterRollLength: config.masterRollLength,
          beamRequirements,
          algorithm,
          optimizationGoal,
          materialCost: request.materialCost
        };
        
        const optimization = await runOptimizationAlgorithm(optimizationRequest);
        
        // Only include successful optimizations (those without errors)
        if (!optimization.error) {
          results.push({
            masterRollLength: config.masterRollLength,
            optimization
          });
        } else {
          console.log(`Skipping configuration ${config.masterRollLength}mm due to error: ${optimization.error}`);
        }
      } catch (error) {
        console.error(`Range optimization failed for length ${config.masterRollLength}:`, error);
        // Continue with other configurations even if one fails
      }
    }

    // Only proceed if we have valid results
    if (results.length === 0) {
      throw new Error("No valid configurations found. Please check that master roll lengths are larger than the longest beam requirement.");
    }

    // Find best configuration
    const bestResult = results.reduce((best, current) => {
      if (!best) return current;
      
      // Choose based on optimization goal
      switch (optimizationGoal) {
        case "minimize_waste":
          return current.optimization.wastePercentage < best.optimization.wastePercentage ? current : best;
        case "minimize_rolls":
          return current.optimization.totalRolls < best.optimization.totalRolls ? current : best;
        case "minimize_cost":
          return current.optimization.totalWaste < best.optimization.totalWaste ? current : best;
        case "balance_all":
        default:
          return current.optimization.efficiency > best.optimization.efficiency ? current : best;
      }
    });

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      results,
      bestConfiguration: bestResult,
      summary: {
        totalConfigurations: results.length, // Only count valid configurations
        bestEfficiency: Math.max(...results.map(r => r.optimization.efficiency)),
        worstEfficiency: Math.min(...results.map(r => r.optimization.efficiency)),
        averageEfficiency: results.reduce((sum, r) => sum + r.optimization.efficiency, 0) / results.length,
        executionTime
      }
    };
  }

  async processRangeOptimizationWithProgress(
    request: RangeOptimizationRequest, 
    progressCallback: (progress: { completed: number; total: number; currentConfiguration: number }) => void
  ): Promise<RangeOptimizationResult> {
    const { masterRollLengthRange, beamRequirements, algorithm = "column_generation", optimizationGoal = "minimize_waste" } = request;
    const startTime = Date.now();
    
    // Generate configurations to test
    const configurations = [];
    for (let length = masterRollLengthRange.min; length <= masterRollLengthRange.max; length += masterRollLengthRange.step) {
      configurations.push({ masterRollLength: length });
    }

    // Import runOptimizationAlgorithm function
    const { runOptimizationAlgorithm } = await import('./optimization-utils');
    
    // Run actual optimization for each configuration
    const results = [];
    let completed = 0;
    
    for (const config of configurations) {
      // Send progress update
      progressCallback({
        completed,
        total: configurations.length,
        currentConfiguration: config.masterRollLength
      });
      
      try {
        const optimizationRequest = {
          masterRollLength: config.masterRollLength,
          beamRequirements,
          algorithm,
          optimizationGoal,
          materialCost: request.materialCost
        };
        
        const optimization = await runOptimizationAlgorithm(optimizationRequest);
        
        // Only include successful optimizations (those without errors)
        if (!optimization.error) {
          results.push({
            masterRollLength: config.masterRollLength,
            optimization
          });
        } else {
          console.log(`Skipping configuration ${config.masterRollLength}mm due to error: ${optimization.error}`);
        }
      } catch (error) {
        console.error(`Range optimization failed for length ${config.masterRollLength}:`, error);
        // Continue with other configurations even if one fails
      }
      
      completed++;
    }

    // Only proceed if we have valid results
    if (results.length === 0) {
      throw new Error("No valid configurations found. Please check that master roll lengths are larger than the longest beam requirement.");
    }

    // Find best configuration
    const bestResult = results.reduce((best, current) => {
      if (!best) return current;
      
      // Choose based on optimization goal
      switch (optimizationGoal) {
        case "minimize_waste":
          return current.optimization.wastePercentage < best.optimization.wastePercentage ? current : best;
        case "minimize_rolls":
          return current.optimization.totalRolls < best.optimization.totalRolls ? current : best;
        case "minimize_cost":
          return current.optimization.totalWaste < best.optimization.totalWaste ? current : best;
        case "balance_all":
        default:
          return current.optimization.efficiency > best.optimization.efficiency ? current : best;
      }
    });

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      results,
      bestConfiguration: bestResult,
      summary: {
        totalConfigurations: results.length, // Only count valid configurations
        bestEfficiency: Math.max(...results.map(r => r.optimization.efficiency)),
        worstEfficiency: Math.min(...results.map(r => r.optimization.efficiency)),
        averageEfficiency: results.reduce((sum, r) => sum + r.optimization.efficiency, 0) / results.length,
        executionTime
      }
    };
  }
}

export const storage = new MemStorage();
