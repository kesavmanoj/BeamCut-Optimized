import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, CheckCircle } from "lucide-react";

export function Sidebar() {
  return (
    <div className="space-y-8">
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
    </div>
  );
}
