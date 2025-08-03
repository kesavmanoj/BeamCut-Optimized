import { useState } from "react";
import { Link } from "wouter";
import { BeamRequirementsInput, type BeamRequirement } from "@/components/beam-requirements-input";
import { OptimizationConfig } from "@/components/optimization-config";
import { AlgorithmVisualization } from "@/components/algorithm-visualization";
import { OptimizationResults } from "@/components/optimization-results";
import { RangeOptimization } from "@/components/range-optimization";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scissors, Play, Book, FolderOpen, BarChart3, Settings } from "lucide-react";
import type { OptimizationRequest, OptimizationResult } from "@shared/schema";

export default function Home() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [beamRequirements, setBeamRequirements] = useState<BeamRequirement[]>([
    { length: 100, quantity: 5, priority: "normal" },
    { length: 150, quantity: 3, priority: "normal" },
    { length: 200, quantity: 2, priority: "normal" }
  ]);

  const handleOptimizationComplete = (result: OptimizationResult) => {
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  const handleOptimizationStart = () => {
    setIsOptimizing(true);
    setOptimizationResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Scissors className="text-white w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">BeamCut</h1>
                <p className="text-xs text-slate-500">Optimization Engine</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/projects" className="text-slate-600 hover:text-primary transition-colors flex items-center">
                <FolderOpen className="w-4 h-4 mr-1" />
                Projects
              </Link>
              <a href="#optimizer" className="text-slate-600 hover:text-primary transition-colors">Optimizer</a>
              <a href="#range" className="text-slate-600 hover:text-primary transition-colors">Range Analysis</a>
              <a href="#docs" className="text-slate-600 hover:text-primary transition-colors">Documentation</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">
              Cutting Stock Optimization Engine
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Minimize material waste with advanced Column Generation algorithms. 
              Find optimal cutting patterns for beams and master rolls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Start Optimization
              </Button>
              <Button size="lg" variant="outline">
                <Book className="w-4 h-4 mr-2" />
                Learn Algorithm
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Beam Requirements Input - Always shown first */}
            <BeamRequirementsInput 
              beamRequirements={beamRequirements}
              onBeamRequirementsChange={setBeamRequirements}
            />
            
            {/* Optimization Choice - Shown after beam requirements */}
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Single Optimization
                </TabsTrigger>
                <TabsTrigger value="range" className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Range Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-8 mt-6">
                <OptimizationConfig 
                  beamRequirements={beamRequirements}
                  onOptimizationStart={handleOptimizationStart}
                  onOptimizationComplete={handleOptimizationComplete}
                />
                
                {isOptimizing && (
                  <AlgorithmVisualization 
                    steps={optimizationResult?.algorithmSteps || []}
                    performance={optimizationResult?.performance}
                  />
                )}
                
                {optimizationResult && (
                  <OptimizationResults result={optimizationResult} />
                )}
              </TabsContent>
              
              <TabsContent value="range" className="mt-6">
                <RangeOptimization 
                  beamRequirements={beamRequirements}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Scissors className="text-white w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">BeamCut</h3>
                  <p className="text-sm text-slate-500">Optimization Engine</p>
                </div>
              </div>
              <p className="text-slate-600 mb-4">
                Advanced cutting stock optimization using Column Generation and Linear Programming. 
                Minimize material waste and maximize efficiency in your manufacturing processes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Enterprise</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-600 hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 BeamCut Optimization Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
