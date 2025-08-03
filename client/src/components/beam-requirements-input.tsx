import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Upload, RotateCcw, FileText, Import } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface BeamRequirement {
  length: number;
  quantity: number;
  priority: "low" | "normal" | "high";
}

interface BeamRequirementsInputProps {
  beamRequirements: BeamRequirement[];
  onBeamRequirementsChange: (requirements: BeamRequirement[]) => void;
}

export function BeamRequirementsInput({ beamRequirements, onBeamRequirementsChange }: BeamRequirementsInputProps) {
  const { toast } = useToast();
  const [bulkImportText, setBulkImportText] = useState("");

  const { data: examples } = useQuery({
    queryKey: ["/api/examples"],
  });

  const addBeamRequirement = () => {
    onBeamRequirementsChange([...beamRequirements, { length: 0, quantity: 1, priority: "normal" }]);
  };

  const removeBeamRequirement = (index: number) => {
    const newRequirements = beamRequirements.filter((_, i) => i !== index);
    onBeamRequirementsChange(newRequirements);
  };

  const updateBeamRequirement = (index: number, field: keyof BeamRequirement, value: any) => {
    const newRequirements = [...beamRequirements];
    newRequirements[index] = { ...newRequirements[index], [field]: value };
    onBeamRequirementsChange(newRequirements);
  };

  const addQuickSize = (size: number) => {
    onBeamRequirementsChange([...beamRequirements, { length: size, quantity: 1, priority: "normal" }]);
  };

  const loadExample = (exampleId: string) => {
    if (!examples || !Array.isArray(examples)) return;
    const example = examples.find((ex: any) => ex.id === exampleId);
    if (example) {
      onBeamRequirementsChange(example.beamRequirements);
      toast({
        title: "Example Loaded",
        description: `Loaded ${example.name} example`,
      });
    }
  };

  const resetForm = () => {
    onBeamRequirementsChange([
      { length: 100, quantity: 5, priority: "normal" },
      { length: 150, quantity: 3, priority: "normal" },
      { length: 200, quantity: 2, priority: "normal" }
    ]);
  };

  const parseBulkImport = () => {
    if (!bulkImportText.trim()) {
      toast({
        title: "No Data",
        description: "Please paste your beam requirements data",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = bulkImportText.trim().split('\n');
      const requirements = [];
      
      let dataStarted = false;
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        if (/^\d+/.test(trimmedLine)) {
          dataStarted = true;
          const parts = trimmedLine.split(/\s+/);
          if (parts.length >= 2) {
            const length = parseInt(parts[0]);
            const quantity = parseInt(parts[1]);
            
            if (!isNaN(length) && !isNaN(quantity) && length > 0 && quantity > 0) {
              requirements.push({
                length,
                quantity,
                priority: "normal" as const
              });
            }
          }
        } else if (dataStarted) {
          break;
        }
      }

      if (requirements.length === 0) {
        toast({
          title: "No Valid Data Found",
          description: "Please check your data format. Expected format: Length and Quantity on each line.",
          variant: "destructive",
        });
        return;
      }

      onBeamRequirementsChange(requirements);
      setBulkImportText("");
      
      toast({
        title: "Data Imported Successfully",
        description: `Imported ${requirements.length} beam requirements`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to parse the data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="text-primary mr-3" />
            Beam Requirements
          </CardTitle>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addBeamRequirement}>
              <Plus className="w-4 h-4 mr-1" />
              Add Beam Type
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bulk Import Section */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <h4 className="text-sm font-medium text-blue-900">Bulk Import</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Paste your data with Length and Quantity columns. Headers will be automatically detected.
          </p>
          <div className="space-y-3">
            <Textarea
              placeholder={`Length   Qty (Nos)
750      16
3154     20
1502     16
2383     8
697      32
675      16
900      8
3070     24`}
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={parseBulkImport}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Import className="w-4 h-4 mr-1" />
                Import Data
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setBulkImportText("")}
              >
                Clear
              </Button>
            </div>
          </div>
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
                      onValueChange={(value: "low" | "normal" | "high") => updateBeamRequirement(index, "priority", value)}
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
        <div className="p-4 bg-slate-50 rounded-lg">
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => Array.isArray(examples) && examples[0] && loadExample(examples[0].id)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Example
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}