import { spawn } from "child_process";
import path from "path";
import type { OptimizationRequest, OptimizationResult } from "@shared/schema";

export async function runOptimizationAlgorithm(request: OptimizationRequest): Promise<OptimizationResult> {
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