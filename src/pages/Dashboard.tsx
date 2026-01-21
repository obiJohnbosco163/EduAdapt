import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  BookOpen, 
  Trophy, 
  Target,
  ChevronRight,
  Play,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicProgress {
  id: string;
  title: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface StudyStreak {
  current_streak: number;
  longest_streak: number;
  total_study_days: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [recentTopics, setRecentTopics] = useState<TopicProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch streak data
      const { data: streakData } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setStreak(streakData);

      // For now, use mock data for topics since we haven't seeded them yet
      setRecentTopics([
        { id: '1', title: 'Number Bases', progress: 75, lessonsCompleted: 3, totalLessons: 4 },
        { id: '2', title: 'Algebraic Expressions', progress: 40, lessonsCompleted: 2, totalLessons: 5 },
        { id: '3', title: 'Linear Equations', progress: 0, lessonsCompleted: 0, totalLessons: 4 },
      ]);
      
      setTotalProgress(35);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  const paceEmoji = {
    slow: '🐢',
    average: '🚶',
    fast: '🚀'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" />
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {firstName[0]}
              </div>
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {getGreeting()}, {firstName}! {paceEmoji[profile?.learning_pace || 'average']}
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready to continue your WAEC prep?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-3 text-center">
                <Flame className="h-5 w-5 text-accent mx-auto mb-1" />
                <p className="text-xl font-bold">{streak?.current_streak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{totalProgress}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-3 text-center">
                <Trophy className="h-5 w-5 text-eduadapt-amber mx-auto mb-1" />
                <p className="text-xl font-bold">{streak?.total_study_days || 0}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-4 pb-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Continue Learning */}
          {recentTopics[0] && recentTopics[0].progress > 0 && (
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="h-2 bg-primary/20">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${recentTopics[0].progress}%` }}
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Continue Learning
                    </p>
                    <h3 className="font-semibold">{recentTopics[0].title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {recentTopics[0].lessonsCompleted}/{recentTopics[0].totalLessons} lessons
                    </p>
                  </div>
                  <Button size="lg" className="rounded-full h-12 w-12 p-0">
                    <Play className="h-5 w-5 ml-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/topics">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-primary/10 mb-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">All Topics</h3>
                  <p className="text-xs text-muted-foreground mt-1">Browse WAEC syllabus</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/ai-tutor">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-accent/20">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="p-3 rounded-xl bg-accent/10 mb-3">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold">AI Tutor</h3>
                  <p className="text-xs text-muted-foreground mt-1">Get help anytime</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Topics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">Your Progress</h2>
              <Link to="/topics" className="text-sm text-primary font-medium">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {recentTopics.map((topic, index) => (
                <Card key={topic.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold",
                        topic.progress > 0 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{topic.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={topic.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-10">
                            {topic.progress}%
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Motivational Message */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-4">
              <p className="font-medium">💪 Keep going!</p>
              <p className="text-sm opacity-90 mt-1">
                Every problem you solve brings you closer to WAEC success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}