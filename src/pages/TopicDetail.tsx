import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
}

const mockLessons: Lesson[] = [
  { id: '1', title: 'Introduction to Number Bases', duration: 10, isCompleted: true, isLocked: false },
  { id: '2', title: 'Converting from Base 10', duration: 15, isCompleted: true, isLocked: false },
  { id: '3', title: 'Converting to Base 10', duration: 12, isCompleted: true, isLocked: false },
  { id: '4', title: 'Operations in Different Bases', duration: 20, isCompleted: false, isLocked: false },
];

const learningModes = [
  { id: 'step-by-step', label: 'Step-by-Step', icon: BookOpen, description: 'Detailed explanations' },
  { id: 'practice-heavy', label: 'Practice', icon: Target, description: 'More questions' },
  { id: 'fast-revision', label: 'Quick Review', icon: Zap, description: 'Key points only' },
  { id: 'challenge', label: 'Challenge', icon: Trophy, description: 'WAEC-level' },
];

type LearningMode = 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge';

export default function TopicDetail() {
  const { topicId } = useParams();
  const { profile } = useAuth();
  const [selectedMode, setSelectedMode] = useState<LearningMode>(profile?.preferred_mode || 'step-by-step');
  const [selectedMode, setSelectedMode] = useState(profile?.preferred_mode || 'step-by-step');
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);

  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const progress = Math.round((completedLessons / lessons.length) * 100);

  // Mock topic data
  const topic = {
    id: topicId,
    title: 'Number Bases',
    description: 'Learn to convert between different number bases and perform arithmetic operations in various bases.',
    waec_chapter: 'Number and Numeration',
    keyFormulas: ['Base conversion: N₁₀ = d₀×b⁰ + d₁×b¹ + d₂×b² + ...'],
    examTips: [
      'Always show your working clearly',
      'Check your answer by converting back',
      'Common bases in WAEC: 2, 5, 8, 10'
    ]
  };

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
                  onClick={() => setSelectedMode(mode.id)}
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
          <div className="space-y-2">
            {lessons.map((lesson, index) => (
              <Link 
                key={lesson.id} 
                to={lesson.isLocked ? '#' : `/lesson/${lesson.id}?mode=${selectedMode}`}
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
                          <span>{lesson.duration} min</span>
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
        </div>

        {/* Exam Tips */}
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              WAEC Exam Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {topic.examTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-accent">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Formulas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Formulas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topic.keyFormulas.map((formula, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg font-mono text-sm">
                {formula}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}