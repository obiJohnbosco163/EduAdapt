import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  Target, 
  Zap, 
  Trophy,
  CheckCircle2,
  XCircle,
  Lightbulb,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

type LearningMode = 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge';

interface ContentSection {
  title: string;
  content: string;
}

interface StepByStepContent {
  sections: ContentSection[];
}

interface FastRevisionContent {
  keyPoints: string[];
}

interface PracticeQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface PracticeContent {
  questions: PracticeQuestion[];
}

interface ChallengeProblem {
  question: string;
  answer: string;
  hint: string;
}

interface ChallengeContent {
  problems: ChallengeProblem[];
}

export default function Lesson() {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const mode = (searchParams.get('mode') as LearningMode) || 'step-by-step';
  const topicId = searchParams.get('topic');
  
  const [lesson, setLesson] = useState<Tables<'lessons'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContent = () => {
    if (!lesson) return null;
    
    switch (mode) {
      case 'step-by-step':
        return lesson.content_step_by_step as unknown as StepByStepContent | null;
      case 'practice-heavy':
        return lesson.content_practice_heavy as unknown as PracticeContent | null;
      case 'fast-revision':
        return lesson.content_fast_revision as unknown as FastRevisionContent | null;
      case 'challenge':
        return lesson.content_challenge as unknown as ChallengeContent | null;
      default:
        return lesson.content_step_by_step as unknown as StepByStepContent | null;
    }
  };

  const markLessonComplete = async () => {
    if (!user || !lesson || !topicId) return;

    try {
      // Check if progress already exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_progress')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            learning_mode_used: mode
          })
          .eq('id', existingProgress.id);
      } else {
        // Create new progress
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            lesson_id: lesson.id,
            topic_id: topicId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            learning_mode_used: mode
          });
      }

      toast({ title: "Lesson completed! 🎉" });
      navigate(`/topics/${topicId}`);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const handleCheckAnswer = (correctIndex: number) => {
    setShowResult(true);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'step-by-step': return BookOpen;
      case 'practice-heavy': return Target;
      case 'fast-revision': return Zap;
      case 'challenge': return Trophy;
      default: return BookOpen;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'step-by-step': return 'Step-by-Step';
      case 'practice-heavy': return 'Practice Mode';
      case 'fast-revision': return 'Quick Review';
      case 'challenge': return 'Challenge Mode';
      default: return 'Learning';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="px-4 py-4 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Lesson not found</p>
            <Link to="/topics">
              <Button className="mt-4">Back to Topics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const content = getContent();
  const ModeIcon = getModeIcon();

  // Render based on mode
  const renderContent = () => {
    if (!content) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Content for this learning mode is coming soon!</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different learning style.</p>
          </CardContent>
        </Card>
      );
    }

    switch (mode) {
      case 'step-by-step': {
        const stepContent = content as StepByStepContent;
        const sections = stepContent.sections || [];
        const currentSection = sections[currentSectionIndex];
        const totalSections = sections.length;
        
        return (
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <Progress value={((currentSectionIndex + 1) / totalSections) * 100} className="flex-1" />
              <span className="text-sm text-muted-foreground">
                {currentSectionIndex + 1}/{totalSections}
              </span>
            </div>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentSection?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {currentSection?.content}
                </p>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentSectionIndex(i => i - 1)}
                disabled={currentSectionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentSectionIndex === totalSections - 1 ? (
                <Button onClick={markLessonComplete}>
                  Complete Lesson
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => setCurrentSectionIndex(i => i + 1)}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        );
      }

      case 'fast-revision': {
        const revisionContent = content as FastRevisionContent;
        const keyPoints = revisionContent.keyPoints || [];
        
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Key Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={markLessonComplete} className="w-full">
              Mark as Reviewed
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          </div>
        );
      }

      case 'practice-heavy': {
        const practiceContent = content as PracticeContent;
        const questions = practiceContent.questions || [];
        const currentQuestion = questions[0]; // Show first question
        
        if (!currentQuestion) {
          return (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No practice questions available yet.</p>
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedAnswer === index ? (showResult ? (index === currentQuestion.answer ? "default" : "destructive") : "default") : "outline"}
                    className={cn(
                      "w-full justify-start text-left h-auto py-3 px-4",
                      showResult && index === currentQuestion.answer && "bg-success text-success-foreground"
                    )}
                    onClick={() => {
                      if (!showResult) {
                        setSelectedAnswer(index);
                      }
                    }}
                    disabled={showResult}
                  >
                    <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {showResult && index === currentQuestion.answer && (
                      <CheckCircle2 className="h-5 w-5 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQuestion.answer && (
                      <XCircle className="h-5 w-5 ml-auto" />
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {!showResult && selectedAnswer !== null && (
              <Button 
                onClick={() => handleCheckAnswer(currentQuestion.answer)} 
                className="w-full"
              >
                Check Answer
              </Button>
            )}

            {showResult && (
              <div className="space-y-3">
                {selectedAnswer === currentQuestion.answer ? (
                  <Card className="border-success bg-success/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <span className="font-medium text-success">Correct! Great job!</span>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-destructive bg-destructive/5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-destructive" />
                      <span className="font-medium text-destructive">
                        Not quite. The correct answer is {String.fromCharCode(65 + currentQuestion.answer)}.
                      </span>
                    </CardContent>
                  </Card>
                )}
                
                <Button onClick={markLessonComplete} className="w-full">
                  Complete Lesson
                </Button>
              </div>
            )}
          </div>
        );
      }

      case 'challenge': {
        const challengeContent = content as ChallengeContent;
        const problems = challengeContent.problems || [];
        const currentProblem = problems[0];
        
        if (!currentProblem) {
          return (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No challenge problems available yet.</p>
              </CardContent>
            </Card>
          );
        }

        return (
          <div className="space-y-4">
            <Card className="border-accent/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-accent" />
                  Challenge Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground font-medium">{currentProblem.question}</p>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md bg-background"
                  />
                  <Button onClick={() => setShowResult(true)}>
                    Submit
                  </Button>
                </div>

                {!showResult && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                )}

                {showHint && !showResult && (
                  <Card className="bg-accent/5 border-accent/30">
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground">{currentProblem.hint}</p>
                    </CardContent>
                  </Card>
                )}

                {showResult && (
                  <Card className={cn(
                    "border",
                    userAnswer.toLowerCase().trim() === currentProblem.answer.toLowerCase().trim()
                      ? "border-success bg-success/5"
                      : "border-accent bg-accent/5"
                  )}>
                    <CardContent className="p-4">
                      <p className="font-medium">
                        Correct answer: <span className="text-primary">{currentProblem.answer}</span>
                      </p>
                      {userAnswer.toLowerCase().trim() === currentProblem.answer.toLowerCase().trim() && (
                        <p className="text-success mt-2">🎉 Excellent work!</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {showResult && (
              <Button onClick={markLessonComplete} className="w-full">
                Complete Challenge
                <Trophy className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to={topicId ? `/topics/${topicId}` : '/topics'}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-sm line-clamp-1">{lesson.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-xs">
                <ModeIcon className="h-3 w-3 mr-1" />
                {getModeLabel()}
              </Badge>
            </div>
          </div>
          <Link to="/ai-tutor">
            <Button variant="outline" size="icon">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 py-4">
        {renderContent()}
      </div>

      {/* Common Mistakes & Exam Tips */}
      {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
        <div className="px-4 pb-4">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <HelpCircle className="h-4 w-4" />
                Common Mistakes to Avoid
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1">
                {lesson.common_mistakes.map((mistake, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
