import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Trophy, Target, Clock, Zap } from 'lucide-react';

interface ProgressStats {
  totalQuestions: number;
  completedQuestions: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  currentStreak: number;
  longestStreak: number;
}

interface ProgressTrackerProps {
  stats: ProgressStats;
}

export function ProgressTracker({ stats }: ProgressTrackerProps) {
  const completionRate = (stats.completedQuestions / stats.totalQuestions) * 100;
  const easyRate = (stats.easyCompleted / stats.totalEasy) * 100;
  const mediumRate = (stats.mediumCompleted / stats.totalMedium) * 100;
  const hardRate = (stats.hardCompleted / stats.totalHard) * 100;

  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first question',
      earned: stats.completedQuestions >= 1,
      icon: Target
    },
    {
      name: 'Getting Started',
      description: 'Complete 5 questions',
      earned: stats.completedQuestions >= 5,
      icon: Zap
    },
    {
      name: 'Consistency',
      description: 'Maintain a 7-day streak',
      earned: stats.currentStreak >= 7,
      icon: Clock
    },
    {
      name: 'Champion',
      description: 'Complete 25 questions',
      earned: stats.completedQuestions >= 25,
      icon: Trophy
    }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Chivo, sans-serif' }}>
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            <Target className="w-5 h-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ fontFamily: 'Chivo, sans-serif' }}>Questions Completed</span>
            <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
              {stats.completedQuestions}/{stats.totalQuestions}
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
            {completionRate.toFixed(1)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Chivo, sans-serif' }}>Progress by Difficulty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Easy</Badge>
                  <span className="text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>{stats.easyCompleted}/{stats.totalEasy}</span>
                </div>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {easyRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={easyRate} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium</Badge>
                  <span className="text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>{stats.mediumCompleted}/{stats.totalMedium}</span>
                </div>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {mediumRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={mediumRate} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Hard</Badge>
                  <span className="text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>{stats.hardCompleted}/{stats.totalHard}</span>
                </div>
                <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                  {hardRate.toFixed(0)}%
                </span>
              </div>
              <Progress value={hardRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Counter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            <Zap className="w-5 h-5" />
            Practice Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'Chivo, sans-serif' }}>
              {stats.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
              Current streak • Best: {stats.longestStreak} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Chivo, sans-serif' }}>
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    achievement.earned 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/50' 
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <Icon 
                    className={`w-6 h-6 ${
                      achievement.earned ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                    }`} 
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm" style={{ fontFamily: 'Chivo, sans-serif' }}>{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Chivo, sans-serif' }}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}