import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AutosuggestSearch } from './AutosuggestSearch';
import { TagFilterBar } from './TagFilterBar';
import { BookmarkButton } from './BookmarkButton';

import { Question } from '../data/questions';
import { UserProgress } from '../utils/progressService';

import { Search, Filter, CheckCircle, Circle } from 'lucide-react';

interface QuestionBrowserProps {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  userProgress?: UserProgress | null;
  bookmarkedQuestions?: string[];
  onBookmarkToggle?: (questionId: string, isBookmarked: boolean) => void;
}

export function QuestionBrowser({ questions, onSelectQuestion, userProgress, bookmarkedQuestions = [], onBookmarkToggle }: QuestionBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>(questions);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Update displayQuestions when questions prop changes (for sidebar filtering)
  useEffect(() => {
    setDisplayQuestions(questions);
    setIsSearchActive(false);
  }, [questions]);


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

  const isQuestionCompleted = (questionId: string) => {
    return userProgress?.completedQuestions.includes(questionId) || false;
  };

  // Tag filter handlers
  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => [...prev, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagClearAll = () => {
    setSelectedTags([]);
  };

  // Handle search results
  const handleSearchResults = (results: Question[]) => {
    setDisplayQuestions(results);
    setIsSearchActive(results.length !== questions.length);
  };

  // Apply traditional filters to current display questions
  const filteredQuestions = displayQuestions.filter(question => {
    const matchesSearch = searchTerm === '' || 
                         question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || question.category === categoryFilter;
    
    // Tag filtering - question must have ALL selected tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => question.tags.includes(tag));
    
    const completed = isQuestionCompleted(question.id);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && completed) ||
                         (statusFilter === 'incomplete' && !completed);

    return matchesSearch && matchesDifficulty && matchesCategory && matchesTags && matchesStatus;
  });

  const categories = [...new Set(questions.map(q => q.category))];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Chivo, sans-serif' }}>
      {/* Search */}
      <AutosuggestSearch
        questions={questions}
        onQuestionSelect={onSelectQuestion}
        onSearchResults={handleSearchResults}
        placeholder="Search questions by title, description, tags, or category..."
      />

      {/* Search Status */}
      {isSearchActive && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Search Results ({displayQuestions.length} questions found)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDisplayQuestions(questions);
                  setIsSearchActive(false);
                }}
                style={{ fontFamily: 'Chivo, sans-serif' }}
              >
                Clear Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Text Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ fontFamily: 'Chivo, sans-serif' }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Difficulty</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger style={{ fontFamily: 'Chivo, sans-serif' }}>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" style={{ fontFamily: 'Chivo, sans-serif' }}>All Difficulties</SelectItem>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty} style={{ fontFamily: 'Chivo, sans-serif' }}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger style={{ fontFamily: 'Chivo, sans-serif' }}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" style={{ fontFamily: 'Chivo, sans-serif' }}>All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} style={{ fontFamily: 'Chivo, sans-serif' }}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger style={{ fontFamily: 'Chivo, sans-serif' }}>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" style={{ fontFamily: 'Chivo, sans-serif' }}>All Questions</SelectItem>
                  <SelectItem value="completed" style={{ fontFamily: 'Chivo, sans-serif' }}>Completed</SelectItem>
                  <SelectItem value="incomplete" style={{ fontFamily: 'Chivo, sans-serif' }}>Not Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Tag Filter Bar */}
      <TagFilterBar
        questions={displayQuestions}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
        onClearAll={handleTagClearAll}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
          Showing {filteredQuestions.length} of {displayQuestions.length} questions
          {isSearchActive && (
            <span className="ml-2 text-primary">
              (filtered from {questions.length} total)
            </span>
          )}
          {selectedTags.length > 0 && (
            <span className="ml-2 text-primary">
              with {selectedTags.length} tag filter{selectedTags.length !== 1 ? 's' : ''}
            </span>
          )}
        </p>
        {userProgress && (
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
            Completed: {userProgress.completedQuestions.length}/{questions.length}
          </p>
        )}
      </div>

      {/* Questions Grid */}
      <div className="grid gap-4">
        {filteredQuestions.map((question) => {
          const completed = isQuestionCompleted(question.id);
          return (
            <Card 
              key={question.id} 
              className="hover:shadow-md transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-green-50/30 dark:hover:bg-green-950/20"
              onClick={() => onSelectQuestion(question)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  {/* Title and Tags */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg hover:text-primary transition-colors mb-3" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      {question.title}
                    </CardTitle>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {question.tags && question.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className={`text-xs ${getTagColor(tag)} ${
                            selectedTags.includes(tag) ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right side - Difficulty, Bookmark, and Completion Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <BookmarkButton
                          questionId={question.id}
                          isBookmarked={bookmarkedQuestions.includes(question.id)}
                          onToggle={onBookmarkToggle || (() => {})}
                          size="sm"
                          variant="ghost"
                        />
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : null}
                      </div>

                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
              No questions match your current filters. Try adjusting your search criteria or removing some tag filters.
            </p>
            {(selectedTags.length > 0 || searchTerm || difficultyFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTags([]);
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setDisplayQuestions(questions);
                  setIsSearchActive(false);
                }}
                className="mt-4"
                style={{ fontFamily: 'Chivo, sans-serif' }}
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}