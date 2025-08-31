import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Terminal, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/abcbb2417947ea1ee22e01da22eb435a604de399.png';

interface ConsoleProps {
  output: string;
}

export function Console({ output }: ConsoleProps) {
  const parseOutput = (output: string) => {
    if (!output || output.trim() === '') return [];
    
    const lines = output.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => ({
      id: index,
      content: line,
      type: getLineType(line)
    }));
  };

  const getLineType = (line: string): 'success' | 'error' | 'info' | 'warning' | 'security' => {
    if (line.includes('✅') || line.includes('PASS') || line.includes('All tests passed')) return 'success';
    if (line.includes('🚨') || line.includes('Security Violations')) return 'security';
    if (line.includes('❌') || line.includes('FAIL') || line.includes('Error:')) return 'error';
    if (line.includes('⚠️') || line.includes('Hint')) return 'warning';
    return 'info';
  };

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
      case 'security': return <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default: return <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30';
      case 'error': return 'text-red-700 dark:text-red-300 bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30';
      case 'warning': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30';
      case 'security': return 'text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/30';
    }
  };

  const parsedLines = parseOutput(output);
  const hasOutput = output && output.trim() !== '';

  return (
    <Card className="border-border/50 dark:border-slate-700/50 dark:bg-slate-800/50" style={{ fontFamily: 'Chivo, sans-serif' }}>
      <CardContent className="pt-6">
        {!hasOutput ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageWithFallback 
              src={logoImage}
              alt="ServiceNext Logo"
              className="w-8 h-8 mx-auto mb-2 opacity-50 rounded-lg object-contain"
            />
            <p style={{ fontFamily: 'Chivo, sans-serif' }}>No output yet</p>
            <p className="text-sm mt-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Run your code to see test results and feedback here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-2 pr-4">
              {parsedLines.map((line) => (
                <div 
                  key={line.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getLineClass(line.type)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLineIcon(line.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: 'Chivo, monospace' }}>
                      {line.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}