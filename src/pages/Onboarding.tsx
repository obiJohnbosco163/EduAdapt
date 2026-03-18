import { useState, useMemo } from 'react';
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
  ArrowRight, ArrowLeft, Turtle, Gauge, Rocket,
  BookOpen, Target, Zap, Trophy, Loader2, CheckCircle2
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

// Pool of 100 questions — 10 random ones will be selected
const questionPool: DiagnosticQuestion[] = [
  // === EASY (34 questions) ===
  { id: 'e1', question: 'Simplify: 2x + 3x', options: ['5x', '6x', '5x²', '6'], correctAnswer: '5x', topic: 'Algebra', difficulty: 'easy' },
  { id: 'e2', question: 'What is 15% of 200?', options: ['15', '20', '30', '35'], correctAnswer: '30', topic: 'Percentages', difficulty: 'easy' },
  { id: 'e3', question: 'Solve: 2x + 5 = 13', options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'], correctAnswer: 'x = 4', topic: 'Linear Equations', difficulty: 'easy' },
  { id: 'e4', question: 'Area of rectangle 8cm × 5cm?', options: ['13cm²', '26cm²', '40cm²', '80cm²'], correctAnswer: '40cm²', topic: 'Mensuration', difficulty: 'easy' },
  { id: 'e5', question: 'What is 7 × 8?', options: ['54', '56', '58', '64'], correctAnswer: '56', topic: 'Arithmetic', difficulty: 'easy' },
  { id: 'e6', question: 'Convert 0.5 to a fraction', options: ['1/3', '1/2', '2/5', '5/10'], correctAnswer: '1/2', topic: 'Fractions', difficulty: 'easy' },
  { id: 'e7', question: 'What is the next prime after 7?', options: ['8', '9', '10', '11'], correctAnswer: '11', topic: 'Number Theory', difficulty: 'easy' },
  { id: 'e8', question: 'Simplify: 3² + 4²', options: ['7', '12', '25', '49'], correctAnswer: '25', topic: 'Indices', difficulty: 'easy' },
  { id: 'e9', question: '∠ in a straight line = ?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°', topic: 'Geometry', difficulty: 'easy' },
  { id: 'e10', question: 'If y = 3x, find y when x = 4', options: ['7', '9', '12', '15'], correctAnswer: '12', topic: 'Algebra', difficulty: 'easy' },
  { id: 'e11', question: 'What is 25% of 80?', options: ['15', '20', '25', '30'], correctAnswer: '20', topic: 'Percentages', difficulty: 'easy' },
  { id: 'e12', question: 'Perimeter of a square with side 6cm?', options: ['12cm', '24cm', '36cm', '48cm'], correctAnswer: '24cm', topic: 'Mensuration', difficulty: 'easy' },
  { id: 'e13', question: 'What is √144?', options: ['10', '11', '12', '14'], correctAnswer: '12', topic: 'Surds', difficulty: 'easy' },
  { id: 'e14', question: 'Round 3.456 to 2 decimal places', options: ['3.45', '3.46', '3.50', '3.4'], correctAnswer: '3.46', topic: 'Approximation', difficulty: 'easy' },
  { id: 'e15', question: 'Express 3/4 as a percentage', options: ['60%', '70%', '75%', '80%'], correctAnswer: '75%', topic: 'Percentages', difficulty: 'easy' },
  { id: 'e16', question: 'Solve: x - 7 = 12', options: ['x = 5', 'x = 17', 'x = 19', 'x = 21'], correctAnswer: 'x = 19', topic: 'Linear Equations', difficulty: 'easy' },
  { id: 'e17', question: 'What is the LCM of 4 and 6?', options: ['8', '10', '12', '24'], correctAnswer: '12', topic: 'Number Theory', difficulty: 'easy' },
  { id: 'e18', question: 'Simplify: 5a - 2a + 3a', options: ['6a', '5a', '8a', '10a'], correctAnswer: '6a', topic: 'Algebra', difficulty: 'easy' },
  { id: 'e19', question: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], correctAnswer: '6', topic: 'Geometry', difficulty: 'easy' },
  { id: 'e20', question: 'Convert 101₂ to base 10', options: ['3', '4', '5', '6'], correctAnswer: '5', topic: 'Number Bases', difficulty: 'easy' },
  { id: 'e21', question: 'What is the median of 2, 5, 7?', options: ['2', '5', '7', '4.67'], correctAnswer: '5', topic: 'Statistics', difficulty: 'easy' },
  { id: 'e22', question: 'Evaluate: 2³', options: ['4', '6', '8', '16'], correctAnswer: '8', topic: 'Indices', difficulty: 'easy' },
  { id: 'e23', question: 'Simplify: 12/16', options: ['2/3', '3/4', '4/5', '6/8'], correctAnswer: '3/4', topic: 'Fractions', difficulty: 'easy' },
  { id: 'e24', question: 'Sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°', topic: 'Geometry', difficulty: 'easy' },
  { id: 'e25', question: 'What is 0.25 × 100?', options: ['2.5', '25', '250', '0.25'], correctAnswer: '25', topic: 'Arithmetic', difficulty: 'easy' },
  { id: 'e26', question: 'If a = 5, find 2a + 1', options: ['10', '11', '12', '15'], correctAnswer: '11', topic: 'Algebra', difficulty: 'easy' },
  { id: 'e27', question: 'What type of angle is 90°?', options: ['Acute', 'Right', 'Obtuse', 'Reflex'], correctAnswer: 'Right', topic: 'Geometry', difficulty: 'easy' },
  { id: 'e28', question: 'Express 5000 in standard form', options: ['5 × 10²', '5 × 10³', '50 × 10²', '5 × 10⁴'], correctAnswer: '5 × 10³', topic: 'Indices', difficulty: 'easy' },
  { id: 'e29', question: 'What is the HCF of 12 and 18?', options: ['2', '3', '6', '12'], correctAnswer: '6', topic: 'Number Theory', difficulty: 'easy' },
  { id: 'e30', question: 'Solve: 3x = 15', options: ['x = 3', 'x = 5', 'x = 12', 'x = 45'], correctAnswer: 'x = 5', topic: 'Linear Equations', difficulty: 'easy' },
  { id: 'e31', question: 'What is the mode of 2, 3, 3, 5, 7?', options: ['2', '3', '5', '7'], correctAnswer: '3', topic: 'Statistics', difficulty: 'easy' },
  { id: 'e32', question: 'Volume of cube with side 3cm?', options: ['9cm³', '18cm³', '27cm³', '36cm³'], correctAnswer: '27cm³', topic: 'Mensuration', difficulty: 'easy' },
  { id: 'e33', question: '2/5 + 1/5 = ?', options: ['1/5', '2/5', '3/5', '3/10'], correctAnswer: '3/5', topic: 'Fractions', difficulty: 'easy' },
  { id: 'e34', question: 'What is 10² - 6²?', options: ['16', '36', '64', '4'], correctAnswer: '64', topic: 'Arithmetic', difficulty: 'easy' },
  // === MEDIUM (33 questions) ===
  { id: 'm1', question: 'Simplify: (x²)(x³)', options: ['x⁵', 'x⁶', '2x⁵', 'x⁸'], correctAnswer: 'x⁵', topic: 'Indices', difficulty: 'medium' },
  { id: 'm2', question: 'If a=2, b=3, find 3a²-2b', options: ['6', '8', '10', '12'], correctAnswer: '6', topic: 'Algebra', difficulty: 'medium' },
  { id: 'm3', question: 'Factorize: x² - 9', options: ['(x-3)(x-3)', '(x+3)(x+3)', '(x+3)(x-3)', '(x-9)(x+1)'], correctAnswer: '(x+3)(x-3)', topic: 'Factorization', difficulty: 'medium' },
  { id: 'm4', question: 'Simple interest: ₦5000, 3yrs, 8%', options: ['₦1200', '₦1400', '₦1500', '₦1600'], correctAnswer: '₦1200', topic: 'Simple Interest', difficulty: 'medium' },
  { id: 'm5', question: 'Find the gradient of y = 3x + 2', options: ['2', '3', '5', '6'], correctAnswer: '3', topic: 'Coordinate Geometry', difficulty: 'medium' },
  { id: 'm6', question: 'Solve: 2(x+3) = 14', options: ['x = 4', 'x = 5', 'x = 7', 'x = 11'], correctAnswer: 'x = 4', topic: 'Linear Equations', difficulty: 'medium' },
  { id: 'm7', question: 'Convert 1101₂ to base 10', options: ['11', '12', '13', '14'], correctAnswer: '13', topic: 'Number Bases', difficulty: 'medium' },
  { id: 'm8', question: 'Sin 30° = ?', options: ['0', '0.5', '1', '√3/2'], correctAnswer: '0.5', topic: 'Trigonometry', difficulty: 'medium' },
  { id: 'm9', question: 'Mean of 4,6,8,10,12?', options: ['6', '7', '8', '10'], correctAnswer: '8', topic: 'Statistics', difficulty: 'medium' },
  { id: 'm10', question: 'Area of circle radius 7 (π=22/7)', options: ['44cm²', '88cm²', '154cm²', '616cm²'], correctAnswer: '154cm²', topic: 'Mensuration', difficulty: 'medium' },
  { id: 'm11', question: 'Simplify: (2x³)²', options: ['2x⁶', '4x⁶', '4x⁵', '2x⁵'], correctAnswer: '4x⁶', topic: 'Indices', difficulty: 'medium' },
  { id: 'm12', question: 'Solve: x/3 + 2 = 5', options: ['x = 3', 'x = 6', 'x = 9', 'x = 15'], correctAnswer: 'x = 9', topic: 'Linear Equations', difficulty: 'medium' },
  { id: 'm13', question: 'Expand: (x+2)(x+3)', options: ['x²+5x+6', 'x²+6x+5', 'x²+5x+5', 'x²+6x+6'], correctAnswer: 'x²+5x+6', topic: 'Algebra', difficulty: 'medium' },
  { id: 'm14', question: 'P(head) in a fair coin toss?', options: ['0', '1/4', '1/2', '1'], correctAnswer: '1/2', topic: 'Probability', difficulty: 'medium' },
  { id: 'm15', question: 'Exterior angle of regular hexagon?', options: ['30°', '45°', '60°', '72°'], correctAnswer: '60°', topic: 'Geometry', difficulty: 'medium' },
  { id: 'm16', question: 'Simplify: √50', options: ['5√2', '2√5', '25', '10'], correctAnswer: '5√2', topic: 'Surds', difficulty: 'medium' },
  { id: 'm17', question: 'If f(x) = 2x+1, find f(3)', options: ['5', '6', '7', '9'], correctAnswer: '7', topic: 'Functions', difficulty: 'medium' },
  { id: 'm18', question: 'Compound interest: ₦1000, 2yrs, 10%', options: ['₦200', '₦210', '₦220', '₦1210'], correctAnswer: '₦210', topic: 'Financial Maths', difficulty: 'medium' },
  { id: 'm19', question: 'Solve: |x - 3| = 5', options: ['x=8 or x=-2', 'x=8 or x=2', 'x=2 only', 'x=8 only'], correctAnswer: 'x=8 or x=-2', topic: 'Algebra', difficulty: 'medium' },
  { id: 'm20', question: 'Distance between (1,2) and (4,6)?', options: ['3', '4', '5', '7'], correctAnswer: '5', topic: 'Coordinate Geometry', difficulty: 'medium' },
  { id: 'm21', question: 'Express 0.000045 in standard form', options: ['4.5×10⁻⁵', '45×10⁻⁶', '4.5×10⁻⁴', '0.45×10⁻⁴'], correctAnswer: '4.5×10⁻⁵', topic: 'Indices', difficulty: 'medium' },
  { id: 'm22', question: 'Surface area of cube side 4cm?', options: ['48cm²', '64cm²', '96cm²', '128cm²'], correctAnswer: '96cm²', topic: 'Mensuration', difficulty: 'medium' },
  { id: 'm23', question: 'Tan 45° = ?', options: ['0', '0.5', '1', '√2'], correctAnswer: '1', topic: 'Trigonometry', difficulty: 'medium' },
  { id: 'm24', question: 'Make r subject: A = πr²', options: ['r=A/π', 'r=√(A/π)', 'r=A²/π', 'r=π/A'], correctAnswer: 'r=√(A/π)', topic: 'Algebra', difficulty: 'medium' },
  { id: 'm25', question: 'Range of 3,7,2,9,5?', options: ['5', '6', '7', '9'], correctAnswer: '7', topic: 'Statistics', difficulty: 'medium' },
  { id: 'm26', question: 'Simplify: log₁₀100', options: ['1', '2', '10', '100'], correctAnswer: '2', topic: 'Logarithms', difficulty: 'medium' },
  { id: 'm27', question: 'Arc length: r=7, θ=90° (π=22/7)', options: ['7cm', '11cm', '14cm', '22cm'], correctAnswer: '11cm', topic: 'Circle Geometry', difficulty: 'medium' },
  { id: 'm28', question: 'Solve simultaneously: x+y=7, x-y=3', options: ['x=5,y=2', 'x=4,y=3', 'x=3,y=4', 'x=6,y=1'], correctAnswer: 'x=5,y=2', topic: 'Simultaneous Equations', difficulty: 'medium' },
  { id: 'm29', question: 'nth term of AP: 2,5,8,11...', options: ['3n-1', '3n+1', '2n+1', '3n-2'], correctAnswer: '3n-1', topic: 'Sequences', difficulty: 'medium' },
  { id: 'm30', question: 'Ratio 2:3, total 25. Larger part?', options: ['10', '12', '15', '20'], correctAnswer: '15', topic: 'Ratio', difficulty: 'medium' },
  { id: 'm31', question: 'Circumference: r=14 (π=22/7)', options: ['44cm', '66cm', '88cm', '132cm'], correctAnswer: '88cm', topic: 'Mensuration', difficulty: 'medium' },
  { id: 'm32', question: 'Evaluate: 27^(1/3)', options: ['3', '9', '27', '81'], correctAnswer: '3', topic: 'Indices', difficulty: 'medium' },
  { id: 'm33', question: 'Convert 25₁₀ to base 2', options: ['11001₂', '10011₂', '11010₂', '11100₂'], correctAnswer: '11001₂', topic: 'Number Bases', difficulty: 'medium' },
  // === HARD (33 questions) ===
  { id: 'h1', question: 'Solve: x² - 5x + 6 = 0', options: ['x=2 or 3', 'x=1 or 6', 'x=-2 or -3', 'x=2 or -3'], correctAnswer: 'x=2 or 3', topic: 'Quadratic Equations', difficulty: 'hard' },
  { id: 'h2', question: 'Right triangle: 30°, other acute?', options: ['30°', '45°', '60°', '90°'], correctAnswer: '60°', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 'h3', question: 'Differentiate: y = 3x² + 2x', options: ['6x+2', '3x+2', '6x²+2', '6x'], correctAnswer: '6x+2', topic: 'Calculus', difficulty: 'hard' },
  { id: 'h4', question: 'Solve: 2ˣ = 16', options: ['x=2', 'x=3', 'x=4', 'x=8'], correctAnswer: 'x=4', topic: 'Indices', difficulty: 'hard' },
  { id: 'h5', question: 'Variance of 2,4,6,8?', options: ['2', '4', '5', '20'], correctAnswer: '5', topic: 'Statistics', difficulty: 'hard' },
  { id: 'h6', question: 'Integrate: ∫2x dx', options: ['x²+C', '2x²+C', 'x+C', '2+C'], correctAnswer: 'x²+C', topic: 'Calculus', difficulty: 'hard' },
  { id: 'h7', question: 'sin²θ + cos²θ = ?', options: ['0', '1', '2', 'sinθ'], correctAnswer: '1', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 'h8', question: 'Solve: log₂(x) = 5', options: ['10', '25', '32', '64'], correctAnswer: '32', topic: 'Logarithms', difficulty: 'hard' },
  { id: 'h9', question: '6P3 = ?', options: ['20', '60', '120', '720'], correctAnswer: '120', topic: 'Permutation', difficulty: 'hard' },
  { id: 'h10', question: 'Sum of GP: a=2, r=3, n=4', options: ['40', '60', '80', '242'], correctAnswer: '80', topic: 'Sequences', difficulty: 'hard' },
  { id: 'h11', question: 'Matrix: |2 3; 1 4| determinant?', options: ['2', '5', '8', '11'], correctAnswer: '5', topic: 'Matrices', difficulty: 'hard' },
  { id: 'h12', question: 'Sector area: r=14, θ=90° (π=22/7)', options: ['77cm²', '154cm²', '308cm²', '616cm²'], correctAnswer: '154cm²', topic: 'Mensuration', difficulty: 'hard' },
  { id: 'h13', question: 'dy/dx of y = x³ - 6x at x=2?', options: ['0', '2', '6', '12'], correctAnswer: '6', topic: 'Calculus', difficulty: 'hard' },
  { id: 'h14', question: 'Solve: x² + 4x + 4 = 0', options: ['x=-2', 'x=2', 'x=-4', 'x=0'], correctAnswer: 'x=-2', topic: 'Quadratic Equations', difficulty: 'hard' },
  { id: 'h15', question: 'Cos 60° = ?', options: ['0', '0.5', '1', '√3/2'], correctAnswer: '0.5', topic: 'Trigonometry', difficulty: 'hard' },
  { id: 'h16', question: '5C2 = ?', options: ['5', '10', '20', '25'], correctAnswer: '10', topic: 'Combination', difficulty: 'hard' },
  { id: 'h17', question: 'Midpoint of (2,4) and (8,10)?', options: ['(4,6)', '(5,7)', '(6,8)', '(3,5)'], correctAnswer: '(5,7)', topic: 'Coordinate Geometry', difficulty: 'hard' },
  { id: 'h18', question: 'Simplify: (√3+1)(√3-1)', options: ['1', '2', '3', '4'], correctAnswer: '2', topic: 'Surds', difficulty: 'hard' },
  { id: 'h19', question: 'log₁₀(ab) = ?', options: ['log a + log b', 'log a × log b', 'log a - log b', 'log a / log b'], correctAnswer: 'log a + log b', topic: 'Logarithms', difficulty: 'hard' },
  { id: 'h20', question: 'Bearing of B from A if B is due East?', options: ['000°', '090°', '180°', '270°'], correctAnswer: '090°', topic: 'Bearings', difficulty: 'hard' },
  { id: 'h21', question: 'Volume of cylinder r=7, h=10 (π=22/7)', options: ['1540cm³', '1440cm³', '1320cm³', '1100cm³'], correctAnswer: '1540cm³', topic: 'Mensuration', difficulty: 'hard' },
  { id: 'h22', question: 'If P(A)=0.3, P(A\')=?', options: ['0.3', '0.5', '0.7', '1'], correctAnswer: '0.7', topic: 'Probability', difficulty: 'hard' },
  { id: 'h23', question: 'Equation of line gradient 2, through (1,3)', options: ['y=2x+1', 'y=2x-1', 'y=2x+3', 'y=x+2'], correctAnswer: 'y=2x+1', topic: 'Coordinate Geometry', difficulty: 'hard' },
  { id: 'h24', question: '∫(3x²+1)dx = ?', options: ['x³+x+C', '6x+C', '3x³+x+C', 'x³+C'], correctAnswer: 'x³+x+C', topic: 'Calculus', difficulty: 'hard' },
  { id: 'h25', question: 'Discriminant of x²+3x+5=0', options: ['-11', '-5', '5', '29'], correctAnswer: '-11', topic: 'Quadratic Equations', difficulty: 'hard' },
  { id: 'h26', question: 'Sum to infinity GP: a=4, r=1/2', options: ['4', '6', '8', '16'], correctAnswer: '8', topic: 'Sequences', difficulty: 'hard' },
  { id: 'h27', question: 'Binary: 1011₂ + 110₂ = ?', options: ['10001₂', '10010₂', '10011₂', '10101₂'], correctAnswer: '10001₂', topic: 'Number Bases', difficulty: 'hard' },
  { id: 'h28', question: 'Solve: 3ˣ⁺¹ = 27', options: ['x=1', 'x=2', 'x=3', 'x=9'], correctAnswer: 'x=2', topic: 'Indices', difficulty: 'hard' },
  { id: 'h29', question: 'Curved surface area cone: r=7, l=10', options: ['110cm²', '154cm²', '220cm²', '440cm²'], correctAnswer: '220cm²', topic: 'Mensuration', difficulty: 'hard' },
  { id: 'h30', question: 'Standard deviation of 1,2,3,4,5?', options: ['√2', '√3', '2', '√10'], correctAnswer: '√2', topic: 'Statistics', difficulty: 'hard' },
  { id: 'h31', question: 'Inverse of f(x) = 2x-1?', options: ['(x+1)/2', '(x-1)/2', '2x+1', '1/(2x-1)'], correctAnswer: '(x+1)/2', topic: 'Functions', difficulty: 'hard' },
  { id: 'h32', question: 'Solve: log x + log 2 = log 10', options: ['x=2', 'x=5', 'x=8', 'x=10'], correctAnswer: 'x=5', topic: 'Logarithms', difficulty: 'hard' },
  { id: 'h33', question: 'Remainder: (x³+2x-1) ÷ (x-1)', options: ['0', '1', '2', '3'], correctAnswer: '2', topic: 'Polynomials', difficulty: 'hard' },
];

function selectRandomQuestions(pool: DiagnosticQuestion[], count: number): DiagnosticQuestion[] {
  // Select balanced: ~3 easy, ~4 medium, ~3 hard
  const easy = pool.filter(q => q.difficulty === 'easy');
  const medium = pool.filter(q => q.difficulty === 'medium');
  const hard = pool.filter(q => q.difficulty === 'hard');

  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  return [
    ...shuffle(easy).slice(0, 3),
    ...shuffle(medium).slice(0, 4),
    ...shuffle(hard).slice(0, 3),
  ];
}

function autoAssignMode(accuracy: number, avgTime: number): string {
  // Auto-assign based on performance
  if (accuracy >= 0.8 && avgTime < 25) return 'challenge';
  if (accuracy >= 0.7 && avgTime < 35) return 'fast-revision';
  if (accuracy >= 0.5) return 'practice-heavy';
  return 'step-by-step';
}

const learningModes = [
  { id: 'step-by-step', title: 'Step-by-Step', description: 'Detailed explanations with worked examples', icon: BookOpen, color: 'text-primary' },
  { id: 'practice-heavy', title: 'Practice Heavy', description: 'Many questions with hints and feedback', icon: Target, color: 'text-eduadapt-teal' },
  { id: 'fast-revision', title: 'Fast Revision', description: 'Quick summaries and key formulas', icon: Zap, color: 'text-accent' },
  { id: 'challenge', title: 'Challenge Mode', description: 'Hard WAEC-style questions', icon: Trophy, color: 'text-eduadapt-purple' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('SS2');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answer: string; timeSpent: number }>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [preferredMode, setPreferredMode] = useState('');

  const diagnosticQuestions = useMemo(() => selectRandomQuestions(questionPool, 10), []);

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
      // Auto-assign learning mode based on results
      const { accuracy, avgTime } = calculateStats();
      const autoMode = autoAssignMode(accuracy, avgTime);
      setPreferredMode(autoMode);
      setStep(3);
    }
  };

  const calculateStats = () => {
    let correct = 0;
    let totalTime = 0;
    diagnosticQuestions.forEach(q => {
      const a = answers[q.id];
      if (a) {
        if (a.answer === q.correctAnswer) correct++;
        totalTime += a.timeSpent;
      }
    });
    const accuracy = correct / diagnosticQuestions.length;
    const avgTime = totalTime / diagnosticQuestions.length;
    return { accuracy, avgTime, correct };
  };

  const calculateLearningPace = (): 'slow' | 'average' | 'fast' => {
    const { accuracy, avgTime } = calculateStats();
    if (accuracy >= 0.8 && avgTime < 30) return 'fast';
    if (accuracy >= 0.5 && avgTime < 60) return 'average';
    return 'slow';
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    const learningPace = calculateLearningPace();

    try {
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

      const { error } = await updateProfile({
        school_name: schoolName || null,
        grade_level: gradeLevel,
        learning_pace: learningPace,
        preferred_mode: preferredMode as any,
        onboarding_completed: true,
        diagnostic_completed: true
      });

      if (error) throw error;
      await refreshProfile();
      
      toast({ title: "You're all set! 🎉", description: `Learning mode: ${preferredMode.replace('-', ' ')} | Pace: ${learningPace}` });
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({ title: "Something went wrong", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paceInfo = {
    slow: { icon: Turtle, label: 'Steady Learner', color: 'text-eduadapt-teal' },
    average: { icon: Gauge, label: 'Balanced Pace', color: 'text-accent' },
    fast: { icon: Rocket, label: 'Fast Learner', color: 'text-eduadapt-purple' }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
        </div>
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
                <Input id="school" placeholder="e.g. Federal Government College" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
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
              <Button onClick={() => { setStep(2); setQuestionStartTime(Date.now()); }} className="w-full">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Diagnostic */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Assessment</CardTitle>
                  <CardDescription>Question {currentQuestion + 1} of {diagnosticQuestions.length}</CardDescription>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted">{diagnosticQuestions[currentQuestion].topic}</span>
              </div>
              <Progress value={((currentQuestion + 1) / diagnosticQuestions.length) * 100} className="h-1 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium">{diagnosticQuestions[currentQuestion].question}</p>
              <RadioGroup
                value={answers[diagnosticQuestions[currentQuestion].id]?.answer || ''}
                onValueChange={handleAnswerSelect}
              >
                {diagnosticQuestions[currentQuestion].options.map((option, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                      answers[diagnosticQuestions[currentQuestion].id]?.answer === option ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    )}
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} />
                    <Label htmlFor={`option-${idx}`} className="cursor-pointer flex-1 text-base">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={() => setCurrentQuestion(prev => prev - 1)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={handleNextQuestion} disabled={!answers[diagnosticQuestions[currentQuestion].id]} className="flex-1">
                  {currentQuestion < diagnosticQuestions.length - 1 ? 'Next' : 'Finish Test'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Auto-assigned mode (can override) */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Your recommended learning style</CardTitle>
              <CardDescription>Based on your assessment results (you can change this)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningModes.map(mode => {
                const Icon = mode.icon;
                const isRecommended = mode.id === autoAssignMode(calculateStats().accuracy, calculateStats().avgTime);
                return (
                  <div
                    key={mode.id}
                    onClick={() => setPreferredMode(mode.id)}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all relative",
                      preferredMode === mode.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-3 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                    <div className={cn("p-2 rounded-lg bg-muted", mode.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{mode.title}</h3>
                      <p className="text-sm text-muted-foreground">{mode.description}</p>
                    </div>
                    {preferredMode === mode.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                );
              })}
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => { setStep(2); setCurrentQuestion(diagnosticQuestions.length - 1); }}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1" disabled={!preferredMode}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Summary */}
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

              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Assigned Learning Style</p>
                <p className="font-semibold capitalize">{preferredMode.replace(/-/g, ' ')}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Assessment Score</p>
                <p className="font-semibold">{calculateStats().correct}/{diagnosticQuestions.length} correct</p>
              </div>

              <div className="p-4 rounded-xl border border-accent/30 bg-accent/5">
                <h4 className="font-semibold text-accent mb-2">What happens next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lessons adjusted to your pace & style</li>
                  <li>• Topics start from your current level</li>
                  <li>• You can change settings anytime</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button onClick={handleComplete} disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Learning 🚀'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
