import { useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Question } from '../data/questions';
import { useAuth } from './AuthProvider';
import { Code, Server, Filter, ChevronLeft, ChevronRight, Menu, Bookmark } from 'lucide-react';

interface CategorySidebarProps {
  questions: Question[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  bookmarkedQuestions?: string[];
  onSelectBookmarked?: () => void;
  isShowingBookmarked?: boolean;
}

export function StandaloneCategorySidebar({ 
  questions, 
  selectedCategory, 
  onCategorySelect,
  isCollapsed = false,
  onToggleCollapse,
  bookmarkedQuestions = [],
  onSelectBookmarked,
  isShowingBookmarked = false
}: CategorySidebarProps) {
  const { user } = useAuth();
  // Get unique categories and count questions in each
  const categoryStats = questions.reduce((acc, question) => {
    const category = question.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    {
      name: 'Client Side Scripts',
      icon: Code,
      count: categoryStats['Client Side Scripts'] || 0,
      description: 'Browser-side ServiceNow development'
    },
    {
      name: 'Server Side Scripts',
      icon: Server,
      count: categoryStats['Server Side Scripts'] || 0,
      description: 'Server-side ServiceNow development'
    }
  ];

  return (
    <TooltipProvider>
      <div 
        className={`bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`} 
        style={{ fontFamily: 'Chivo, sans-serif' }}
      >
      {/* Header with Toggle Button */}
      <div className="border-b border-sidebar-border p-4">
        {isCollapsed ? (
          /* Collapsed layout - single column with centered items */
          <div className="flex flex-col items-center gap-3">
            <Filter className="w-5 h-5 text-primary flex-shrink-0" />
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="h-8 w-8 p-0 hover:bg-green-50/30 dark:hover:bg-green-950/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Expand sidebar</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ) : (
          /* Expanded layout - normal header */
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary flex-shrink-0" />
                <h2 className="font-semibold text-sidebar-foreground">Categories</h2>
              </div>
              {onToggleCollapse && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onToggleCollapse}
                      className="h-8 w-8 p-0 hover:bg-green-50/30 dark:hover:bg-green-950/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Collapse sidebar</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className="text-xs text-sidebar-foreground/70 mt-1">
              Filter questions by category
            </p>
          </>
        )}
      </div>
      
      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Bookmarked Questions Section - Only for logged-in users */}
          {user && (
            <div className="mb-6">
              {!isCollapsed && (
                <div className="text-xs font-medium text-sidebar-foreground/70 mb-3 px-2">
                  Bookmarks
                </div>
              )}
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectBookmarked?.()}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-3'} rounded-md text-sm transition-colors ${
                        isShowingBookmarked
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-green-50/30 dark:hover:bg-green-950/20 hover:text-sidebar-accent-foreground text-sidebar-foreground'
                      }`}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <Bookmark className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        {!isCollapsed && <span>Bookmarked</span>}
                      </div>
                      {!isCollapsed && (
                        <Badge variant="secondary" className="text-xs">
                          {bookmarkedQuestions.length}
                        </Badge>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>View bookmarked questions ({bookmarkedQuestions.length} saved)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Category Section */}
          <div className="mb-4">
            {!isCollapsed && (
              <div className="text-xs font-medium text-sidebar-foreground/70 mb-3 px-2">
                Question Categories
              </div>
            )}
            <div className="space-y-1">
              {/* All Categories Option */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onCategorySelect(null)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-3'} rounded-md text-sm transition-colors ${
                      selectedCategory === null && !isShowingBookmarked
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'hover:bg-green-50/30 dark:hover:bg-green-950/20 hover:text-sidebar-accent-foreground text-sidebar-foreground'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded bg-primary" />
                      </div>
                      {!isCollapsed && <span>All Categories</span>}
                    </div>
                    {!isCollapsed && (
                      <Badge variant="secondary" className="text-xs">
                        {questions.length}
                      </Badge>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Show all questions ({questions.length} total)</p>
                </TooltipContent>
              </Tooltip>

              {/* Individual Categories */}
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Tooltip key={category.name}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onCategorySelect(category.name)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-3'} rounded-md text-sm transition-colors ${
                          selectedCategory === category.name && !isShowingBookmarked
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'hover:bg-green-50/30 dark:hover:bg-green-950/20 hover:text-sidebar-accent-foreground text-sidebar-foreground'
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                          {!isCollapsed && <span className="truncate text-left">{category.name}</span>}
                        </div>
                        {!isCollapsed && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                            {category.count}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{category.description} ({category.count} questions)</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Active Filter Display - Only show when not collapsed */}
          {!isCollapsed && (selectedCategory || isShowingBookmarked) && (
            <div className="mt-6">
              <div className="text-xs font-medium text-sidebar-foreground/70 mb-3 px-2">
                Active Filter
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isShowingBookmarked ? (
                      <Bookmark className="w-4 h-4 text-primary" />
                    ) : selectedCategory === 'Client Side Scripts' ? (
                      <Code className="w-4 h-4 text-primary" />
                    ) : (
                      <Server className="w-4 h-4 text-primary" />
                    )}
                    <span className="text-sm font-medium text-primary">
                      {isShowingBookmarked ? 'Bookmarked' : selectedCategory}
                    </span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (isShowingBookmarked) {
                            onSelectBookmarked?.();
                          } else {
                            onCategorySelect(null);
                          }
                        }}
                        className="text-primary hover:text-primary/80 text-xs transition-colors px-2 py-1 rounded hover:bg-green-50/30 dark:hover:bg-green-950/20"
                      >
                        Clear
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Clear filter and show all questions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-xs text-primary/70">
                  Showing {isShowingBookmarked ? bookmarkedQuestions.length : (categoryStats[selectedCategory!] || 0)} questions
                </p>
              </div>
            </div>
          )}

          {/* Category Summary - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="mt-6 pt-4 border-t border-sidebar-border">
              <div className="text-xs font-medium text-sidebar-foreground/70 mb-3 px-2">
                Summary
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-sidebar-foreground/70 px-2">
                  <span>Total Questions:</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-sidebar-foreground/70 px-2">
                  <span>Client Side:</span>
                  <span className="font-medium">{categoryStats['Client Side Scripts'] || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-sidebar-foreground/70 px-2">
                  <span>Server Side:</span>
                  <span className="font-medium">{categoryStats['Server Side Scripts'] || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed State Indicators */}
          {isCollapsed && (
            <div className="mt-6 space-y-3">
              {/* Selected category indicator */}
              {(selectedCategory || isShowingBookmarked) && (
                <div className="flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              )}
              
              {/* Total count indicator */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  {isShowingBookmarked 
                    ? bookmarkedQuestions.length 
                    : selectedCategory 
                      ? categoryStats[selectedCategory] || 0 
                      : questions.length}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
    </TooltipProvider>
  );
}