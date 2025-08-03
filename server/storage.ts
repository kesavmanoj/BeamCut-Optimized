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
    // Process multiple configurations within the specified ranges
    const results = [];
    const { masterRollLengthRange, materialCostRange } = request;
    
    // Generate configurations to test
    const configurations = [];
    for (let length = masterRollLengthRange.min; length <= masterRollLengthRange.max; length += masterRollLengthRange.step) {
      if (materialCostRange) {
        for (let cost = materialCostRange.min; cost <= materialCostRange.max; cost += materialCostRange.step) {
          configurations.push({ masterRollLength: length, materialCost: cost });
        }
      } else {
        configurations.push({ masterRollLength: length, materialCost: undefined });
      }
    }

    // For demo purposes, return mock data structure
    // In production, this would run actual optimizations for each configuration
    const mockResults = configurations.slice(0, 5).map((config, index) => {
      const efficiency = 85 + Math.random() * 15;
      return {
        masterRollLength: config.masterRollLength,
        materialCost: config.materialCost,
        optimization: {
          totalRolls: Math.ceil(Math.random() * 30 + 20),
          efficiency,
          wastePercentage: 100 - efficiency,
          totalWaste: (100 - efficiency) * config.masterRollLength / 100,
          patterns: [],
          cuttingInstructions: [],
          algorithmSteps: [],
          performance: {
            executionTime: Math.random() * 2 + 0.5,
            memoryUsage: Math.random() * 50 + 20,
            patternsEvaluated: Math.floor(Math.random() * 200 + 50),
            iterations: Math.floor(Math.random() * 50 + 10),
            convergence: "optimal" as const
          }
        }
      };
    });

    const bestResult = mockResults.reduce((best, current) => 
      current.optimization.efficiency > best.optimization.efficiency ? current : best
    );

    return {
      results: mockResults,
      bestConfiguration: bestResult,
      summary: {
        totalConfigurations: configurations.length,
        bestEfficiency: Math.max(...mockResults.map(r => r.optimization.efficiency)),
        worstEfficiency: Math.min(...mockResults.map(r => r.optimization.efficiency)),
        averageEfficiency: mockResults.reduce((sum, r) => sum + r.optimization.efficiency, 0) / mockResults.length,
        executionTime: configurations.length * 0.8
      }
    };
  }
}

export const storage = new MemStorage();
