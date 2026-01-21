import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowRight, 
  ArrowLeft,
  Turtle, 
  Gauge, 
  Rocket,
  BookOpen,
  Target,
  Zap,
  Trophy,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosticQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: '1',
    question: 'Simplify: 2x + 3x',
    options: ['5x', '6x', '5x²', '6'],
    correctAnswer: '5x',
    topic: 'Algebra',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'What is 15% of 200?',
    options: ['15', '20', '30', '35'],
    correctAnswer: '30',
    topic: 'Percentages',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'Solve for x: 2x + 5 = 13',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correctAnswer: 'x = 4',
    topic: 'Linear Equations',
    difficulty: 'easy'
  },
  {
    id: '4',
    question: 'Find the area of a rectangle with length 8cm and width 5cm',
    options: ['13cm²', '26cm²', '40cm²', '80cm²'],
    correctAnswer: '40cm²',
    topic: 'Mensuration',
    difficulty: 'easy'
  },
  {
    id: '5',
    question: 'Simplify: (x²)(x³)',
    options: ['x⁵', 'x⁶', '2x⁵', 'x⁸'],
    correctAnswer: 'x⁵',
    topic: 'Indices',
    difficulty: 'medium'
  },
  {
    id: '6',
    question: 'If a = 2 and b = 3, find the value of 3a² - 2b',
    options: ['6', '8', '10', '12'],
    correctAnswer: '6',
    topic: 'Algebra',
    difficulty: 'medium'
  },
  {
    id: '7',
    question: 'Factorize: x² - 9',
    options: ['(x-3)(x-3)', '(x+3)(x+3)', '(x+3)(x-3)', '(x-9)(x+1)'],
    correctAnswer: '(x+3)(x-3)',
    topic: 'Factorization',
    difficulty: 'medium'
  },
  {
    id: '8',
    question: 'Find the simple interest on ₦5000 for 3 years at 8% per annum',
    options: ['₦1200', '₦1400', '₦1500', '₦1600'],
    correctAnswer: '₦1200',
    topic: 'Simple Interest',
    difficulty: 'medium'
  },
  {
    id: '9',
    question: 'Solve the quadratic equation: x² - 5x + 6 = 0',
    options: ['x = 2 or 3', 'x = 1 or 6', 'x = -2 or -3', 'x = 2 or -3'],
    correctAnswer: 'x = 2 or 3',
    topic: 'Quadratic Equations',
    difficulty: 'hard'
  },
  {
    id: '10',
    question: 'In a right triangle, if one angle is 30°, what is the other acute angle?',
    options: ['30°', '45°', '60°', '90°'],
    correctAnswer: '60°',
    topic: 'Trigonometry',
    difficulty: 'hard'
  },
];

const learningModes = [
  {
    id: 'step-by-step',
    title: 'Step-by-Step',
    description: 'Detailed explanations with worked examples',
    icon: BookOpen,
    color: 'text-primary'
  },
  {
    id: 'practice-heavy',
    title: 'Practice Heavy',
    description: 'Many questions with hints and feedback',
    icon: Target,
    color: 'text-eduadapt-teal'
  },
  {
    id: 'fast-revision',
    title: 'Fast Revision',
    description: 'Quick summaries and key formulas',
    icon: Zap,
    color: 'text-accent'
  },
  {
    id: 'challenge',
    title: 'Challenge Mode',
    description: 'Hard WAEC-style questions',
    icon: Trophy,
    color: 'text-eduadapt-purple'
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Basic info
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('SS2');
  
  // Step 2: Diagnostic test
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; timeSpent: number }>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Step 3: Learning preference
  const [preferredMode, setPreferredMode] = useState('step-by-step');

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleAnswerSelect = (answer: string) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    setAnswers(prev => ({
      ...prev,
      [diagnosticQuestions[currentQuestion].id]: { answer, timeSpent }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < diagnosticQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      setStep(3);
    }
  };

  const calculateLearningPace = (): 'slow' | 'average' | 'fast' => {
    let correctCount = 0;
    let totalTime = 0;

    diagnosticQuestions.forEach(q => {
      const answer = answers[q.id];
      if (answer) {
        if (answer.answer === q.correctAnswer) correctCount++;
        totalTime += answer.timeSpent;
      }
    });

    const accuracy = correctCount / diagnosticQuestions.length;
    const avgTimePerQuestion = totalTime / diagnosticQuestions.length;

    // Determine pace based on accuracy and speed
    if (accuracy >= 0.8 && avgTimePerQuestion < 30) return 'fast';
    if (accuracy >= 0.5 && avgTimePerQuestion < 60) return 'average';
    return 'slow';
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    const learningPace = calculateLearningPace();

    try {
      // Save diagnostic results
      const diagnosticResults = diagnosticQuestions.map(q => ({
        user_id: user.id,
        question_id: q.id,
        question_text: q.question,
        user_answer: answers[q.id]?.answer || null,
        correct_answer: q.correctAnswer,
        is_correct: answers[q.id]?.answer === q.correctAnswer,
        time_spent_seconds: answers[q.id]?.timeSpent || 0,
        topic_category: q.topic,
        difficulty_level: q.difficulty
      }));

      await supabase.from('diagnostic_results').insert(diagnosticResults);

      // Update profile
      const { error } = await updateProfile({
        school_name: schoolName || null,
        grade_level: gradeLevel,
        learning_pace: learningPace,
        preferred_mode: preferredMode as 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge',
        onboarding_completed: true,
        diagnostic_completed: true
      });

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "You're all set! 🎉",
        description: `We've customized your learning experience for ${learningPace} pace.`
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paceInfo = {
    slow: { icon: Turtle, label: 'Slow Learner', color: 'text-eduadapt-teal' },
    average: { icon: Gauge, label: 'Average Pace', color: 'text-accent' },
    fast: { icon: Rocket, label: 'Fast Learner', color: 'text-eduadapt-purple' }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2 mb-8" />

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>This helps us personalize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="school">School Name (Optional)</Label>
                <Input
                  id="school"
                  placeholder="e.g. Federal Government College"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Grade Level</Label>
                <RadioGroup value={gradeLevel} onValueChange={setGradeLevel}>
                  {['SS1', 'SS2', 'SS3'].map(grade => (
                    <div key={grade} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={grade} id={grade} />
                      <Label htmlFor={grade} className="cursor-pointer flex-1">{grade}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Diagnostic Test */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Assessment</CardTitle>
                  <CardDescription>
                    Question {currentQuestion + 1} of {diagnosticQuestions.length}
                  </CardDescription>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                  {diagnosticQuestions[currentQuestion].topic}
                </span>
              </div>
              <Progress 
                value={((currentQuestion + 1) / diagnosticQuestions.length) * 100} 
                className="h-1 mt-2" 
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium">
                {diagnosticQuestions[currentQuestion].question}
              </p>

              <RadioGroup 
                value={answers[diagnosticQuestions[currentQuestion].id]?.answer || ''}
                onValueChange={handleAnswerSelect}
              >
                {diagnosticQuestions[currentQuestion].options.map((option, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                      answers[diagnosticQuestions[currentQuestion].id]?.answer === option
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1 text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  onClick={handleNextQuestion}
                  disabled={!answers[diagnosticQuestions[currentQuestion].id]}
                  className="flex-1"
                >
                  {currentQuestion < diagnosticQuestions.length - 1 ? 'Next' : 'Finish Test'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Learning Mode Preference */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>How do you prefer to learn?</CardTitle>
              <CardDescription>Choose your default learning style (you can change per topic)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <div
                    key={mode.id}
                    onClick={() => setPreferredMode(mode.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      preferredMode === mode.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg bg-muted", mode.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                    {preferredMode === mode.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                );
              })}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Summary & Complete */}
        {step === 4 && (
          <Card className="animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-success/10">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <CardTitle>You're Ready!</CardTitle>
              <CardDescription>Here's your personalized learning profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Learning Pace Result */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const pace = calculateLearningPace();
                    const info = paceInfo[pace];
                    const Icon = info.icon;
                    return (
                      <>
                        <div className={cn("p-2 rounded-lg bg-card", info.color)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Your Learning Pace</p>
                          <p className="font-semibold">{info.label}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Selected Mode */}
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Preferred Learning Style</p>
                <p className="font-semibold capitalize">{preferredMode.replace('-', ' ')}</p>
              </div>

              {/* What's Next */}
              <div className="p-4 rounded-xl border border-accent/30 bg-accent/5">
                <h4 className="font-semibold text-accent mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lessons will be adjusted to your pace</li>
                  <li>• Topics start from your current level</li>
                  <li>• You can change settings anytime</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Start Learning</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}