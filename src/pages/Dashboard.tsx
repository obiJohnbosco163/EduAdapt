import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Logo } from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  Flame, BookOpen, Trophy, Target, ChevronRight, Play, Sparkles, TrendingUp, Award, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const { sendStreakReminder, permission } = usePushNotifications();
  const [streak, setStreak] = useState<StudyStreak | null>(null);
  const [recentTopics, setRecentTopics] = useState<TopicProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  // Send streak reminder on mount if they have a streak
  useEffect(() => {
    if (streak && streak.current_streak > 0 && permission === 'granted') {
      sendStreakReminder(streak.current_streak);
    }
  }, [streak]);

  const fetchDashboardData = async () => {
    try {
      const { data: streakData } = await supabase.from('study_streaks').select('*').eq('user_id', user!.id).maybeSingle();
      setStreak(streakData);

      const { data: topicsData } = await supabase.from('topics').select('id, title').order('order_index').limit(5);
      const { data: lessonsData } = await supabase.from('lessons').select('topic_id');
      const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', user!.id);

      const topicsWithProgress = (topicsData || []).map(topic => {
        const topicLessons = lessonsData?.filter(l => l.topic_id === topic.id) || [];
        const completedLessons = (progressData || []).filter(p => p.topic_id === topic.id && p.status === 'completed').length;
        const totalLessons = topicLessons.length || 4;
        return { ...topic, progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0, lessonsCompleted: completedLessons, totalLessons };
      });

      setRecentTopics(topicsWithProgress);
      const allTopicsCount = 12;
      const completedTopics = (progressData || []).filter(p => p.status === 'completed').length;
      setTotalProgress(Math.round((completedTopics / (allTopicsCount * 4)) * 100));
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
  const paceEmoji: Record<string, string> = { slow: '🐢', average: '🚶', fast: '🚀' };

  const motivationalMessages = [
    "Every problem you solve brings you closer to WAEC success.",
    "Consistency beats intensity. Keep showing up!",
    "Your future self will thank you for studying today.",
    "Small daily progress leads to extraordinary results.",
  ];
  const dailyMessage = motivationalMessages[new Date().getDate() % motivationalMessages.length];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero px-4 pt-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Logo size="sm" />
            <Link to="/profile">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {firstName[0]}
              </div>
            </Link>
          </div>

          <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {getGreeting()}, {firstName}! {paceEmoji[profile?.learning_pace || 'average']}
            </h1>
            <p className="text-muted-foreground mt-1">Ready to continue your WAEC prep?</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Flame, value: streak?.current_streak || 0, label: 'Day Streak', color: 'text-accent' },
              { icon: Target, value: `${totalProgress}%`, label: 'Complete', color: 'text-primary' },
              { icon: Trophy, value: streak?.total_study_days || 0, label: 'Days', color: 'text-eduadapt-amber' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                  <Card className="bg-card/80 backdrop-blur border-0 shadow-lg">
                    <CardContent className="p-3 text-center">
                      <Icon className={cn("h-5 w-5 mx-auto mb-1", stat.color)} />
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 pb-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Continue Learning */}
          {recentTopics[0] && recentTopics[0].progress > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="h-2 bg-primary/20">
                  <div className="h-full bg-primary transition-all" style={{ width: `${recentTopics[0].progress}%` }} />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Continue Learning</p>
                      <h3 className="font-semibold">{recentTopics[0].title}</h3>
                      <p className="text-sm text-muted-foreground">{recentTopics[0].lessonsCompleted}/{recentTopics[0].totalLessons} lessons</p>
                    </div>
                    <Button size="lg" className="rounded-full h-12 w-12 p-0">
                      <Play className="h-5 w-5 ml-0.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            <Link to="/subjects">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary/20">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <div className="p-2.5 rounded-xl bg-primary/10 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xs">Subjects</h3>
                </CardContent>
              </Card>
            </Link>
            <Link to="/ai-tutor">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-accent/20">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <div className="p-2.5 rounded-xl bg-accent/10 mb-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-xs">AI Tutor</h3>
                </CardContent>
              </Card>
            </Link>
            <Link to="/achievements">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-eduadapt-purple/20">
                <CardContent className="p-3 flex flex-col items-center text-center">
                  <div className="p-2.5 rounded-xl bg-eduadapt-purple/10 mb-2">
                    <Award className="h-5 w-5 text-eduadapt-purple" />
                  </div>
                  <h3 className="font-semibold text-xs">Achievements</h3>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">Your Progress</h2>
              <Link to="/subjects" className="text-sm text-primary font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {recentTopics.map((topic, index) => (
                <motion.div key={topic.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * index }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold", topic.progress > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate text-sm">{topic.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={topic.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-10">{topic.progress}%</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-4">
              <p className="font-medium">💪 Keep going!</p>
              <p className="text-sm opacity-90 mt-1">{dailyMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
