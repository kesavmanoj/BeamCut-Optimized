import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VisualCuttingLayout } from "./visual-cutting-layout";
import { TrendingUp, Download, FileSpreadsheet, Scroll, Leaf, AlertTriangle, DollarSign } from "lucide-react";
import type { OptimizationResult } from "@shared/schema";

interface OptimizationResultsProps {
  result: OptimizationResult;
}

export function OptimizationResults({ result }: OptimizationResultsProps) {
  const downloadReport = () => {
    // Generate and download PDF report
    const reportData = {
      ...result,
      timestamp: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cutting-optimization-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    // Export cutting patterns as CSV
    const csvHeader = "Pattern,100mm,150mm,200mm,Total Length,Waste,Rolls Used\n";
    const csvData = result.patterns.map((pattern, index) => {
      const cuts = [0, 0, 0]; // Initialize for lengths 100, 150, 200
      pattern.cuts.forEach(cut => {
        if (cut.length === 100) cuts[0] = cut.quantity;
        if (cut.length === 150) cuts[1] = cut.quantity;
        if (cut.length === 200) cuts[2] = cut.quantity;
      });
      return `Pattern ${index + 1},${cuts[0]},${cuts[1]},${cuts[2]},${pattern.totalLength},${pattern.waste},${pattern.rollsUsed}`;
    }).join('\n');
    
    const csv = csvHeader + csvData;
    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cutting-patterns-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card id="results">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="text-primary mr-3" />
            Optimization Results
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={exportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Rolls Required</p>
                <p className="text-2xl font-bold">{result.totalRolls}</p>
              </div>
              <Scroll className="text-blue-200 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Material Efficiency</p>
                <p className="text-2xl font-bold">{result.efficiency}%</p>
              </div>
              <Leaf className="text-green-200 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Total Waste</p>
                <p className="text-2xl font-bold">{result.totalWaste}mm</p>
              </div>
              <AlertTriangle className="text-amber-200 w-8 h-8" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Cost Savings</p>
                <p className="text-2xl font-bold">${result.costSavings?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="text-purple-200 w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Cutting Patterns Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Optimal Cutting Patterns</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern #</TableHead>
                  <TableHead>Cuts</TableHead>
                  <TableHead>Total Length</TableHead>
                  <TableHead>Waste</TableHead>
                  <TableHead className="text-center">Rolls Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.patterns.map((pattern, index) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium">Pattern {index + 1}</TableCell>
                    <TableCell>
                      {pattern.cuts.map((cut, cutIndex) => (
                        <span key={cutIndex} className="mr-2">
                          {cut.quantity}×{cut.length}mm
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>{pattern.totalLength}mm</TableCell>
                    <TableCell className={pattern.waste === 0 ? "text-green-600 font-medium" : "text-amber-600"}>
                      {pattern.waste}mm
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-100 text-blue-800">
                        {pattern.rollsUsed} roll{pattern.rollsUsed !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Visual Cutting Layout */}
        <VisualCuttingLayout patterns={result.patterns} />

        {/* Cutting Instructions */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cutting Instructions</h3>
          <div className="bg-slate-50 rounded-lg p-4">
            <ol className="space-y-3 text-sm">
              {result.cuttingInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className={`flex-shrink-0 w-6 h-6 ${instruction.step === result.cuttingInstructions.length ? 'bg-green-600' : 'bg-primary'} text-white rounded-full flex items-center justify-center text-xs font-medium`}>
                    {instruction.step === result.cuttingInstructions.length ? '✓' : instruction.step}
                  </span>
                  <div>
                    <strong>{instruction.description}</strong>
                    <p className="text-slate-600 mt-1">{instruction.pattern}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
