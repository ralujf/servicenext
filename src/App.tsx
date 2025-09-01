import { useState, useEffect } from 'react';
import { QuestionBrowser } from './components/QuestionBrowser';
import { QuestionDetail } from './components/QuestionDetail';
import { ProgressTracker } from './components/ProgressTracker';
import { Resources } from './components/Resources';
import { StandaloneCategorySidebar } from './components/CategorySidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthForm } from './components/AuthForm';
import { Navbar } from './components/Navbar';
import { Toaster } from './components/ui/sonner';
import { mockQuestions, Question } from './data/questions-clean';
import { progressService, ProgressStats, UserProgress } from './utils/progressService';
import { bookmarkService } from './utils/bookmarkService';
import { usePageView } from './hooks/usePageView';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isLoading, accessToken } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('practice');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [isShowingBookmarked, setIsShowingBookmarked] = useState(false);
  
  // Page metadata management
  const { navigateToView, updateCurrentMetadata } = usePageView('practice');
  
  // Load user progress and bookmarks when user logs in
  useEffect(() => {
    if (user && !userProgress) {
      loadUserProgress();
      // Auto-redirect to practice page after successful login
      if (currentTab === 'auth') {
        setCurrentTab('practice');
      }
    } else if (!user) {
      // Clear progress and bookmarks when user logs out
      setUserProgress(null);
      setBookmarkedQuestions([]);
      setIsShowingBookmarked(false);
    }
  }, [user, currentTab]);

  // Load bookmarks when access token becomes available
  useEffect(() => {
    if (user && accessToken && bookmarkedQuestions.length === 0) {
      loadBookmarks();
    }
  }, [user, accessToken]);

  const loadUserProgress = async () => {
    if (!user) return;
    
    setProgressLoading(true);
    try {
      const progress = await progressService.getUserProgress(user.id);
      setUserProgress(progress);
    } catch (error) {
      console.error('Failed to load user progress:', error);
      // Create default progress if loading fails
      setUserProgress({
        userId: user.id,
        completedQuestions: [],
        easyCompleted: 0,
        mediumCompleted: 0,
        hardCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null
      });
    } finally {
      setProgressLoading(false);
    }
  };

  const loadBookmarks = async () => {
    if (!user || !accessToken) return;
    
    try {
      const bookmarks = await bookmarkService.getUserBookmarks(user.id, accessToken);
      setBookmarkedQuestions(bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      setBookmarkedQuestions([]);
    }
  };

  const handleQuestionComplete = async (questionId: string, difficulty: string) => {
    if (!user || !userProgress) return;

    try {
      const updatedProgress = await progressService.completeQuestion(user.id, questionId, difficulty);
      setUserProgress(updatedProgress);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    
    // Update page metadata based on the new tab
    switch (tab) {
      case 'practice':
        navigateToView('practice');
        break;
      case 'progress':
        navigateToView('progress');
        break;
      case 'resources':
        navigateToView('resources');
        break;
      case 'auth':
        navigateToView('auth');
        break;
      default:
        navigateToView('practice');
    }
    
    // Clear selected question when switching tabs
    if (tab !== 'practice') {
      setSelectedQuestion(null);
    }
  };

  const handleQuestionSelect = (question: Question) => {
    setSelectedQuestion(question);
    // Switch to practice tab when selecting a question
    setCurrentTab('practice');
    // Update metadata for the specific question
    navigateToView('question', { title: question.title });
  };

  const handleLogoClick = () => {
    // Go to main practice page
    setCurrentTab('practice');
    setSelectedQuestion(null);
    // Update metadata back to practice view
    navigateToView('practice');
  };

  const handleCategorySelect = (category: string | null) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setIsShowingBookmarked(false);
    // Clear selected question when changing category
    setSelectedQuestion(null);
    // If a category filter is applied, switch to the practice tab
    if (category && currentTab !== 'practice') {
      setCurrentTab('practice');
      navigateToView('practice');
    }
  };

  const handleSelectBookmarked = () => {
    console.log('Bookmarked filter toggled, current state:', isShowingBookmarked);
    const newIsShowingBookmarked = !isShowingBookmarked;
    setIsShowingBookmarked(newIsShowingBookmarked);
    setSelectedCategory(null);
    setSelectedQuestion(null);
    // If the bookmarked filter is activated, switch to the practice tab
    if (newIsShowingBookmarked && currentTab !== 'practice') {
      setCurrentTab('practice');
      navigateToView('practice');
    }
  };

  const handleBookmarkToggle = async (questionId: string, isBookmarked: boolean) => {
    if (!user || !accessToken) return;
    
    try {
      if (isBookmarked) {
        setBookmarkedQuestions(prev => [...prev, questionId]);
      } else {
        setBookmarkedQuestions(prev => prev.filter(id => id !== questionId));
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      // Revert the change if the API call failed
      loadBookmarks();
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter questions by selected category or bookmarked status
  const filteredQuestions = isShowingBookmarked
    ? mockQuestions.filter(q => bookmarkedQuestions.includes(q.id))
    : selectedCategory 
      ? mockQuestions.filter(q => q.category === selectedCategory)
      : mockQuestions;

  // Debug logging
  console.log('Filter state:', { 
    selectedCategory, 
    isShowingBookmarked, 
    bookmarkedQuestions: bookmarkedQuestions.length,
    filteredQuestionsCount: filteredQuestions.length,
    totalQuestions: mockQuestions.length 
  });

  // Calculate progress stats (only for logged-in users)
  const progressStats: ProgressStats | null = user && userProgress ? progressService.convertToProgressStats(
    userProgress,
    mockQuestions.filter(q => q.difficulty === 'Easy').length,
    mockQuestions.filter(q => q.difficulty === 'Medium').length,
    mockQuestions.filter(q => q.difficulty === 'Hard').length
  ) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-background dark:via-card dark:to-secondary" style={{ fontFamily: 'Chivo, sans-serif' }}>
        <Navbar onLogoClick={handleLogoClick} />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-foreground" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while user progress is loading (only for logged-in users)
  if (user && progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-background dark:via-card dark:to-secondary" style={{ fontFamily: 'Chivo, sans-serif' }}>
        <Navbar 
          currentTab={currentTab}
          onTabChange={handleTabChange}
          userStreak={0}
          onLogoClick={handleLogoClick}
        />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-foreground" />
            <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Loading your progress...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'practice':
        if (selectedQuestion) {
          return (
            <QuestionDetail 
              question={selectedQuestion} 
              onQuestionComplete={handleQuestionComplete}
              userProgress={userProgress}
              questions={filteredQuestions}
              onNavigateToQuestion={handleQuestionSelect}
              onBackToQuestions={() => {
                setSelectedQuestion(null);
                navigateToView('practice');
              }}
              bookmarkedQuestions={bookmarkedQuestions}
              onBookmarkToggle={handleBookmarkToggle}
            />
          );
        } else {
          return (
            <div className="space-y-6">
              {/* Welcome message - personalized for logged-in users, generic for anonymous */}
              <div className="text-left">
                {user ? (
                  <>
                    <h1 className="text-lg font-medium mb-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Welcome back, {user.name}!
                    </h1>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Master ServiceNow development with LeetCode-style coding challenges
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-lg font-medium mb-1" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Welcome to ServiceNext!
                    </h1>
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      Master ServiceNow development with LeetCode-style coding challenges. {' '}
                      <button 
                        onClick={() => setCurrentTab('auth')} 
                        className="text-primary hover:underline font-medium"
                        style={{ fontFamily: 'Chivo, sans-serif' }}
                      >
                        Sign in
                      </button> to track your progress.
                    </p>
                  </>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Choose a Question to Practice
                </h2>
                <QuestionBrowser 
                  questions={filteredQuestions}
                  onSelectQuestion={handleQuestionSelect}
                  userProgress={userProgress}
                  bookmarkedQuestions={bookmarkedQuestions}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              </div>
            </div>
          );
        }
      
      case 'progress':
        if (!user) {
          return (
            <div className="space-y-6 text-center py-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chivo, sans-serif' }}>Track Your Progress</h2>
                <p className="text-muted-foreground max-w-md mx-auto" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Sign in to track your coding progress, maintain streaks, and see detailed statistics about your performance.
                </p>
                <button
                  onClick={() => setCurrentTab('auth')}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  style={{ fontFamily: 'Chivo, sans-serif' }}
                >
                  Sign In to Track Progress
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Chivo, sans-serif' }}>Your Progress</h2>
            {progressStats && <ProgressTracker stats={progressStats} />}
          </div>
        );
      
      case 'resources':
        return <Resources />;
      
      case 'auth':
        return (
          <div className="max-w-md mx-auto pt-8">
            <AuthForm />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-background dark:via-card dark:to-secondary transition-colors duration-300" style={{ fontFamily: 'Chivo, sans-serif' }}>
      <Navbar 
        currentTab={currentTab}
        onTabChange={handleTabChange}
        userStreak={user ? (userProgress?.currentStreak || 0) : 0}
        onLogoClick={handleLogoClick}
      />
      
      <div className="pt-16 flex h-screen">
        {/* Category Sidebar */}
        <StandaloneCategorySidebar
          questions={mockQuestions}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          bookmarkedQuestions={bookmarkedQuestions}
          onSelectBookmarked={handleSelectBookmarked}
          isShowingBookmarked={isShowingBookmarked}
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="servicenext-theme">
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}