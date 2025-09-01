import { KeyboardEvent, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Console } from './Console';
import { CommunityAnswers } from './CommunityAnswers';
import { VotingButtons } from './VotingButtons';
import { UserSubmissions } from './UserSubmissions';
import { BookmarkButton } from './BookmarkButton';
import { Question } from '../data/questions';
import { UserProgress } from '../utils/progressService';
import { executeCode } from '../utils/sandboxExecutor';
import { communitySolutionsService } from '../utils/communitySolutionsService';
import { votingService, QuestionVotes } from '../utils/votingService';
import { submissionsService } from '../utils/submissionsService';
import { getAccessToken } from '../utils/supabase/client';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { CheckCircle, Circle, Users, Lightbulb, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionDetailProps {
  question: Question;
  onQuestionComplete?: (questionId: string, difficulty: string) => void;
  userProgress?: UserProgress | null;
  questions?: Question[];
  onNavigateToQuestion?: (question: Question) => void;
  onBackToQuestions?: () => void;
  bookmarkedQuestions?: string[];
  onBookmarkToggle?: (questionId: string, isBookmarked: boolean) => void;
}

export function QuestionDetail({ question, onQuestionComplete, userProgress, questions = [], onNavigateToQuestion, onBackToQuestions, bookmarkedQuestions = [], onBookmarkToggle }: QuestionDetailProps) {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const [code, setCode] = useState(question.starterCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [submittedSolution, setSubmittedSolution] = useState(false);
  const [questionVotes, setQuestionVotes] = useState<QuestionVotes | null>(null);

  // Ensure arrays have default values
  const safeQuestion = {
    ...question,
    hints: question.hints || [],
    examples: question.examples || [],
    tags: question.tags || [],
    testCases: question.testCases || [],
    constraints: question.constraints || []
  };

  const isCompleted = userProgress?.completedQuestions.includes(question.id) || false;

  // Reset state when question changes
  useEffect(() => {
    setCode(question.starterCode);
    setOutput('');
    setRevealedHints(0);
    setSubmittedSolution(false);
    loadQuestionVotes();
  }, [question.id, question.starterCode]);

  const loadQuestionVotes = async () => {
    try {
      const votes = await votingService.getQuestionVotes(question.id);
      setQuestionVotes(votes);
    } catch (error) {
      console.error('Error loading question votes:', error);
    }
  };

  const handleVotesUpdate = (votes: QuestionVotes) => {
    setQuestionVotes(votes);
  };

  // Navigation logic
  const currentIndex = questions.findIndex(q => q.id === question.id);
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < questions.length - 1 ? questions[currentIndex + 1] : null;

  const handlePreviousQuestion = () => {
    if (previousQuestion && onNavigateToQuestion) {
      onNavigateToQuestion(previousQuestion);
    }
  };

  const handleNextQuestion = () => {
    if (nextQuestion && onNavigateToQuestion) {
      onNavigateToQuestion(nextQuestion);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTagColor = (tag: string) => {
    // Color coding for different tag types
    const colors: Record<string, string> = {
      // ServiceNow specific
      'GlideRecord': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'GlideAjax': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'GlideDateTime': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'Business Rules': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Script Includes': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'Reference Qualifiers': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Alerts': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      
      // JavaScript concepts
      'Arrays': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      'Objects': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      'JavaScript': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      'Switch Case': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300',
      'Higher Order Functions': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
      'JSON': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300',
      
      // General concepts
      'Performance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Security': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Validation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'API': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };

    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const result = await executeCode(code, safeQuestion.testCases);
      setOutput(result.output);
      
      if (result.allPassed && user && !isCompleted && onQuestionComplete) {
        onQuestionComplete(question.id, question.difficulty);
        toast.success('🎉 Congratulations! Question completed successfully!');
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // Prevent submission for anonymous users
    if (!user) {
      toast.error('Please sign in to submit solutions');
      return;
    }

    setIsRunning(true);
    const startTime = performance.now();
    
    try {
      const result = await executeCode(code, safeQuestion.testCases);
      const executionTime = Math.round(performance.now() - startTime);
      setOutput(result.output);
      
      // Store submission regardless of success/failure
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          await submissionsService.submitCode(
            question.id,
            code.trim(),
            result.allPassed,
            executionTime,
            result.testsPassed,
            result.totalTests,
            accessToken
          );
        }
      } catch (error) {
        console.error('Error storing submission:', error);
        // Don't show error toast as this is background functionality
      }
      
      if (result.allPassed) {
        // Handle progress completion for logged-in user
        if (!isCompleted && onQuestionComplete) {
          onQuestionComplete(question.id, question.difficulty);
          toast.success('🎉 Solution accepted! Question completed!');
        } else if (isCompleted) {
          toast.success('✅ Solution verified! (Already completed)');
        }

        // Submit solution to community answers if solution is valid
        if (code.trim() && !submittedSolution) {
          try {
            // Get access token from shared client
            const accessToken = await getAccessToken();

            if (accessToken) {
              const submitResult = await communitySolutionsService.submitSolution(
                question.id,
                code.trim(),
                accessToken
              );

              if (submitResult.success) {
                setSubmittedSolution(true);
                toast.success('💡 Solution shared with the community!');
              }
            }
          } catch (error) {
            console.error('Error submitting community solution:', error);
            // Don't show error toast as this is optional functionality
          }
        }
      } else {
        toast.error('❌ Some test cases failed. Please review your solution.');
      }
    } catch (error) {
      setOutput(`Error: ${error}`);
      toast.error('❌ Code execution failed. Please check your syntax.');
      
      // Store failed submission
      try {
        const executionTime = Math.round(performance.now() - startTime);
        const accessToken = await getAccessToken();
        if (accessToken) {
          await submissionsService.submitCode(
            question.id,
            code.trim(),
            false,
            executionTime,
            0,
            safeQuestion.testCases?.length || 0,
            accessToken
          );
        }
      } catch (submitError) {
        console.error('Error storing failed submission:', submitError);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleShowNextHint = () => {
    setRevealedHints(prev => Math.min(prev + 1, safeQuestion.hints.length));
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const totalHints = safeQuestion.hints.length;
  const hasMoreHints = revealedHints < totalHints;

  return (
    <div className="space-y-6" style={{ fontFamily: 'Chivo, sans-serif' }}>
      {/* Main Content - Side by Side Layout for large screens, stacked for small */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Panel - Question Content (takes 2 columns on xl screens) */}
        <div className="xl:col-span-2">
          <Card className="h-fit sticky top-4">
            <CardHeader>
              <div className="flex items-start gap-6">
                {/* Voting buttons on the left */}
                <div className="flex-shrink-0 pt-1">
                  <VotingButtons
                    questionId={question.id}
                    initialVotes={questionVotes || undefined}
                    onVotesUpdate={handleVotesUpdate}
                  />
                </div>
                
                <div className="space-y-6 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        {safeQuestion.title}
                      </CardTitle>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Navigation arrows */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handlePreviousQuestion}
                              disabled={!previousQuestion}
                              className="h-8 w-8 p-0 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ fontFamily: 'Chivo, sans-serif' }}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p style={{ fontFamily: 'Chivo, sans-serif' }}>
                              {previousQuestion ? `Previous: ${previousQuestion.title}` : 'No previous question'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNextQuestion}
                              disabled={!nextQuestion}
                              className="h-8 w-8 p-0 hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ fontFamily: 'Chivo, sans-serif' }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p style={{ fontFamily: 'Chivo, sans-serif' }}>
                              {nextQuestion ? `Next: ${nextQuestion.title}` : 'No next question'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onBackToQuestions}
                              className="h-8 w-8 p-0 hover:bg-accent ml-2"
                              style={{ fontFamily: 'Chivo, sans-serif' }}
                            >
                              ×
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p style={{ fontFamily: 'Chivo, sans-serif' }}>Back to question list</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Metadata badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <BookmarkButton
                      questionId={question.id}
                      isBookmarked={bookmarkedQuestions.includes(question.id)}
                      onToggle={onBookmarkToggle || (() => {})}
                      size="sm"
                      variant="ghost"
                      showLabel={true}
                    />
                    <Badge className={getDifficultyColor(safeQuestion.difficulty)}>
                      {safeQuestion.difficulty}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {safeQuestion.category}
                    </Badge>
                  </div>

                  {/* Tags */}
                  {safeQuestion.tags && safeQuestion.tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {safeQuestion.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Tabs defaultValue="problem" className="w-full">
                <div className="overflow-x-auto scrollbar-thin">
                  <TabsList className="flex w-max min-w-full bg-muted/50 p-1">
                    <TabsTrigger 
                      value="problem" 
                      className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      Problem
                    </TabsTrigger>
                    <TabsTrigger 
                      value="examples" 
                      className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      Examples
                    </TabsTrigger>
                    <TabsTrigger 
                      value="hints" 
                      className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      Hints {revealedHints > 0 && `(${revealedHints}/${totalHints})`}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="community" 
                      className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      Community
                    </TabsTrigger>
                    {!user ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <TabsTrigger 
                                value="submissions" 
                                disabled={!user}
                                className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ fontFamily: 'Chivo, sans-serif' }}
                              >
                                Submissions
                              </TabsTrigger>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p style={{ fontFamily: 'Chivo, sans-serif' }}>Sign in to view your submissions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TabsTrigger 
                        value="submissions" 
                        disabled={!user}
                        className="data-[state=active]:bg-accent data-[state=active]:shadow-sm data-[state=active]:text-foreground hover:data-[state=inactive]:bg-background/70 dark:hover:data-[state=inactive]:bg-background/30 text-muted-foreground hover:text-foreground dark:hover:text-foreground transition-all duration-200 flex-shrink-0"
                        style={{ fontFamily: 'Chivo, sans-serif' }}
                      >
                        Submissions
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
                
                <TabsContent value="problem" className="mt-6 space-y-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none" style={{ fontFamily: 'Chivo, sans-serif' }}>
                    <p className="leading-relaxed" style={{ whiteSpace: 'pre-line' }}>{safeQuestion.description}</p>
                    {safeQuestion.constraints.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Constraints:</h4>
                        <ul className="space-y-2">
                          {safeQuestion.constraints.map((constraint, index) => (
                            <li key={index} className="leading-relaxed">{constraint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-6 space-y-6">
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {safeQuestion.examples.length > 0 ? (
                      safeQuestion.examples.map((example, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-6 mb-6">
                          <div>
                            <strong style={{ fontFamily: 'Chivo, sans-serif' }}>Input:</strong>
                            <pre className="text-sm bg-muted p-3 rounded mt-2 overflow-x-auto leading-relaxed" style={{ fontFamily: 'Chivo, monospace' }}>
                              {example.input}
                            </pre>
                          </div>
                          <div>
                            <strong style={{ fontFamily: 'Chivo, sans-serif' }}>Output:</strong>
                            <pre className="text-sm bg-muted p-3 rounded mt-2 overflow-x-auto leading-relaxed" style={{ fontFamily: 'Chivo, monospace' }}>
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <strong style={{ fontFamily: 'Chivo, sans-serif' }}>Explanation:</strong>
                              <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                                {example.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-8" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        No examples available for this question.
                      </p>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="hints" className="mt-6 space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        Hints revealed: {revealedHints} of {totalHints}
                      </p>
                      {hasMoreHints && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShowNextHint}
                          className="flex items-center gap-2"
                          style={{ fontFamily: 'Chivo, sans-serif' }}
                        >
                          <Lightbulb className="w-4 h-4" />
                          Show Next Hint
                        </Button>
                      )}
                    </div>
                    
                    {revealedHints > 0 ? (
                      <div className="space-y-6">
                        {safeQuestion.hints.slice(0, revealedHints).map((hint, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
                                  Hint {index + 1}
                                </h4>
                                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed" style={{ fontFamily: 'Chivo, sans-serif' }}>
                                  {hint}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                          Click "Show Next Hint" to reveal hints when you need help.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="community" className="mt-6">
                  <CommunityAnswers questionId={question.id} isQuestionCompleted={isCompleted} />
                </TabsContent>
                
                <TabsContent value="submissions" className="mt-6">
                  {user ? (
                    <UserSubmissions 
                      questionId={question.id} 
                      questionTitle={safeQuestion.title}
                      questionDescription={safeQuestion.description}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                        Sign in to view your submission history.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Code Editor and Console (takes 3 columns on xl screens) */}
        <div className="xl:col-span-3">
          <div className="space-y-6">
            {/* Code Editor */}
            <Card>
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle style={{ fontFamily: 'Chivo, sans-serif' }}>Code Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-2"
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                    >
                      {isRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Running
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          Run Code
                        </>
                      )}
                    </Button>
                    {user && (
                      <Button
                        onClick={handleSubmit}
                        disabled={isRunning}
                        variant="default"
                        className="flex items-center gap-2"
                        style={{ fontFamily: 'Chivo, sans-serif' }}
                      >
                        {isRunning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Submitting
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Submit
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border-2 rounded-md overflow-hidden border-muted-foreground/20 focus-within:border-primary/50 transition-colors">
                  <Editor
                    height="400px"
                    language="javascript"
                    theme={actualTheme === 'dark' ? 'vs-dark' : 'light'}
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      contextmenu: true,
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                      },
                      fontFamily: 'Chivo, monospace',
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Console Output */}
            <Card>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  <Eye className="w-4 h-4" />
                  Console Output
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Console output={output} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}