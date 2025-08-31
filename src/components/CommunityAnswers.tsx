import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Code2, Users, Calendar, Share, Copy, Check } from 'lucide-react';
import { communitySolutionsService, CommunitySolution } from '../utils/communitySolutionsService';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';

interface CommunityAnswersProps {
  questionId: string;
  userSolution?: string;
  isQuestionCompleted: boolean;
}

export function CommunityAnswers({ questionId, userSolution, isQuestionCompleted }: CommunityAnswersProps) {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<CommunitySolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadCommunitySolutions();
  }, [questionId]);

  const loadCommunitySolutions = async () => {
    setLoading(true);
    try {
      const communitySolutions = await communitySolutionsService.getCommunitySolutions(questionId);
      setSolutions(communitySolutions);
    } catch (error) {
      console.error('Failed to load community solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySolution = async (solutionId: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates(prev => ({ ...prev, [solutionId]: true }));
      toast.success('Code copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [solutionId]: false }));
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return 'Just now';
      }
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isQuestionCompleted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Community Answers</h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Complete this question successfully to view solutions from other developers!
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Loading community solutions...
        </p>
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Share className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Be the first to submit!</h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Be the first to submit your successful answer and help the community learn!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Community Solutions ({solutions.length})
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {solutions.length} solution{solutions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <ScrollArea className="max-h-96 pr-2">
        <div className="space-y-4">
          {solutions.map((solution, index) => (
            <Card key={solution.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {getInitials(solution.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>
                          {solution.userName}
                        </span>
                        {solution.userId === user?.id && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span style={{ fontFamily: 'Chivo, sans-serif' }}>
                          {formatDate(solution.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopySolution(solution.id, solution.code)}
                    className="h-7 text-xs"
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  >
                    {copiedStates[solution.id] ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <pre className="text-sm bg-muted p-3 rounded border overflow-x-auto leading-relaxed" style={{ fontFamily: 'Chivo, monospace' }}>
                    <code>{solution.code}</code>
                  </pre>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {solution.language}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              {index < solutions.length - 1 && <Separator className="mt-4" />}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}