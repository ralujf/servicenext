import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { votingService, QuestionVotes } from '../utils/votingService';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner';
import { supabaseClient, getAccessToken } from '../utils/supabase/client';

interface VotingButtonsProps {
  questionId: string;
  initialVotes?: QuestionVotes;
  onVotesUpdate?: (votes: QuestionVotes) => void;
}

export function VotingButtons({ questionId, initialVotes, onVotesUpdate }: VotingButtonsProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState<QuestionVotes>(
    initialVotes || {
      questionId,
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0
    }
  );
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial vote data
  useEffect(() => {
    loadVoteData();
  }, [questionId, user]);

  const loadVoteData = async () => {
    setIsLoading(true);
    try {
      // Load vote counts
      if (!initialVotes) {
        const questionVotes = await votingService.getQuestionVotes(questionId);
        setVotes(questionVotes);
        onVotesUpdate?.(questionVotes);
      }

      // Load user's vote (only for authenticated users)
      if (user) {
        try {
          const accessToken = await getAccessToken();

          if (accessToken) {
            const vote = await votingService.getUserVote(questionId, accessToken);
            setUserVote(vote?.voteType || null);
          }
        } catch (error) {
          console.error('Error loading user vote:', error);
        }
      } else {
        // Anonymous users cannot vote, so no user vote to load
        setUserVote(null);
      }
    } catch (error) {
      console.error('Error loading vote data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    // Disable voting for anonymous users
    if (!user) {
      toast.error('Please sign in to vote on questions');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      // Authenticated user vote only
      const accessToken = await getAccessToken();

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const result = await votingService.submitVote(questionId, voteType, accessToken);

      if (result.success) {
        const newVotes = result.votes;
        setVotes(newVotes);
        onVotesUpdate?.(newVotes);
        
        // Update user vote state
        if (userVote === voteType) {
          // Toggling off the same vote
          setUserVote(null);
        } else {
          // New vote or changing vote
          setUserVote(voteType);
        }
        
        // Show success message
        if (userVote === voteType) {
          toast.success('Vote removed');
        } else {
          toast.success(`${voteType === 'up' ? 'Upvoted' : 'Downvoted'} question`);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 p-2 min-w-[60px]">
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
        <div className="w-6 h-4 bg-muted animate-pulse rounded" />
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2 min-w-[60px]" style={{ fontFamily: 'Chivo, sans-serif' }}>
      {/* Upvote Button */}
      <Button
        variant={userVote === 'up' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isVoting || !user}
        className={`h-8 w-8 p-0 transition-all duration-200 ${
          userVote === 'up' 
            ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' 
            : !user
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950 dark:hover:border-green-700'
        }`}
        title={user ? 'Upvote this question' : 'Sign in to vote on questions'}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>

      {/* Vote Count */}
      <Badge 
        variant="secondary" 
        className="text-xs px-2 py-1 min-w-[32px] justify-center"
      >
        {votes.totalVotes > 999 ? `${Math.floor(votes.totalVotes / 1000)}k` : votes.totalVotes}
      </Badge>

      {/* Downvote Button */}
      <Button
        variant={userVote === 'down' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isVoting || !user}
        className={`h-8 w-8 p-0 transition-all duration-200 ${
          userVote === 'down' 
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
            : !user
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950 dark:hover:border-red-700'
        }`}
        title={user ? 'Downvote this question' : 'Sign in to vote on questions'}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>


    </div>
  );
}