import type { OptimizationResult } from "@/lib/types";

interface VisualCuttingLayoutProps {
  patterns: OptimizationResult["patterns"];
}

export function VisualCuttingLayout({ patterns }: VisualCuttingLayoutProps) {
  const getColorForLength = (length: number) => {
    const colors = {
      50: "bg-red-400",
      75: "bg-orange-400", 
      100: "bg-blue-400",
      125: "bg-indigo-400",
      150: "bg-purple-400",
      180: "bg-pink-400",
      200: "bg-orange-400",
      250: "bg-emerald-400",
      300: "bg-teal-400",
      400: "bg-cyan-400"
    };
    return colors[length as keyof typeof colors] || "bg-gray-400";
  };

  const calculateSegmentWidth = (length: number, totalLength: number) => {
    return (length / 600) * 100; // Assuming 600mm rolls for percentage calculation
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Visual Cutting Layout</h3>
      <div className="space-y-4">
        {patterns.map((pattern, patternIndex) => (
          <div key={patternIndex} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">
                Roll {patternIndex + 1} - Pattern {patternIndex + 1} 
                {pattern.rollsUsed > 1 && ` (Used ${pattern.rollsUsed} times)`}
              </h4>
              <span className="text-sm text-slate-500">
                {pattern.totalLength + pattern.waste}mm total
              </span>
            </div>
            
            <div className="relative">
              {/* Roll representation */}
              <div className="w-full h-12 bg-slate-100 rounded-lg border-2 border-slate-300 relative overflow-hidden">
                {/* Cut segments */}
                {(() => {
                  let currentPosition = 0;
                  const segments = [];
                  
                  pattern.cuts.forEach((cut, cutIndex) => {
                    for (let i = 0; i < cut.quantity; i++) {
                      const segmentWidth = calculateSegmentWidth(cut.length, 600);
                      segments.push(
                        <div
                          key={`${cutIndex}-${i}`}
                          className={`absolute top-0 h-full ${getColorForLength(cut.length)} border-r-2 border-slate-300 flex items-center justify-center text-white text-xs font-medium`}
                          style={{
                            left: `${currentPosition}%`,
                            width: `${segmentWidth}%`
                          }}
                        >
                          {cut.length}mm
                        </div>
                      );
                      currentPosition += segmentWidth;
                    }
                  });
                  
                  return segments;
                })()}
                
                {/* Waste area */}
                {pattern.waste > 0 && (
                  <div
                    className="absolute top-0 h-full bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-medium"
                    style={{
                      right: '0%',
                      width: `${calculateSegmentWidth(pattern.waste, 600)}%`
                    }}
                  >
                    Waste
                  </div>
                )}
              </div>
              
              {/* Cut marks */}
              {(() => {
                let currentPosition = 0;
                const cutMarks = [];
                
                pattern.cuts.forEach((cut, cutIndex) => {
                  for (let i = 0; i < cut.quantity; i++) {
                    if (currentPosition > 0) { // Don't add cut mark at the beginning
                      cutMarks.push(
                        <div
                          key={`cut-${cutIndex}-${i}`}
                          className="absolute top-0 w-0.5 h-12 bg-red-500"
                          style={{ left: `${currentPosition}%` }}
                        />
                      );
                    }
                    currentPosition += calculateSegmentWidth(cut.length, 600);
                  }
                });
                
                return cutMarks;
              })()}
            </div>
            
            <div className="mt-2 text-xs text-slate-600 flex flex-wrap gap-4">
              {/* Color legend for this pattern */}
              {Array.from(new Set(pattern.cuts.map(cut => cut.length))).map(length => (
                <span key={length} className="flex items-center">
                  <span className={`inline-block w-3 h-3 ${getColorForLength(length)} rounded mr-1`}></span>
                  {length}mm beams
                </span>
              ))}
              <span className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span>
                Cut lines
              </span>
              {pattern.waste > 0 && (
                <span className="flex items-center">
                  <span className="inline-block w-3 h-3 bg-slate-300 rounded mr-1"></span>
                  Waste
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
