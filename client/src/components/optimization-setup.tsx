import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sliders, Trash2, Plus, Upload, RotateCcw, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OptimizationRequest, OptimizationResult } from "@/lib/types";

const beamRequirementSchema = z.object({
  length: z.number().min(1, "Length must be positive"),
  quantity: z.number().min(1, "Quantity must be positive"),
  priority: z.enum(["low", "normal", "high"]).default("normal")
});

const optimizationFormSchema = z.object({
  masterRollLength: z.number().min(1, "Roll length must be positive"),
  materialCost: z.number().optional(),
  algorithm: z.enum(["column_generation", "first_fit_decreasing", "best_fit_decreasing", "hybrid"]).default("column_generation"),
  optimizationGoal: z.enum(["minimize_waste", "minimize_rolls", "minimize_cost", "balance_all"]).default("minimize_waste"),
  beamRequirements: z.array(beamRequirementSchema).min(1, "At least one beam requirement is needed")
});

type OptimizationForm = z.infer<typeof optimizationFormSchema>;

interface OptimizationSetupProps {
  onOptimizationStart: () => void;
  onOptimizationComplete: (result: OptimizationResult) => void;
}

export function OptimizationSetup({ onOptimizationStart, onOptimizationComplete }: OptimizationSetupProps) {
  const { toast } = useToast();
  const [beamRequirements, setBeamRequirements] = useState([
    { length: 100, quantity: 5, priority: "normal" as const },
    { length: 150, quantity: 3, priority: "normal" as const },
    { length: 200, quantity: 2, priority: "normal" as const }
  ]);

  const form = useForm<OptimizationForm>({
    resolver: zodResolver(optimizationFormSchema),
    defaultValues: {
      masterRollLength: 600,
      materialCost: 25.00,
      algorithm: "column_generation",
      optimizationGoal: "minimize_waste",
      beamRequirements: beamRequirements
    }
  });

  const { data: examples } = useQuery({
    queryKey: ["/api/examples"],
  });

  const optimizationMutation = useMutation({
    mutationFn: async (data: OptimizationRequest) => {
      const response = await apiRequest("POST", "/api/optimize", data);
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

  const addBeamRequirement = () => {
    setBeamRequirements([...beamRequirements, { length: 0, quantity: 1, priority: "normal" }]);
  };

  const removeBeamRequirement = (index: number) => {
    const newRequirements = beamRequirements.filter((_, i) => i !== index);
    setBeamRequirements(newRequirements);
    form.setValue("beamRequirements", newRequirements);
  };

  const updateBeamRequirement = (index: number, field: keyof typeof beamRequirements[0], value: any) => {
    const newRequirements = [...beamRequirements];
    newRequirements[index] = { ...newRequirements[index], [field]: value };
    setBeamRequirements(newRequirements);
    form.setValue("beamRequirements", newRequirements);
  };

  const addQuickSize = (size: number) => {
    setBeamRequirements([...beamRequirements, { length: size, quantity: 1, priority: "normal" }]);
  };

  const loadExample = (exampleId: string) => {
    const example = examples?.find((ex: any) => ex.id === exampleId);
    if (example) {
      form.setValue("masterRollLength", example.masterRollLength);
      setBeamRequirements(example.beamRequirements);
      form.setValue("beamRequirements", example.beamRequirements);
      toast({
        title: "Example Loaded",
        description: `Loaded ${example.name} example`,
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setBeamRequirements([
      { length: 100, quantity: 5, priority: "normal" },
      { length: 150, quantity: 3, priority: "normal" },
      { length: 200, quantity: 2, priority: "normal" }
    ]);
  };

  const onSubmit = (data: OptimizationForm) => {
    onOptimizationStart();
    optimizationMutation.mutate({
      ...data,
      beamRequirements: beamRequirements
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <Card id="optimizer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Sliders className="text-primary mr-3" />
            Optimization Setup
          </CardTitle>
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

            {/* Beam Requirements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">Beam Requirements</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBeamRequirement}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Beam Type
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Length (mm)</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beamRequirements.map((requirement, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="number"
                            value={requirement.length}
                            onChange={(e) => updateBeamRequirement(index, "length", Number(e.target.value))}
                            placeholder="Length"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={requirement.quantity}
                            onChange={(e) => updateBeamRequirement(index, "quantity", Number(e.target.value))}
                            placeholder="Qty"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={requirement.priority}
                            onValueChange={(value) => updateBeamRequirement(index, "priority", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBeamRequirement(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Quick Add Options */}
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Quick Add Common Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {[50, 75, 100, 125, 150, 200].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickSize(size)}
                    >
                      {size}mm
                    </Button>
                  ))}
                </div>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-blue-700"
                disabled={optimizationMutation.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                {optimizationMutation.isPending ? "Optimizing..." : "Start Optimization"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => examples?.[0] && loadExample(examples[0].id)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Load Example
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
