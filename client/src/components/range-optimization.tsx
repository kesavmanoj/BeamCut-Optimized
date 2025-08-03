import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Settings, PlayCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rangeOptimizationRequestSchema, type RangeOptimizationRequest, type RangeOptimizationResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RangeOptimizationProps {
  beamRequirements: Array<{
    length: number;
    quantity: number;
    priority: "low" | "normal" | "high";
  }>;
  onComplete?: (result: RangeOptimizationResult) => void;
}

// Utility functions for formatting
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function RangeOptimization({ beamRequirements, onComplete }: RangeOptimizationProps) {
  const [results, setResults] = useState<RangeOptimizationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<RangeOptimizationRequest>({
    resolver: zodResolver(rangeOptimizationRequestSchema),
    defaultValues: {
      masterRollLengthRange: {
        min: 2000,
        max: 6000,
        step: 100
      },
      algorithm: "column_generation",
      optimizationGoal: "minimize_waste",
      beamRequirements: beamRequirements
    }
  });

  const rangeOptimizationMutation = useMutation({
    mutationFn: async (data: RangeOptimizationRequest) => {
      const response = await apiRequest("/api/optimize-range", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (result: RangeOptimizationResult) => {
      setResults(result);
      onComplete?.(result);
      toast({
        title: "Range optimization completed",
        description: `Analyzed ${result.summary.totalConfigurations} configurations. Best efficiency: ${result.summary.bestEfficiency.toFixed(2)}%`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization failed",
        description: "Failed to complete range optimization. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RangeOptimizationRequest) => {
    setResults(null);
    rangeOptimizationMutation.mutate(data);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Range Optimization Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Master Roll Length Range */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Master Roll Length Range</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="masterRollLengthRange.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min (mm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="masterRollLengthRange.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max (mm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="masterRollLengthRange.step"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step (mm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Configuration Space */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Analysis Configuration</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600">
                      The range analysis will test different master roll lengths to find the optimal configuration for your beam requirements.
                      Each configuration will be optimized and compared to identify the most efficient solution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="algorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Algorithm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="column_generation">Column Generation</SelectItem>
                          <SelectItem value="first_fit_decreasing">First Fit Decreasing</SelectItem>
                          <SelectItem value="best_fit_decreasing">Best Fit Decreasing</SelectItem>
                          <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="optimizationGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optimization Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minimize_waste">Minimize Waste</SelectItem>
                          <SelectItem value="minimize_rolls">Minimize Rolls</SelectItem>
                          <SelectItem value="minimize_cost">Minimize Cost</SelectItem>
                          <SelectItem value="balance_all">Balance All</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={rangeOptimizationMutation.isPending}
                  className="min-w-[200px]"
                >
                  {rangeOptimizationMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Run Range Optimization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Configurations</p>
                    <p className="text-2xl font-bold">{results.summary.totalConfigurations}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Best Efficiency</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(results.summary.bestEfficiency)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg Efficiency</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(results.summary.averageEfficiency)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Execution Time</p>
                    <p className="text-2xl font-bold">
                      {results.summary.executionTime.toFixed(1)}s
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Best Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Parameters</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Master Roll Length:</span>
                      <span className="font-medium">{results.bestConfiguration.masterRollLength}mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Configuration:</span>
                      <Badge className="bg-blue-100 text-blue-800">Optimal</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Efficiency:</span>
                      <Badge className="bg-green-100 text-green-800">
                        {formatPercentage(results.bestConfiguration.optimization.efficiency)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Rolls:</span>
                      <span className="font-medium">{results.bestConfiguration.optimization.totalRolls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Waste:</span>
                      <span className="font-medium">{formatPercentage(results.bestConfiguration.optimization.wastePercentage)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Efficiency Distribution</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Best</span>
                        <span>{formatPercentage(results.summary.bestEfficiency)}</span>
                      </div>
                      <Progress value={results.summary.bestEfficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average</span>
                        <span>{formatPercentage(results.summary.averageEfficiency)}</span>
                      </div>
                      <Progress value={results.summary.averageEfficiency} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Worst</span>
                        <span>{formatPercentage(results.summary.worstEfficiency)}</span>
                      </div>
                      <Progress value={results.summary.worstEfficiency} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Detailed Results</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Roll Length</th>
                      <th className="text-left p-2">Efficiency</th>
                      <th className="text-left p-2">Total Rolls</th>
                      <th className="text-left p-2">Waste %</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-medium">{result.masterRollLength}mm</td>
                        <td className="p-2">
                          <Badge 
                            variant={result.optimization.efficiency >= 95 ? "default" : "secondary"}
                            className={result.optimization.efficiency >= 95 ? "bg-green-100 text-green-800" : ""}
                          >
                            {formatPercentage(result.optimization.efficiency)}
                          </Badge>
                        </td>
                        <td className="p-2">{result.optimization.totalRolls}</td>
                        <td className="p-2">{formatPercentage(result.optimization.wastePercentage)}</td>
                        <td className="p-2">
                          {result.masterRollLength === results.bestConfiguration.masterRollLength ? (
                            <Badge className="bg-green-100 text-green-800">Best</Badge>
                          ) : (
                            <Badge variant="secondary">Analyzed</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}