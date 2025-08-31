import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2.56.0';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add logging
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to get current date string
function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to calculate streak
function calculateStreak(completedQuestions: any[], lastCompletionDate: string | null): { currentStreak: number; longestStreak: number } {
  if (completedQuestions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort completion dates
  const dates = completedQuestions
    .map(q => q.completedDate)
    .filter(date => date)
    .sort()
    .reverse();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = getCurrentDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak
  if (dates[0] === today || dates[0] === yesterday) {
    let streakDate = new Date(dates[0]);
    for (const date of dates) {
      const checkDate = new Date(date);
      const diffDays = Math.floor((streakDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        currentStreak++;
        streakDate = checkDate;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let streakStart = new Date(dates[0]);
  tempStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const prevDate = new Date(dates[i - 1]);
    const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

// Routes

// Auth signup
app.post('/make-server-958a9ca9/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { name: name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return c.json({ error: 'Signup failed. Please try again.' }, 500);
  }
});

// Get user progress
app.get('/make-server-958a9ca9/progress/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get user progress from KV store
    const userProgress = await kv.get(`user_progress:${userId}`);
    
    if (!userProgress) {
      // Return default progress if not found
      const defaultProgress = {
        userId,
        completedQuestions: [],
        easyCompleted: 0,
        mediumCompleted: 0,
        hardCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      };
      
      // Store default progress
      await kv.set(`user_progress:${userId}`, defaultProgress);
      return c.json(defaultProgress);
    }
    
    return c.json(userProgress);
  } catch (error) {
    console.error('Error getting user progress:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Complete a question
app.post('/make-server-958a9ca9/progress/:userId/complete', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { questionId, difficulty } = await c.req.json();
    
    // Get current progress
    let userProgress = await kv.get(`user_progress:${userId}`);
    
    if (!userProgress) {
      userProgress = {
        userId,
        completedQuestions: [],
        easyCompleted: 0,
        mediumCompleted: 0,
        hardCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
      };
    }
    
    // Check if question is already completed
    if (userProgress.completedQuestions.some((q: any) => q.questionId === questionId)) {
      return c.json(userProgress);
    }
    
    const completionDate = getCurrentDateString();
    
    // Add completed question
    userProgress.completedQuestions.push({
      questionId,
      difficulty,
      completedDate: completionDate,
    });
    
    // Update difficulty counters
    switch (difficulty) {
      case 'Easy':
        userProgress.easyCompleted++;
        break;
      case 'Medium':
        userProgress.mediumCompleted++;
        break;
      case 'Hard':
        userProgress.hardCompleted++;
        break;
    }
    
    // Update last completion date
    userProgress.lastCompletionDate = completionDate;
    
    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreak(userProgress.completedQuestions, userProgress.lastCompletionDate);
    userProgress.currentStreak = currentStreak;
    userProgress.longestStreak = Math.max(userProgress.longestStreak, longestStreak);
    
    // Save updated progress
    await kv.set(`user_progress:${userId}`, userProgress);
    
    // Return simplified progress for frontend
    return c.json({
      userId: userProgress.userId,
      completedQuestions: userProgress.completedQuestions.map((q: any) => q.questionId),
      easyCompleted: userProgress.easyCompleted,
      mediumCompleted: userProgress.mediumCompleted,
      hardCompleted: userProgress.hardCompleted,
      currentStreak: userProgress.currentStreak,
      longestStreak: userProgress.longestStreak,
      lastCompletionDate: userProgress.lastCompletionDate,
    });
  } catch (error) {
    console.error('Error completing question:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user bookmarks
app.get('/make-server-958a9ca9/bookmarks/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('Error verifying user for bookmarks:', userError);
      return c.json({ error: 'Invalid user authentication' }, 401);
    }

    // Verify the user matches the requested userId
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user bookmarks' }, 403);
    }

    // Get bookmarks for this user
    const bookmarks = await kv.get(`user_bookmarks:${userId}`) || [];
    
    return c.json({ bookmarks });
  } catch (error) {
    console.error('Error getting user bookmarks:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Toggle bookmark
app.post('/make-server-958a9ca9/bookmarks/toggle', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('Error verifying user for bookmark toggle:', userError);
      return c.json({ error: 'Invalid user authentication' }, 401);
    }

    const { userId, questionId } = await c.req.json();
    
    if (!userId || !questionId) {
      return c.json({ error: 'Missing required fields: userId, questionId' }, 400);
    }

    // Verify the user matches the requested userId
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user bookmarks' }, 403);
    }

    // Get current bookmarks
    let bookmarks = await kv.get(`user_bookmarks:${userId}`) || [];
    
    // Check if already bookmarked
    const isBookmarked = bookmarks.includes(questionId);
    
    if (isBookmarked) {
      // Remove bookmark
      bookmarks = bookmarks.filter((id: string) => id !== questionId);
    } else {
      // Add bookmark
      bookmarks.push(questionId);
    }
    
    // Save updated bookmarks
    await kv.set(`user_bookmarks:${userId}`, bookmarks);
    
    return c.json({ 
      success: true, 
      bookmarked: !isBookmarked,
      bookmarks 
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Add bookmark
app.post('/make-server-958a9ca9/bookmarks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('Error verifying user for add bookmark:', userError);
      return c.json({ error: 'Invalid user authentication' }, 401);
    }

    const { userId, questionId } = await c.req.json();
    
    if (!userId || !questionId) {
      return c.json({ error: 'Missing required fields: userId, questionId' }, 400);
    }

    // Verify the user matches the requested userId
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user bookmarks' }, 403);
    }

    // Get current bookmarks
    let bookmarks = await kv.get(`user_bookmarks:${userId}`) || [];
    
    // Add bookmark if not already present
    if (!bookmarks.includes(questionId)) {
      bookmarks.push(questionId);
      await kv.set(`user_bookmarks:${userId}`, bookmarks);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Remove bookmark
app.delete('/make-server-958a9ca9/bookmarks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('Error verifying user for remove bookmark:', userError);
      return c.json({ error: 'Invalid user authentication' }, 401);
    }

    const { userId, questionId } = await c.req.json();
    
    if (!userId || !questionId) {
      return c.json({ error: 'Missing required fields: userId, questionId' }, 400);
    }

    // Verify the user matches the requested userId
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized access to user bookmarks' }, 403);
    }

    // Get current bookmarks
    let bookmarks = await kv.get(`user_bookmarks:${userId}`) || [];
    
    // Remove bookmark
    bookmarks = bookmarks.filter((id: string) => id !== questionId);
    
    // Save updated bookmarks
    await kv.set(`user_bookmarks:${userId}`, bookmarks);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit community solution
app.post('/make-server-958a9ca9/community-solutions/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const { code, language = 'javascript' } = await c.req.json();
    
    if (!code || !code.trim()) {
      return c.json({ error: 'Code is required' }, 400);
    }

    // Get existing solutions for this question
    const existingSolutions = await kv.get(`community_solutions:${questionId}`) || [];
    
    // Check if user already submitted a solution
    const userSolutionIndex = existingSolutions.findIndex((sol: any) => sol.userId === user.id);
    
    const newSolution = {
      id: `${user.id}_${Date.now()}`,
      userId: user.id,
      userName: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      code: code.trim(),
      language,
      submittedAt: new Date().toISOString(),
    };

    if (userSolutionIndex >= 0) {
      // Update existing solution
      existingSolutions[userSolutionIndex] = newSolution;
    } else {
      // Add new solution
      existingSolutions.push(newSolution);
    }

    // Store updated solutions
    await kv.set(`community_solutions:${questionId}`, existingSolutions);

    return c.json({ success: true, solution: newSolution });
  } catch (error) {
    console.error('Error submitting community solution:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get community solutions for a question
app.get('/make-server-958a9ca9/community-solutions/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const solutions = await kv.get(`community_solutions:${questionId}`) || [];
    
    // Sort by submission date (newest first)
    const sortedSolutions = solutions.sort((a: any, b: any) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return c.json({ solutions: sortedSolutions });
  } catch (error) {
    console.error('Error getting community solutions:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Reset user progress
app.delete('/make-server-958a9ca9/progress/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const resetProgress = {
      userId,
      completedQuestions: [],
      easyCompleted: 0,
      mediumCompleted: 0,
      hardCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
    };
    
    await kv.set(`user_progress:${userId}`, resetProgress);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Initialize embeddings endpoint - now returns unavailable message
app.post('/make-server-958a9ca9/initialize-embeddings', async (c) => {
  console.log('Embedding initialization requested - AI search not available in this deployment');
  
  return c.json({ 
    success: false, 
    error: 'AI search requires OpenAI API configuration',
    message: 'This deployment uses text-based search only. AI search requires OpenAI API setup.'
  });
});

// Vector search endpoint - returns empty results since embeddings aren't available
app.post('/make-server-958a9ca9/search-questions', async (c) => {
  console.log('Vector search requested - not available, falling back to frontend text search');
  
  return c.json({ 
    results: [],
    fallback: true,
    message: 'Vector search not available - use text search instead'
  });
});

// Search suggestions endpoint - returns empty suggestions 
app.post('/make-server-958a9ca9/search-suggestions', async (c) => {
  console.log('Vector suggestions requested - not available, falling back to frontend text suggestions');
  
  return c.json({
    suggestions: [],
    fallback: true,
    message: 'Vector suggestions not available - use text suggestions instead'
  });
});

// Get votes for a specific question
app.get('/make-server-958a9ca9/votes/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    
    // Get vote data from KV store
    const voteData = await kv.get(`question_votes:${questionId}`) || { upvotes: 0, downvotes: 0 };
    
    return c.json({
      questionId,
      upvotes: voteData.upvotes || 0,
      downvotes: voteData.downvotes || 0,
      totalVotes: (voteData.upvotes || 0) + (voteData.downvotes || 0)
    });
  } catch (error) {
    console.error('Error getting question votes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get votes for multiple questions
app.post('/make-server-958a9ca9/votes/bulk', async (c) => {
  try {
    const { questionIds } = await c.req.json();
    
    if (!Array.isArray(questionIds)) {
      return c.json({ error: 'questionIds must be an array' }, 400);
    }
    
    const result: { [questionId: string]: any } = {};
    
    // Get votes for each question
    for (const questionId of questionIds) {
      const voteData = await kv.get(`question_votes:${questionId}`) || { upvotes: 0, downvotes: 0 };
      result[questionId] = {
        questionId,
        upvotes: voteData.upvotes || 0,
        downvotes: voteData.downvotes || 0,
        totalVotes: (voteData.upvotes || 0) + (voteData.downvotes || 0)
      };
    }
    
    return c.json(result);
  } catch (error) {
    console.error('Error getting bulk votes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit a vote (authenticated users)
app.post('/make-server-958a9ca9/votes/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const { voteType } = await c.req.json();
    
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return c.json({ error: 'Invalid vote type. Must be "up" or "down"' }, 400);
    }

    // Get current vote data
    let voteData = await kv.get(`question_votes:${questionId}`) || { upvotes: 0, downvotes: 0 };
    
    // Get user's previous vote
    const userVoteKey = `user_vote:${user.id}:${questionId}`;
    const existingVote = await kv.get(userVoteKey);
    
    // Update vote counts
    if (existingVote) {
      // Remove previous vote
      if (existingVote.voteType === 'up') {
        voteData.upvotes = Math.max(0, (voteData.upvotes || 0) - 1);
      } else {
        voteData.downvotes = Math.max(0, (voteData.downvotes || 0) - 1);
      }
      
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await kv.del(userVoteKey);
      } else {
        // Different vote type, add new vote
        if (voteType === 'up') {
          voteData.upvotes = (voteData.upvotes || 0) + 1;
        } else {
          voteData.downvotes = (voteData.downvotes || 0) + 1;
        }
        
        // Update user vote
        await kv.set(userVoteKey, {
          questionId,
          userId: user.id,
          voteType,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // New vote
      if (voteType === 'up') {
        voteData.upvotes = (voteData.upvotes || 0) + 1;
      } else {
        voteData.downvotes = (voteData.downvotes || 0) + 1;
      }
      
      // Store user vote
      await kv.set(userVoteKey, {
        questionId,
        userId: user.id,
        voteType,
        timestamp: new Date().toISOString()
      });
    }
    
    // Store updated vote data
    await kv.set(`question_votes:${questionId}`, voteData);
    
    return c.json({
      success: true,
      votes: {
        questionId,
        upvotes: voteData.upvotes || 0,
        downvotes: voteData.downvotes || 0,
        totalVotes: (voteData.upvotes || 0) + (voteData.downvotes || 0)
      }
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit anonymous vote
app.post('/make-server-958a9ca9/votes/:questionId/anonymous', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const { voteType, sessionId } = await c.req.json();
    
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return c.json({ error: 'Invalid vote type. Must be "up" or "down"' }, 400);
    }
    
    if (!sessionId) {
      return c.json({ error: 'Session ID required for anonymous voting' }, 400);
    }

    // Get current vote data
    let voteData = await kv.get(`question_votes:${questionId}`) || { upvotes: 0, downvotes: 0 };
    
    // Get anonymous user's previous vote
    const anonVoteKey = `anon_vote:${sessionId}:${questionId}`;
    const existingVote = await kv.get(anonVoteKey);
    
    // Update vote counts
    if (existingVote) {
      // Remove previous vote
      if (existingVote.voteType === 'up') {
        voteData.upvotes = Math.max(0, (voteData.upvotes || 0) - 1);
      } else {
        voteData.downvotes = Math.max(0, (voteData.downvotes || 0) - 1);
      }
      
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await kv.del(anonVoteKey);
      } else {
        // Different vote type, add new vote
        if (voteType === 'up') {
          voteData.upvotes = (voteData.upvotes || 0) + 1;
        } else {
          voteData.downvotes = (voteData.downvotes || 0) + 1;
        }
        
        // Update anonymous vote
        await kv.set(anonVoteKey, {
          questionId,
          sessionId,
          voteType,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // New vote
      if (voteType === 'up') {
        voteData.upvotes = (voteData.upvotes || 0) + 1;
      } else {
        voteData.downvotes = (voteData.downvotes || 0) + 1;
      }
      
      // Store anonymous vote
      await kv.set(anonVoteKey, {
        questionId,
        sessionId,
        voteType,
        timestamp: new Date().toISOString()
      });
    }
    
    // Store updated vote data
    await kv.set(`question_votes:${questionId}`, voteData);
    
    return c.json({
      success: true,
      votes: {
        questionId,
        upvotes: voteData.upvotes || 0,
        downvotes: voteData.downvotes || 0,
        totalVotes: (voteData.upvotes || 0) + (voteData.downvotes || 0)
      }
    });
  } catch (error) {
    console.error('Error submitting anonymous vote:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user's vote for a question
app.get('/make-server-958a9ca9/votes/:questionId/user', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const userVoteKey = `user_vote:${user.id}:${questionId}`;
    const userVote = await kv.get(userVoteKey);
    
    if (!userVote) {
      return c.json({ error: 'No vote found' }, 404);
    }
    
    return c.json(userVote);
  } catch (error) {
    console.error('Error getting user vote:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user's votes for multiple questions
app.post('/make-server-958a9ca9/votes/user/bulk', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const { questionIds } = await c.req.json();
    
    if (!Array.isArray(questionIds)) {
      return c.json({ error: 'questionIds must be an array' }, 400);
    }
    
    const result: { [questionId: string]: any } = {};
    
    // Get user's vote for each question
    for (const questionId of questionIds) {
      const userVoteKey = `user_vote:${user.id}:${questionId}`;
      const userVote = await kv.get(userVoteKey);
      result[questionId] = userVote || null;
    }
    
    return c.json(result);
  } catch (error) {
    console.error('Error getting user votes:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Submit a code submission
app.post('/make-server-958a9ca9/submissions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const { questionId, code, isCorrect, executionTime, testsPassed, totalTests } = await c.req.json();
    
    if (!questionId || !code || typeof isCorrect !== 'boolean') {
      return c.json({ error: 'Missing required fields: questionId, code, isCorrect' }, 400);
    }

    // Get existing submissions for this user and question
    const userSubmissionsKey = `user_submissions:${user.id}:${questionId}`;
    let submissions = await kv.get(userSubmissionsKey) || [];

    // Create new submission
    const submission = {
      id: `${user.id}_${questionId}_${Date.now()}`,
      questionId,
      userId: user.id,
      code: code.trim(),
      isCorrect,
      submissionTime: new Date().toISOString(),
      executionTime: executionTime || undefined,
      testsPassed: testsPassed || undefined,
      totalTests: totalTests || undefined
    };

    // Add to submissions array
    submissions.push(submission);

    // Keep only the last 50 submissions to prevent unlimited growth
    if (submissions.length > 50) {
      submissions = submissions.slice(-50);
    }

    // Store updated submissions
    await kv.set(userSubmissionsKey, submissions);

    return c.json({ success: true, submission });
  } catch (error) {
    console.error('Error submitting code:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get user submissions for a question
app.get('/make-server-958a9ca9/submissions/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    // Get submissions for this user and question
    const userSubmissionsKey = `user_submissions:${user.id}:${questionId}`;
    const submissions = await kv.get(userSubmissionsKey) || [];

    return c.json({ success: true, submissions });
  } catch (error) {
    console.error('Error getting submissions:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Generate AI explanation for solution
app.post('/make-server-958a9ca9/ai-explanation/:questionId', async (c) => {
  try {
    const questionId = c.req.param('questionId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({ error: 'Invalid user' }, 401);
    }

    const { questionTitle, questionDescription, userCode, isCorrect } = await c.req.json();
    
    if (!questionTitle || !questionDescription || !userCode) {
      return c.json({ error: 'Missing required fields: questionTitle, questionDescription, userCode' }, 400);
    }

    // Check if user has at least 7 submissions for this question
    const userSubmissionsKey = `user_submissions:${user.id}:${questionId}`;
    const submissions = await kv.get(userSubmissionsKey) || [];
    
    if (submissions.length < 7) {
      return c.json({ 
        error: 'AI explanations are available after 7 submissions',
        submissionCount: submissions.length,
        required: 7
      }, 403);
    }

    // Check if we have OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        error: 'AI explanations are not available - OpenAI API not configured',
        message: 'This feature requires OpenAI API configuration'
      }, 503);
    }

    // Check for cached explanation
    const cacheKey = `ai_explanation:${questionId}:${user.id}:${btoa(userCode).slice(0, 20)}`;
    const cachedExplanation = await kv.get(cacheKey);
    
    if (cachedExplanation) {
      return c.json({ 
        success: true, 
        explanation: cachedExplanation,
        cached: true 
      });
    }

    // Create the prompt for OpenAI
    const systemPrompt = `You are an expert ServiceNow developer and coding instructor. Your task is to provide clear, educational explanations of code solutions for ServiceNow coding challenges.

Your explanations should:
1. Break down the solution approach in logical steps
2. Explain key ServiceNow concepts, APIs, and best practices used
3. Highlight clever techniques or optimizations
4. Point out potential issues or areas for improvement
5. Be educational and help the user understand the underlying concepts
6. Keep explanations concise but comprehensive (aim for 200-400 words)

Focus on ServiceNow-specific aspects like GlideRecord operations, business rules, script includes, client scripts, and platform APIs.`;

    const userPrompt = `Question: ${questionTitle}

Description: ${questionDescription}

User's Solution:
\`\`\`javascript
${userCode}
\`\`\`

Solution Status: ${isCorrect ? 'Correct' : 'Incorrect/Failed'}

Please provide a detailed explanation of this solution, focusing on the approach, ServiceNow concepts used, and any insights that would help the developer learn.`;

    try {
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content;

      if (!explanation) {
        throw new Error('No explanation generated');
      }

      // Cache the explanation for future requests
      await kv.set(cacheKey, explanation);

      return c.json({ 
        success: true, 
        explanation,
        cached: false 
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return c.json({ 
      error: 'Failed to generate explanation',
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);