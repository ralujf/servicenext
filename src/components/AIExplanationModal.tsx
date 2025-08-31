import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, Sparkles, Info, Clock, CheckCircle, XCircle } from 'lucide-react';
import { aiExplanationService, AIExplanationResponse } from '../utils/aiExplanationService';
import { getAccessToken } from '../utils/supabase/client';
import { toast } from 'sonner';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  questionTitle: string;
  questionDescription: string;
  userCode: string;
  isCorrect: boolean;
  submissionTime: string;
  executionTime?: number;
  testsPassed?: number;
  totalTests?: number;
}

export function AIExplanationModal({
  isOpen,
  onClose,
  questionId,
  questionTitle,
  questionDescription,
  userCode,
  isCorrect,
  submissionTime,
  executionTime,
  testsPassed,
  totalTests
}: AIExplanationModalProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cached, setCached] = useState(false);

  const handleGetExplanation = async () => {
    if (hasLoaded && explanation) return; // Don't reload if we already have an explanation

    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }

      const result: AIExplanationResponse = await aiExplanationService.getExplanation(
        questionId,
        questionTitle,
        questionDescription,
        userCode,
        isCorrect,
        accessToken
      );

      if (result.success && result.explanation) {
        setExplanation(result.explanation);
        setCached(result.cached || false);
        setHasLoaded(true);
      } else {
        toast.error(result.error || 'Failed to get AI explanation');
        if (result.submissionCount !== undefined && result.required !== undefined) {
          toast.info(`AI explanations unlock after ${result.required} submissions. You have ${result.submissionCount}.`);
        }
      }
    } catch (error) {
      console.error('Error getting AI explanation:', error);
      toast.error('Failed to get AI explanation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString([], { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (open && !hasLoaded) {
      handleGetExplanation();
    }
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" style={{ fontFamily: 'Chivo, sans-serif' }}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Solution Explanation
          </DialogTitle>
          <DialogDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
            AI-powered insights and explanation for your solution
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Submission Summary */}
          <div className="flex-shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>
                Submission Summary
              </h3>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Accepted
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                )}
                {cached && (
                  <Badge variant="outline" className="text-xs">
                    <Info className="w-3 h-3 mr-1" />
                    Cached
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Submitted
                </p>
                <p className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {formatDate(submissionTime)}
                </p>
              </div>
              
              {executionTime && (
                <div className="space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    <Clock className="w-3 h-3" />
                    Runtime
                  </p>
                  <p className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    {executionTime}ms
                  </p>
                </div>
              )}
              
              {testsPassed !== undefined && totalTests !== undefined && (
                <div className="space-y-1">
                  <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    Tests Passed
                  </p>
                  <p className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    {testsPassed}/{totalTests}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* AI Explanation Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <div className="space-y-2">
                    <p className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Generating AI Explanation...
                    </p>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Our AI is analyzing your solution and preparing insights
                    </p>
                  </div>
                </div>
              </div>
            ) : explanation ? (
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Analysis & Insights
                    </h3>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      {explanation}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div className="space-y-2">
                    <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Ready for AI Insights
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Get an AI-powered explanation of your solution approach, ServiceNow concepts used, and areas for improvement.
                    </p>
                    <Button 
                      onClick={handleGetExplanation}
                      className="mt-4"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Explanation
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}