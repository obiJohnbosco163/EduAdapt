import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Trophy, Flame, Target, BookOpen, Star, Zap, Crown, Medal,
  ArrowLeft, Lock, CheckCircle2, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  category: 'streak' | 'lessons' | 'subjects' | 'accuracy';
}

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAchievementData();
  }, [user]);

  const fetchAchievementData = async () => {
    try {
      const [{ data: streak }, { data: progress }, { data: diagnostics }] = await Promise.all([
        supabase.from('study_streaks').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('user_progress').select('*').eq('user_id', user!.id),
        supabase.from('diagnostic_results').select('*').eq('user_id', user!.id),
      ]);

      const completedLessons = (progress || []).filter(p => p.status === 'completed').length;
      const currentStreak = streak?.current_streak || 0;
      const totalDays = streak?.total_study_days || 0;
      const correctAnswers = (diagnostics || []).filter(d => d.is_correct).length;
      const totalAnswers = (diagnostics || []).length;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Calculate XP: 50 per lesson, 20 per streak day, 10 per correct answer
      const calculatedXp = (completedLessons * 50) + (totalDays * 20) + (correctAnswers * 10);
      setXp(calculatedXp);
      setLevel(Math.floor(calculatedXp / 500) + 1);

      const achievementDefs: Achievement[] = [
        { id: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson', icon: BookOpen, color: 'text-primary', requirement: 1, currentProgress: completedLessons, unlocked: completedLessons >= 1, category: 'lessons' },
        { id: '5-lessons', title: 'Getting Warmed Up', description: 'Complete 5 lessons', icon: Target, color: 'text-eduadapt-teal', requirement: 5, currentProgress: completedLessons, unlocked: completedLessons >= 5, category: 'lessons' },
        { id: '10-lessons', title: 'Dedicated Learner', description: 'Complete 10 lessons', icon: Star, color: 'text-accent', requirement: 10, currentProgress: completedLessons, unlocked: completedLessons >= 10, category: 'lessons' },
        { id: '25-lessons', title: 'Knowledge Seeker', description: 'Complete 25 lessons', icon: Crown, color: 'text-eduadapt-purple', requirement: 25, currentProgress: completedLessons, unlocked: completedLessons >= 25, category: 'lessons' },
        { id: '50-lessons', title: 'WAEC Ready', description: 'Complete 50 lessons', icon: Trophy, color: 'text-accent', requirement: 50, currentProgress: completedLessons, unlocked: completedLessons >= 50, category: 'lessons' },
        { id: '3-day-streak', title: 'On Fire', description: '3-day study streak', icon: Flame, color: 'text-destructive', requirement: 3, currentProgress: currentStreak, unlocked: currentStreak >= 3, category: 'streak' },
        { id: '7-day-streak', title: 'Week Warrior', description: '7-day study streak', icon: Flame, color: 'text-accent', requirement: 7, currentProgress: currentStreak, unlocked: currentStreak >= 7, category: 'streak' },
        { id: '30-day-streak', title: 'Monthly Champion', description: '30-day study streak', icon: Medal, color: 'text-eduadapt-purple', requirement: 30, currentProgress: currentStreak, unlocked: currentStreak >= 30, category: 'streak' },
        { id: '80-accuracy', title: 'Sharp Mind', description: '80%+ accuracy overall', icon: Zap, color: 'text-primary', requirement: 80, currentProgress: accuracy, unlocked: accuracy >= 80, category: 'accuracy' },
        { id: '100-accuracy', title: 'Perfect Score', description: '100% accuracy in a session', icon: Award, color: 'text-accent', requirement: 100, currentProgress: accuracy, unlocked: accuracy >= 100, category: 'accuracy' },
      ];

      setAchievements(achievementDefs);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const xpForNextLevel = level * 500;
  const xpProgress = ((xp % 500) / 500) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <h1 className="font-display font-bold text-lg">Achievements</h1>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* XP & Level */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-6 text-center">
              <div className="text-5xl font-display font-bold mb-1">Level {level}</div>
              <p className="text-sm opacity-80 mb-4">{xp} XP total</p>
              <div className="space-y-1">
                <Progress value={xpProgress} className="h-3 bg-primary-foreground/20" />
                <p className="text-xs opacity-70">{xp % 500} / 500 XP to Level {level + 1}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold">{unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Unlocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-2xl font-bold">{achievements.length - unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Locked</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement List */}
        <div className="space-y-3">
          {achievements.map((a, i) => {
            const Icon = a.icon;
            const progressPercent = Math.min((a.currentProgress / a.requirement) * 100, 100);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={cn("transition-all", a.unlocked ? "border-primary/30" : "opacity-60")}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        a.unlocked ? "bg-primary/10" : "bg-muted"
                      )}>
                        {a.unlocked ? (
                          <Icon className={cn("h-6 w-6", a.color)} />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{a.title}</h3>
                          {a.unlocked && <CheckCircle2 className="h-4 w-4 text-success" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                        {!a.unlocked && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <Progress value={progressPercent} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">{a.currentProgress}/{a.requirement}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
