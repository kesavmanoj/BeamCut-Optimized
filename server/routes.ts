import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizationRequestSchema, rangeOptimizationRequestSchema, insertProjectSchema, type OptimizationRequest, type OptimizationResult, type RangeOptimizationRequest } from "@shared/schema";
import { spawn } from "child_process";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Project management routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Range optimization route
  app.post("/api/optimize-range", async (req, res) => {
    try {
      const request = rangeOptimizationRequestSchema.parse(req.body);
      const result = await storage.processRangeOptimization(request);
      res.json(result);
    } catch (error) {
      console.error("Range optimization error:", error);
      res.status(500).json({ 
        message: "Range optimization failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Optimize cutting stock
  app.post("/api/optimize", async (req, res) => {
    try {
      const request = optimizationRequestSchema.parse(req.body);
      
      // Create optimization job
      const job = await storage.createOptimizationJob({
        masterRollLength: request.masterRollLength,
        materialCost: request.materialCost || 0,
        algorithm: request.algorithm,
        optimizationGoal: request.optimizationGoal,
        status: "processing",
        beamRequirements: request.beamRequirements,
        results: null,
        executionTime: null
      });

      // Run optimization algorithm
      try {
        const result = await runOptimizationAlgorithm(request);
        
        // Update job with results
        await storage.updateOptimizationJob(job.id, {
          status: "completed",
          results: result,
          executionTime: result.performance.executionTime,
          completedAt: new Date()
        });

        res.json(result);
      } catch (error) {
        await storage.updateOptimizationJob(job.id, {
          status: "error",
          completedAt: new Date()
        });
        throw error;
      }
    } catch (error) {
      console.error("Optimization error:", error);
      res.status(500).json({ 
        message: "Optimization failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get optimization job status
  app.get("/api/optimize/:id", async (req, res) => {
    try {
      const job = await storage.getOptimizationJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Optimization job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching optimization job:", error);
      res.status(500).json({ message: "Failed to fetch optimization job" });
    }
  });

  // Get example problems
  app.get("/api/examples", async (req, res) => {
    const examples = [
      {
        id: "furniture",
        name: "Furniture Manufacturing",
        description: "Standard furniture cuts: 50, 75, 100, 125mm",
        masterRollLength: 600,
        beamRequirements: [
          { length: 50, quantity: 8, priority: "normal" },
          { length: 75, quantity: 6, priority: "normal" },
          { length: 100, quantity: 4, priority: "high" },
          { length: 125, quantity: 3, priority: "normal" }
        ]
      },
      {
        id: "construction",
        name: "Construction Beams",
        description: "Heavy duty cuts: 200, 300, 400mm",
        masterRollLength: 1200,
        beamRequirements: [
          { length: 200, quantity: 5, priority: "high" },
          { length: 300, quantity: 3, priority: "normal" },
          { length: 400, quantity: 2, priority: "normal" }
        ]
      },
      {
        id: "custom",
        name: "Custom Fabrication",
        description: "Mixed lengths: 85, 120, 180, 250mm",
        masterRollLength: 800,
        beamRequirements: [
          { length: 85, quantity: 4, priority: "normal" },
          { length: 120, quantity: 3, priority: "high" },
          { length: 180, quantity: 2, priority: "normal" },
          { length: 250, quantity: 2, priority: "low" }
        ]
      }
    ];
    res.json(examples);
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function runOptimizationAlgorithm(request: OptimizationRequest): Promise<OptimizationResult> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "server", "cutting_stock_solver.py");
    const pythonProcess = spawn("python3", [pythonScript], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(outputData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse optimization result: ${error}`));
        }
      } else {
        reject(new Error(`Optimization algorithm failed with code ${code}: ${errorData}`));
      }
    });

    // Send input data to Python script
    pythonProcess.stdin.write(JSON.stringify(request));
    pythonProcess.stdin.end();
  });
}
