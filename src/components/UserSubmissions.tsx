import { useState, useEffect, useCallback } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { CheckCircle, XCircle, Clock, Code, Calendar, AlertCircle, Loader2, Info } from 'lucide-react';
import { submissionsService, Submission } from '../utils/submissionsService';
import { getAccessToken } from '../utils/supabase/client';
import { useAuth } from './AuthProvider';
import { AIExplanationModal } from './AIExplanationModal';
import { toast } from 'sonner';

interface UserSubmissionsProps {
  questionId: string;
  questionTitle: string;
  questionDescription: string;
}

export function UserSubmissions({ questionId, questionTitle, questionDescription }: UserSubmissionsProps) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedSubmissionForAI, setSelectedSubmissionForAI] = useState<Submission | null>(null);

  const loadSubmissions = useCallback(async () => {
    if (!user || !questionId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.warn('UserSubmissions: No access token available, user may need to re-authenticate');
        setSubmissions([]);
        toast.error('Authentication expired. Please refresh the page and sign in again.');
        return;
      }

      const result = await submissionsService.getUserSubmissions(questionId, accessToken);
      
      if (result.success) {
        // Handle both cases: result.submissions exists and is an array, or it's undefined/null
        const submissions = Array.isArray(result.submissions) ? result.submissions : [];
        
        // Sort by submission time (newest first) only if there are submissions
        const sortedSubmissions = submissions.length > 0 
          ? submissions.sort((a, b) => 
              new Date(b.submissionTime).getTime() - new Date(a.submissionTime).getTime()
            )
          : [];
        setSubmissions(sortedSubmissions);
      } else {
        console.error('UserSubmissions: Failed to load submissions:', result.error);
        setSubmissions([]);
        
        // Only show error for non-authentication related errors
        if (result.error && !result.error.includes('404') && !result.error.includes('401') && !result.error.includes('Authorization')) {
          toast.error(`Failed to load submissions: ${result.error}`);
        } else if (result.error && (result.error.includes('401') || result.error.includes('Authorization'))) {
          toast.error('Authentication expired. Please refresh the page and sign in again.');
        }
      }
    } catch (error) {
      console.error('UserSubmissions: Error loading submissions:', error);
      setSubmissions([]);
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('access token') || errorMessage.includes('Authorization') || errorMessage.includes('401')) {
        toast.error('Authentication expired. Please refresh the page and sign in again.');
      } else {
        toast.error('Failed to load your submissions');
      }
    } finally {
      setLoading(false);
    }
  }, [user, questionId]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setSubmissions([]);
      return;
    }
    
    // Add a small delay to ensure the auth state is fully settled
    const timer = setTimeout(() => {
      loadSubmissions();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadSubmissions, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getStatusIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.isCorrect) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Accepted
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          Failed
        </Badge>
      );
    }
  };

  const toggleCodeExpansion = (submissionId: string, code: string) => {
    if (expandedCode === submissionId) {
      setExpandedCode(null);
    } else {
      setExpandedCode(submissionId);
    }
  };

  const handleAIExplanation = (submission: Submission) => {
    setSelectedSubmissionForAI(submission);
    setAiModalOpen(true);
  };

  const canShowAIButton = submissions.length >= 7;

  if (!user) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Sign In Required
            </h3>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Sign in to view your submission history for this question.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Loading your submissions...
          </p>
        </div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="space-y-4">
          <Code className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
              No Submissions Yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Your submission history will appear here after you submit your first solution.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Your Submissions ({submissions.length})</h3>
        {canShowAIButton && (
          <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
            🎉 AI Explanations Unlocked!
          </Badge>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {submissions.map((submission, index) => (
          <Card key={submission.id} className="border-l-4 border-l-transparent data-[correct=true]:border-l-green-500 data-[correct=false]:border-l-red-500" data-correct={submission.isCorrect}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.isCorrect)}
                  <span className="font-medium text-sm">
                    Submission #{submissions.length - index}
                  </span>
                  {getStatusBadge(submission)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(submission.submissionTime)}
                </div>
              </div>
              
              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {submission.testsPassed !== undefined && submission.totalTests !== undefined && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {submission.testsPassed}/{submission.totalTests} tests passed
                  </div>
                )}
                {submission.executionTime !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {submission.executionTime}ms
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Code:</span>
                  <div className="flex items-center gap-2">
                    {canShowAIButton && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIExplanation(submission)}
                        className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Get AI explanation for this solution"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        AI Explain
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCodeExpansion(submission.id, submission.code)}
                      className="h-6 px-2 text-xs"
                    >
                      {expandedCode === submission.id ? 'Collapse' : 'View Code'}
                    </Button>
                  </div>
                </div>
                
                {expandedCode === submission.id ? (
                  <Textarea
                    value={submission.code}
                    readOnly
                    className="min-h-[200px] font-mono text-xs resize-none bg-muted/50"
                    style={{ fontFamily: 'Chivo, monospace' }}
                  />
                ) : (
                  <div className="bg-muted/50 p-3 rounded text-xs font-mono overflow-hidden">
                    <div className="line-clamp-3" style={{ fontFamily: 'Chivo, monospace' }}>
                      {submission.code}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Explanation Modal */}
      {selectedSubmissionForAI && (
        <AIExplanationModal
          isOpen={aiModalOpen}
          onClose={() => {
            setAiModalOpen(false);
            setSelectedSubmissionForAI(null);
          }}
          questionId={questionId}
          questionTitle={questionTitle}
          questionDescription={questionDescription}
          userCode={selectedSubmissionForAI.code}
          isCorrect={selectedSubmissionForAI.isCorrect}
          submissionTime={selectedSubmissionForAI.submissionTime}
          executionTime={selectedSubmissionForAI.executionTime}
          testsPassed={selectedSubmissionForAI.testsPassed}
          totalTests={selectedSubmissionForAI.totalTests}
        />
      )}
    </div>
  );
}