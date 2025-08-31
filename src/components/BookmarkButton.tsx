import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider';
import { bookmarkService } from '../utils/bookmarkService';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  questionId: string;
  isBookmarked: boolean;
  onToggle: (questionId: string, isBookmarked: boolean) => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function BookmarkButton({ 
  questionId, 
  isBookmarked, 
  onToggle, 
  size = 'sm',
  variant = 'ghost',
  showLabel = false
}: BookmarkButtonProps) {
  const { user, accessToken } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  if (!user) {
    return null; // Don't show bookmark button for anonymous users
  }

  const handleToggle = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      const newBookmarkState = await bookmarkService.toggleBookmark(
        user.id, 
        questionId, 
        accessToken
      );
      
      onToggle(questionId, newBookmarkState);
      
      toast.success(
        newBookmarkState 
          ? 'Question bookmarked successfully!' 
          : 'Bookmark removed successfully!'
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isToggling}
      className={`flex items-center space-x-1 ${
        isBookmarked 
          ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-500 dark:hover:text-yellow-400' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
      style={{ fontFamily: 'Chivo, sans-serif' }}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="hidden sm:inline-block">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  );
}