import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { OptimizationResult } from "@/lib/types";

interface AlgorithmVisualizationProps {
  steps: OptimizationResult["algorithmSteps"];
  performance?: OptimizationResult["performance"];
}

export function AlgorithmVisualization({ steps, performance }: AlgorithmVisualizationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!steps.length) return;
    
    const completedSteps = steps.filter(step => step.status === "completed").length;
    const totalSteps = Math.max(steps.length, 5); // Assume 5 total steps
    const newProgress = (completedSteps / totalSteps) * 100;
    
    setProgress(newProgress);
  }, [steps]);

  const getStepIcon = (status: string, step: number) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "processing":
        return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <span className="text-sm font-medium text-white">{step}</span>;
    }
  };

  const getStepBgColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-slate-300";
    }
  };

  const getStepBorderColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "processing":
        return "border-blue-200 bg-blue-50";
      case "error":
        return "border-red-200 bg-red-50";
      default:
        return "border-slate-200 bg-slate-50 opacity-60";
    }
  };

  return (
    <Card id="algorithm-progress">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="text-primary mr-3" />
          Algorithm Execution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Optimization Progress</span>
            <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full h-2" />
        </div>

        {/* Algorithm Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg border ${getStepBorderColor(step.status)}`}>
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${getStepBgColor(step.status)} text-white rounded-full flex items-center justify-center`}>
                  {getStepIcon(step.status, step.step)}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{step.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                {step.duration && (
                  <div className="text-xs text-slate-500 mt-2">
                    Completed in {step.duration}s
                  </div>
                )}
                {step.details && (
                  <div className="text-xs text-slate-500 mt-1">{step.details}</div>
                )}
              </div>
            </div>
          ))}

          {/* Placeholder steps if not enough completed */}
          {steps.length < 5 && (
            <>
              {steps.length < 3 && (
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 bg-slate-50 opacity-60">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-300 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Pricing Subproblem</h4>
                    <p className="text-sm text-slate-600 mt-1">Solve knapsack problem to find new promising patterns</p>
                  </div>
                </div>
              )}
              
              {steps.length < 4 && (
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 bg-slate-50 opacity-60">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-300 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">4</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Pattern Generation & Convergence</h4>
                    <p className="text-sm text-slate-600 mt-1">Add new patterns and check convergence criteria</p>
                  </div>
                </div>
              )}
              
              {steps.length < 5 && (
                <div className="flex items-start space-x-4 p-4 rounded-lg border border-slate-200 bg-slate-50 opacity-60">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-slate-300 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">5</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">Integer Solution</h4>
                    <p className="text-sm text-slate-600 mt-1">Solve final integer programming problem for optimal cutting plan</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Real-time Metrics */}
        {performance && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-slate-700">Current Iteration</div>
              <div className="text-2xl font-bold text-slate-900">{performance.iterations}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-slate-700">Patterns Generated</div>
              <div className="text-2xl font-bold text-slate-900">{performance.patternsEvaluated}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm font-medium text-slate-700">Execution Time</div>
              <div className="text-2xl font-bold text-slate-900">{performance.executionTime}s</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
