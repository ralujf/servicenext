import { KeyboardEvent, useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Search, ArrowRight, X } from "lucide-react";
import { searchService } from "../utils/searchService";
import { Question } from "../data/questions";

interface AutosuggestSearchProps {
  questions: Question[];
  onQuestionSelect: (question: Question) => void;
  onSearchResults: (results: Question[]) => void;
  placeholder?: string;
}

export function AutosuggestSearch({
  questions,
  onQuestionSelect,
  onSearchResults,
  placeholder = "Search questions...",
}: AutosuggestSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Text-based search functionality
  const performTextSearch = (
    searchQuery: string,
    limit: number = 10,
  ): Question[] => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const searchWords = searchTerm
      .split(" ")
      .filter((w) => w.length > 1);
    const results: Array<Question & { score: number }> = [];

    for (const question of questions) {
      let score = 0;
      const titleLower = question.title.toLowerCase();
      const descLower = question.description.toLowerCase();
      const categoryLower = question.category.toLowerCase();

      // Exact phrase matches get highest priority
      if (titleLower.includes(searchTerm)) {
        score += titleLower === searchTerm ? 1.0 : 0.9;
      }
      if (descLower.includes(searchTerm)) {
        score += 0.7;
      }
      if (categoryLower.includes(searchTerm)) {
        score += 0.6;
      }

      // Individual word matches
      for (const word of searchWords) {
        if (titleLower.includes(word)) {
          score += 0.5;
        }
        if (descLower.includes(word)) {
          score += 0.3;
        }
        if (categoryLower.includes(word)) {
          score += 0.2;
        }
      }

      // Difficulty match
      if (
        question.difficulty.toLowerCase().includes(searchTerm)
      ) {
        score += 0.4;
      }

      if (score > 0) {
        results.push({ ...question, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  const getTextSuggestions = (
    searchQuery: string,
    limit: number = 5,
  ): any[] => {
    const searchTerm = searchQuery.toLowerCase().trim();
    const suggestions: any[] = [];

    for (const question of questions) {
      const titleLower = question.title.toLowerCase();
      const categoryLower = question.category.toLowerCase();
      const descLower = question.description.toLowerCase();

      if (
        titleLower.includes(searchTerm) ||
        categoryLower.includes(searchTerm) ||
        descLower.includes(searchTerm)
      ) {
        suggestions.push({
          questionId: question.id,
          title: question.title,
          category: question.category,
          difficulty: question.difficulty,
          matchType: "text",
        });

        if (suggestions.length >= limit) break;
      }
    }

    return suggestions;
  };

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results =
          await searchService.getSearchSuggestions(
            query,
            questions,
          );
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Fallback to local text search
        const textResults = getTextSuggestions(query);
        setSuggestions(textResults);
        setShowSuggestions(textResults.length > 0);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, questions]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(
          event.target as Node,
        ) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const question = questions.find(
      (q) => q.id === suggestion.questionId,
    );
    if (question) {
      onQuestionSelect(question);
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchResults = await searchService.searchQuestions(
        query,
        questions,
        20,
        0.6,
      );
      const matchedQuestions = questions.filter((q) =>
        searchResults.some(
          (result) => result.questionId === q.id,
        ),
      );

      // Sort by similarity score
      const sortedQuestions = matchedQuestions.sort((a, b) => {
        const aResult = searchResults.find(
          (r) => r.questionId === a.id,
        );
        const bResult = searchResults.find(
          (r) => r.questionId === b.id,
        );
        return (
          (bResult?.similarity || 0) -
          (aResult?.similarity || 0)
        );
      });

      onSearchResults(sortedQuestions);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to local text search
      const textResults = performTextSearch(query, 20);
      onSearchResults(textResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchResults(questions); // Reset to show all questions
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative"
      style={{ fontFamily: "Chivo, sans-serif" }}
    >
      {/* Main Search Card */}
      <Card className="border-2 border-muted bg-gradient-to-r from-white to-gray-50/30 dark:from-background dark:to-gray-950/10">
        <CardContent className="pt-5 px-4">
          <div className="relative w-full flex items-center justify-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                suggestions.length > 0 &&
                setShowSuggestions(true)
              }
              className="pl-10 pr-20 border-muted focus:border-muted-foreground w-full"
              style={{ fontFamily: "Chivo, sans-serif" }}
              disabled={isSearching}
            />

            <div className="absolute right-2 flex items-center gap-1">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                size="sm"
                className="h-7 px-3"
                style={{ fontFamily: "Chivo, sans-serif" }}
              >
                {isSearching ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <Card
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-2 border-primary/20"
              >
                <CardContent className="p-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Finding questions...
                      </span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.questionId}-${index}`}
                          onClick={() =>
                            handleSuggestionClick(suggestion)
                          }
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-medium text-sm truncate"
                              style={{
                                fontFamily: "Chivo, sans-serif",
                              }}
                            >
                              {suggestion.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {suggestion.category}
                              </Badge>
                              <Badge
                                className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}
                              >
                                {suggestion.difficulty}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                Text match
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No suggestions found
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}