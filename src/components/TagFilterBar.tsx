import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Question } from '../data/questions';
import { useRef, useEffect, useState } from 'react';

interface TagFilterBarProps {
  questions: Question[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilterBar({ questions, selectedTags, onTagSelect, onTagRemove, onClearAll }: TagFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Get all unique tags from questions
  const allTags = [...new Set(questions.flatMap(q => q.tags))].sort();

  const checkArrows = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // 1px buffer
    }
  };

  // Add mouse wheel horizontal scrolling and arrow logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check for arrows
    checkArrows();

    const handleWheel = (e: WheelEvent) => {
      // If scrolling vertically and container can scroll horizontally
      if (e.deltaY !== 0 && container.scrollWidth > container.clientWidth) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    // Add drag scrolling
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    };

    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = 'grab';
      container.style.userSelect = 'auto';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('scroll', checkArrows);
    window.addEventListener('resize', checkArrows);


    // Set initial cursor
    container.style.cursor = 'grab';

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave',handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('scroll', checkArrows);
      window.removeEventListener('resize', checkArrows);
    };
  }, [allTags]); // Re-run if tags change

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getTagColor = (tag: string) => {
    // Color coding for different tag types
    const colors: Record<string, string> = {
      // ServiceNow specific
      'GlideRecord': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
      'GlideAjax': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800',
      'GlideDateTime': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'Business Rules': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800',
      'Script Includes': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800',
      'Reference Qualifiers': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800',
      'Alerts': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800',
      
      // JavaScript concepts
      'Arrays': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800',
      'Objects': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800',
      'JavaScript': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800',
      'Switch Case': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300 hover:bg-lime-200 dark:hover:bg-lime-800',
      'Higher Order Functions': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800',
      'JSON': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-800',
      
      // General concepts
      'Performance': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800',
      'Security': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800',
      'Validation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800',
      'API': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
      'Authentication': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800',
      'User Management': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'UI Controls': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800',
      'Dynamic Loading': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800',
      'ServiceNow': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
      'Filtering': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800',
      'Sorting': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800',
      'Aggregation': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800',
      'Statistics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800',
      'Optimization': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800',
      'Team Management': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
      'Merging': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800',
      'Deduplication': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800',
      'Intersection': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800',
      'Comparison': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'Calculation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800',
      'Scheduling': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800',
      'Logic': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800',
      'Safe Navigation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800',
      'Property Access': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800',
      'Transformation': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800',
      'Data Mapping': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800',
      'Logic Control': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800',
      'Routing': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800',
      'State Machine': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800',
      'Workflow': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800',
      'Functional Programming': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-800',
      'Data Processing': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800',
      'Currying': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800',
      'Parsing': 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300 hover:bg-lime-200 dark:hover:bg-lime-800'
    };

    return colors[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  const getSelectedTagColor = (tag: string) => {
    // Darker variants for selected tags
    const colors: Record<string, string> = {
      // ServiceNow specific
      'GlideRecord': 'bg-blue-600 text-white hover:bg-blue-700',
      'GlideAjax': 'bg-purple-600 text-white hover:bg-purple-700',
      'GlideDateTime': 'bg-indigo-600 text-white hover:bg-indigo-700',
      'Business Rules': 'bg-orange-600 text-white hover:bg-orange-700',
      'Script Includes': 'bg-teal-600 text-white hover:bg-teal-700',
      'Reference Qualifiers': 'bg-pink-600 text-white hover:bg-pink-700',
      'Alerts': 'bg-rose-600 text-white hover:bg-rose-700',
      
      // JavaScript concepts
      'Arrays': 'bg-cyan-600 text-white hover:bg-cyan-700',
      'Objects': 'bg-emerald-600 text-white hover:bg-emerald-700',
      'JavaScript': 'bg-amber-600 text-white hover:bg-amber-700',
      'Switch Case': 'bg-lime-600 text-white hover:bg-lime-700',
      'Higher Order Functions': 'bg-violet-600 text-white hover:bg-violet-700',
      'JSON': 'bg-fuchsia-600 text-white hover:bg-fuchsia-700',
      
      // General concepts
      'Performance': 'bg-red-600 text-white hover:bg-red-700',
      'Security': 'bg-yellow-600 text-white hover:bg-yellow-700',
      'Validation': 'bg-green-600 text-white hover:bg-green-700',
      'API': 'bg-blue-600 text-white hover:bg-blue-700'
    };

    return colors[tag] || 'bg-gray-600 text-white hover:bg-gray-700';
  };

  if (allTags.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Filter by Topics</h3>
        {selectedTags.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground"
            style={{ fontFamily: 'Chivo, sans-serif' }}
          >
            Clear all filters
          </Button>
        )}
      </div>
      <div className="relative flex items-center">
        {showLeftArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div
          ref={scrollContainerRef}
          className="flex items-center space-x-2 overflow-x-auto py-2 scrollbar-hide"
        >
          {allTags.map(tag => (
            <Badge
              key={tag}
              variant="default"
              className={`cursor-pointer transition-colors ${getSelectedTagColor(tag)} text-xs`}
              onClick={() => onTagRemove(tag)}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
        {showRightArrow && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className={`cursor-pointer transition-colors ${getSelectedTagColor(tag)} text-xs`}
              onClick={() => onTagRemove(tag)}
            >
              {tag}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}