import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Lightbulb, 
  Gauge, 
  HelpCircle, 
  FileText, 
  Video, 
  Code, 
  Mail,
  CheckCircle
} from "lucide-react";

export function Sidebar() {
  const { data: examples } = useQuery({
    queryKey: ["/api/examples"],
  });

  const loadExample = (exampleId: string) => {
    // This would trigger loading the example in the main form
    console.log("Loading example:", exampleId);
  };

  return (
    <div className="space-y-8">
      {/* Quick Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Zap className="text-primary mr-2 w-5 h-5" />
            Quick Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {examples?.map((example: any) => (
            <Button
              key={example.id}
              variant="outline"
              className="w-full text-left p-3 h-auto hover:border-primary hover:bg-primary/5"
              onClick={() => loadExample(example.id)}
            >
              <div>
                <div className="font-medium text-slate-900">{example.name}</div>
                <div className="text-sm text-slate-600 mt-1">{example.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card id="algorithm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="text-primary mr-2 w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-primary bg-blue-50 p-4 rounded-r-lg">
            <h4 className="font-medium text-slate-900 mb-2">Column Generation</h4>
            <p className="text-sm text-slate-600">
              Iteratively generates only the most promising cutting patterns, avoiding the exponential explosion of all possible combinations.
            </p>
          </div>
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <h4 className="font-medium text-slate-900 mb-2">Linear Programming</h4>
            <p className="text-sm text-slate-600">
              Uses mathematical optimization to find the exact optimal solution, not just a good approximation.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
            <h4 className="font-medium text-slate-900 mb-2">Dual Values</h4>
            <p className="text-sm text-slate-600">
              Shadow prices guide the search for new patterns by indicating the value of each beam type.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <Button variant="link" className="text-primary hover:text-blue-700 p-0">
              <FileText className="w-4 h-4 mr-1" />
              Learn More About the Algorithm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Gauge className="text-primary mr-2 w-5 h-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Execution Time</span>
            <span className="font-medium text-slate-900">1.24s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Memory Usage</span>
            <span className="font-medium text-slate-900">24.8MB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Patterns Evaluated</span>
            <span className="font-medium text-slate-900">127</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Convergence</span>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Optimal
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <HelpCircle className="text-primary mr-2 w-5 h-5" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a href="#" className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            Algorithm Documentation
          </a>
          <a href="#" className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors">
            <Video className="w-4 h-4 mr-2" />
            Video Tutorials
          </a>
          <a href="#" className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors">
            <Code className="w-4 h-4 mr-2" />
            API Reference
          </a>
          <a href="#" className="flex items-center text-sm text-slate-600 hover:text-primary transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
