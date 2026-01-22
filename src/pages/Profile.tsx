import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Settings,
  LogOut,
  Turtle,
  Gauge,
  Rocket,
  BookOpen,
  Target,
  Zap,
  Trophy,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type LearningPace = 'slow' | 'average' | 'fast';
type LearningMode = 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge';

const paceOptions: { id: LearningPace; label: string; icon: typeof Turtle; description: string }[] = [
  { id: 'slow', label: 'Slow & Steady', icon: Turtle, description: 'Detailed explanations, more examples' },
  { id: 'average', label: 'Balanced', icon: Gauge, description: 'Standard pace with good coverage' },
  { id: 'fast', label: 'Quick Learner', icon: Rocket, description: 'Concise content, challenge-focused' },
];

const modeOptions: { id: LearningMode; label: string; icon: typeof BookOpen }[] = [
  { id: 'step-by-step', label: 'Step-by-Step', icon: BookOpen },
  { id: 'practice-heavy', label: 'Practice Heavy', icon: Target },
  { id: 'fast-revision', label: 'Fast Revision', icon: Zap },
  { id: 'challenge', label: 'Challenge', icon: Trophy },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [selectedPace, setSelectedPace] = useState<LearningPace>((profile?.learning_pace as LearningPace) || 'average');
  const [selectedMode, setSelectedMode] = useState<LearningMode>((profile?.preferred_mode as LearningMode) || 'step-by-step');
  const [isDark, setIsDark] = useState(false);

  const handlePaceChange = async (pace: 'slow' | 'average' | 'fast') => {
    setSelectedPace(pace);
    const { error } = await updateProfile({ learning_pace: pace });
    if (!error) {
      toast({ title: "Learning pace updated!" });
    }
  };

  const handleModeChange = async (mode: 'step-by-step' | 'practice-heavy' | 'fast-revision' | 'challenge') => {
    setSelectedMode(mode);
    const { error } = await updateProfile({ preferred_mode: mode });
    if (!error) {
      toast({ title: "Learning mode updated!" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {firstName[0]}
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{profile?.full_name || 'Student'}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {profile?.grade_level || 'SS2'} • {profile?.school_name || 'Student'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Learning Pace */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Learning Pace</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <RadioGroup value={selectedPace} onValueChange={handlePaceChange}>
                {paceOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedPace === option.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handlePaceChange(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={`pace-${option.id}`} />
                      <Icon className={cn(
                        "h-5 w-5",
                        selectedPace === option.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex-1">
                        <Label htmlFor={`pace-${option.id}`} className="cursor-pointer font-medium">
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Default Learning Mode */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Default Learning Mode</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {modeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={selectedMode === option.id ? "default" : "outline"}
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => handleModeChange(option.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>Dark Mode</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDark(!isDark)}
                >
                  {isDark ? 'On' : 'Off'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span>App Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <Separator />
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-4 text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </CardContent>
          </Card>

          {/* App Info */}
          <div className="text-center py-4">
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}