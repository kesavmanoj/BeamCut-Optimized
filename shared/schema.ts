import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const beamRequirements = pgTable("beam_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  length: integer("length").notNull(),
  quantity: integer("quantity").notNull(),
  priority: text("priority").notNull().default("normal"),
  createdAt: timestamp("created_at").defaultNow()
});

export const optimizationJobs = pgTable("optimization_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  masterRollLength: integer("master_roll_length").notNull(),
  materialCost: real("material_cost"),
  algorithm: text("algorithm").notNull().default("column_generation"),
  optimizationGoal: text("optimization_goal").notNull().default("minimize_waste"),
  status: text("status").notNull().default("pending"),
  beamRequirements: jsonb("beam_requirements").notNull(),
  results: jsonb("results"),
  executionTime: real("execution_time"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

export const insertBeamRequirementSchema = createInsertSchema(beamRequirements).omit({
  id: true,
  createdAt: true
});

export const insertOptimizationJobSchema = createInsertSchema(optimizationJobs).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

export type BeamRequirement = typeof beamRequirements.$inferSelect;
export type InsertBeamRequirement = z.infer<typeof insertBeamRequirementSchema>;
export type OptimizationJob = typeof optimizationJobs.$inferSelect;
export type InsertOptimizationJob = z.infer<typeof insertOptimizationJobSchema>;

// Frontend types for optimization
export const optimizationRequestSchema = z.object({
  masterRollLength: z.number().min(1),
  materialCost: z.number().optional(),
  algorithm: z.enum(["column_generation", "first_fit_decreasing", "best_fit_decreasing", "hybrid"]).default("column_generation"),
  optimizationGoal: z.enum(["minimize_waste", "minimize_rolls", "minimize_cost", "balance_all"]).default("minimize_waste"),
  beamRequirements: z.array(z.object({
    length: z.number().min(1),
    quantity: z.number().min(1),
    priority: z.enum(["low", "normal", "high"]).default("normal")
  })).min(1)
});

export type OptimizationRequest = z.infer<typeof optimizationRequestSchema>;

export const optimizationResultSchema = z.object({
  totalRolls: z.number(),
  efficiency: z.number(),
  wastePercentage: z.number(),
  totalWaste: z.number(),
  costSavings: z.number().optional(),
  patterns: z.array(z.object({
    id: z.string(),
    cuts: z.array(z.object({
      length: z.number(),
      quantity: z.number()
    })),
    totalLength: z.number(),
    waste: z.number(),
    rollsUsed: z.number()
  })),
  cuttingInstructions: z.array(z.object({
    step: z.number(),
    description: z.string(),
    pattern: z.string(),
    rollsCount: z.number()
  })),
  algorithmSteps: z.array(z.object({
    step: z.number(),
    name: z.string(),
    description: z.string(),
    status: z.enum(["pending", "processing", "completed", "error"]),
    duration: z.number().optional(),
    details: z.string().optional()
  })),
  performance: z.object({
    executionTime: z.number(),
    memoryUsage: z.number(),
    patternsEvaluated: z.number(),
    iterations: z.number(),
    convergence: z.enum(["optimal", "near_optimal", "timeout", "error"])
  })
});

export type OptimizationResult = z.infer<typeof optimizationResultSchema>;
