import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Zap, 
  Trophy,
  Play,
  CheckCircle2,
  Lock,
  Clock,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

interface LessonWithProgress extends Tables<'lessons'> {
  isCompleted: boolean;
  isLocked: boolean;
}

const learningModes = [
  { id: 'step-by-step', label: 'Step-by-Step', icon: BookOpen, description: 'Detailed explanations' },
  { id: 'practice-heavy', label: 'Practice', icon: Target, description: 'More questions' },
  { id: 'fast-revision', label: 'Quick Review', icon: Zap, description: 'Key points only' },
  { id: 'challenge', label: 'Challenge', icon: Trophy, description: 'WAEC-level' },
];

type LearningMode = 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge';

export default function TopicDetail() {
  const { topicId } = useParams();
  const { user, profile } = useAuth();
  const [selectedMode, setSelectedMode] = useState<LearningMode>((profile?.preferred_mode as LearningMode) || 'step-by-step');
  const [topic, setTopic] = useState<Tables<'topics'> | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchTopicData();
    }
  }, [topicId, user]);

  const fetchTopicData = async () => {
    try {
      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .maybeSingle();

      if (topicError) throw topicError;
      setTopic(topicData);

      // Fetch lessons for this topic
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch user progress if logged in
      let progressData: Tables<'user_progress'>[] = [];
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('topic_id', topicId!);
        progressData = data || [];
      }

      // Combine lessons with progress
      const lessonsWithProgress: LessonWithProgress[] = (lessonsData || []).map((lesson, index) => {
        const progress = progressData.find(p => p.lesson_id === lesson.id);
        const isCompleted = progress?.status === 'completed';
        // Unlock if it's the first lesson OR if the previous lesson is completed
        const isLocked = index > 0 && !lessonsData.slice(0, index).every((l, i) => {
          const lessonProgress = progressData.find(p => p.lesson_id === l.id);
          return lessonProgress?.status === 'completed';
        });

        return {
          ...lesson,
          isCompleted,
          isLocked: false, // For now, don't lock lessons
        };
      });

      setLessons(lessonsWithProgress);
    } catch (error) {
      console.error('Error fetching topic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  // Get exam tips from the first lesson or use defaults
  const examTips = lessons[0]?.exam_tips || [
    'Always show your working clearly',
    'Check your answer by converting back',
    'Practice with past WAEC questions'
  ];

  // Get key formulas from lessons
  const keyFormulas = lessons.flatMap(l => l.key_formulas || []).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="px-4 py-4 space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Topic not found</p>
            <Link to="/topics">
              <Button className="mt-4">Back to Topics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/topics">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold">{topic.title}</h1>
            <p className="text-sm text-muted-foreground">{topic.waec_chapter}</p>
          </div>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm font-bold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {completedLessons} of {lessons.length} lessons completed
            </p>
          </CardContent>
        </Card>

        {/* Learning Mode Selector */}
        <div>
          <h2 className="font-semibold mb-3">Choose Your Learning Style</h2>
          <div className="grid grid-cols-2 gap-3">
            {learningModes.map(mode => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <Card 
                  key={mode.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected ? "border-primary ring-1 ring-primary" : "hover:border-muted-foreground/30"
                  )}
                  onClick={() => setSelectedMode(mode.id as LearningMode)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mode.label}</p>
                        <p className="text-xs text-muted-foreground">{mode.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Lessons List */}
        <div>
          <h2 className="font-semibold mb-3">Lessons</h2>
          {lessons.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Lessons coming soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <Link 
                  key={lesson.id} 
                  to={lesson.isLocked ? '#' : `/lesson/${lesson.id}?mode=${selectedMode}&topic=${topicId}`}
                >
                  <Card className={cn(
                    "transition-all",
                    lesson.isLocked 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:shadow-md hover:border-primary/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold",
                          lesson.isCompleted 
                            ? "bg-success/10 text-success" 
                            : lesson.isLocked 
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                        )}>
                          {lesson.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : lesson.isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{lesson.estimated_duration_minutes} min</span>
                          </div>
                        </div>
                        {!lesson.isLocked && (
                          lesson.isCompleted ? (
                            <Badge variant="secondary" className="text-success">
                              Completed
                            </Badge>
                          ) : (
                            <Button size="sm" className="rounded-full h-8 w-8 p-0">
                              <Play className="h-4 w-4 ml-0.5" />
                            </Button>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Exam Tips */}
        {examTips.length > 0 && (
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                WAEC Exam Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {examTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-accent">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Key Formulas */}
        {keyFormulas.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Formulas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {keyFormulas.map((formula, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg font-mono text-sm">
                  {formula}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
