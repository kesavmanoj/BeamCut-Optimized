import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sliders, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OptimizationRequest, OptimizationResult } from "@shared/schema";
import type { BeamRequirement } from "./beam-requirements-input";

const optimizationFormSchema = z.object({
  masterRollLength: z.number().min(1, "Roll length must be positive"),
  materialCost: z.number().optional(),
  algorithm: z.enum(["column_generation", "first_fit_decreasing", "best_fit_decreasing", "hybrid"]).default("column_generation"),
  optimizationGoal: z.enum(["minimize_waste", "minimize_rolls", "minimize_cost", "balance_all"]).default("minimize_waste")
});

type OptimizationForm = z.infer<typeof optimizationFormSchema>;

interface OptimizationConfigProps {
  beamRequirements: BeamRequirement[];
  onOptimizationStart: () => void;
  onOptimizationComplete: (result: OptimizationResult) => void;
}

export function OptimizationConfig({ beamRequirements, onOptimizationStart, onOptimizationComplete }: OptimizationConfigProps) {
  const { toast } = useToast();

  const form = useForm<OptimizationForm>({
    resolver: zodResolver(optimizationFormSchema),
    defaultValues: {
      masterRollLength: 600,
      materialCost: 25.00,
      algorithm: "column_generation",
      optimizationGoal: "minimize_waste"
    }
  });

  const optimizationMutation = useMutation({
    mutationFn: async (data: OptimizationRequest) => {
      const response = await apiRequest("/api/optimize", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json() as Promise<OptimizationResult>;
    },
    onSuccess: (result) => {
      onOptimizationComplete(result);
      toast({
        title: "Optimization Complete",
        description: `Found optimal solution using ${result.totalRolls} rolls with ${result.efficiency}% efficiency`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: OptimizationForm) => {
    if (beamRequirements.length === 0) {
      toast({
        title: "No Beam Requirements",
        description: "Please add at least one beam requirement before optimizing",
        variant: "destructive",
      });
      return;
    }

    const hasValidRequirements = beamRequirements.some(req => req.length > 0 && req.quantity > 0);
    if (!hasValidRequirements) {
      toast({
        title: "Invalid Beam Requirements",
        description: "Please ensure all beam requirements have valid length and quantity values",
        variant: "destructive",
      });
      return;
    }

    onOptimizationStart();
    optimizationMutation.mutate({
      ...data,
      beamRequirements: beamRequirements
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Sliders className="text-primary mr-3" />
            Optimization Configuration
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Master Roll Configuration */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Master Roll Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="masterRollLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Length <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" placeholder="600" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                          <span className="absolute right-3 top-2 text-sm text-slate-500">mm</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="materialCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Cost per Roll</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-sm text-slate-500">$</span>
                          <Input type="number" step="0.01" placeholder="25.00" className="pl-8" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Advanced Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="algorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Algorithm</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                            <SelectValue />
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
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-700"
                disabled={optimizationMutation.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                {optimizationMutation.isPending ? "Optimizing..." : "Start Single Optimization"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}