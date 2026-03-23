import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, Star 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ResultData {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  topicTitle: string;
  topicId: string;
  mode: string;
  answers: { question: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }[];
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as ResultData | null;

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No results to display</p>
            <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = Math.round((result.correctAnswers / result.totalQuestions) * 100);
  const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const message = score >= 80 ? 'Excellent work! 🎉' : score >= 60 ? 'Good effort! Keep practicing.' : 'Keep studying, you\'ll get there! 💪';
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Score Card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground">
              <div className="flex justify-center gap-1 mb-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star key={i} className={cn("h-6 w-6", i < stars ? "fill-accent text-accent" : "text-primary-foreground/30")} />
                ))}
              </div>
              <h1 className="text-5xl font-display font-bold mb-1">{score}%</h1>
              <p className="text-lg font-medium opacity-90">Grade: {grade}</p>
              <p className="text-sm opacity-75 mt-2">{message}</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{result.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{result.totalQuestions - result.correctAnswers}</p>
                  <p className="text-xs text-muted-foreground">Wrong</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(result.timeSpent / 60)}m</p>
                  <p className="text-xs text-muted-foreground">Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer breakdown */}
        {result.answers && result.answers.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-lg mb-3">Answer Breakdown</h2>
            <div className="space-y-2">
              {result.answers.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={cn("border-l-4", a.isCorrect ? "border-l-success" : "border-l-destructive")}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {a.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{a.question}</p>
                          {!a.isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Your answer: <span className="text-destructive">{a.userAnswer}</span> · Correct: <span className="text-success">{a.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate(`/topics/${result.topicId}`)}>
            <RotateCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>
          <Link to="/dashboard">
            <Button className="w-full">
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
