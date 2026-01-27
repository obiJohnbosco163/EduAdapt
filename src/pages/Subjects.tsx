import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  ChevronRight,
  BookOpen,
  Calculator,
  Zap,
  FlaskConical,
  Leaf,
  TrendingUp,
  Landmark,
  BookText,
  Wheat,
  Store,
  Receipt,
  Globe,
  Sigma,
  Users,
  Monitor,
  Church,
  Moon,
  Clock,
  Languages,
  MessageCircle,
  MessageSquare,
  MessagesSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topicsCount: number;
  progress: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Calculator': Calculator,
  'BookOpen': BookOpen,
  'Zap': Zap,
  'Flask': FlaskConical,
  'Leaf': Leaf,
  'TrendingUp': TrendingUp,
  'Landmark': Landmark,
  'BookText': BookText,
  'Wheat': Wheat,
  'Store': Store,
  'Receipt': Receipt,
  'Globe': Globe,
  'Sigma': Sigma,
  'Users': Users,
  'Monitor': Monitor,
  'Church': Church,
  'Moon': Moon,
  'Clock': Clock,
  'Languages': Languages,
  'MessageCircle': MessageCircle,
  'MessageSquare': MessageSquare,
  'MessagesSquare': MessagesSquare,
  'book': BookOpen,
};

const colorMap: Record<string, string> = {
  'primary': 'bg-primary/10 text-primary',
  'blue': 'bg-blue-500/10 text-blue-500',
  'yellow': 'bg-yellow-500/10 text-yellow-500',
  'green': 'bg-green-500/10 text-green-500',
  'emerald': 'bg-emerald-500/10 text-emerald-500',
  'orange': 'bg-orange-500/10 text-orange-500',
  'purple': 'bg-purple-500/10 text-purple-500',
  'pink': 'bg-pink-500/10 text-pink-500',
  'lime': 'bg-lime-500/10 text-lime-500',
  'cyan': 'bg-cyan-500/10 text-cyan-500',
  'indigo': 'bg-indigo-500/10 text-indigo-500',
  'teal': 'bg-teal-500/10 text-teal-500',
  'rose': 'bg-rose-500/10 text-rose-500',
  'amber': 'bg-amber-500/10 text-amber-500',
  'slate': 'bg-slate-500/10 text-slate-500',
  'violet': 'bg-violet-500/10 text-violet-500',
  'sky': 'bg-sky-500/10 text-sky-500',
  'stone': 'bg-stone-500/10 text-stone-500',
  'red': 'bg-red-500/10 text-red-500',
  'fuchsia': 'bg-fuchsia-500/10 text-fuchsia-500',
};

export default function Subjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');

      if (error) throw error;

      // Fetch topic counts per subject
      const { data: topicsData } = await supabase
        .from('topics')
        .select('subject_id');

      // Fetch user progress if logged in
      let progressData: any[] = [];
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('topic_id, status')
          .eq('user_id', user.id);
        progressData = data || [];
      }

      // Get topic IDs that are completed
      const completedTopicIds = new Set(
        progressData.filter(p => p.status === 'completed').map(p => p.topic_id)
      );

      // Calculate progress per subject
      const subjectsWithProgress: Subject[] = (subjectsData || []).map(subject => {
        const subjectTopics = topicsData?.filter(t => t.subject_id === subject.id) || [];
        const topicsCount = subjectTopics.length;
        
        // This is simplified - would need to join with topics to get accurate progress
        const progress = topicsCount > 0 ? 0 : 0; // Will be calculated properly when viewing topics
        
        return {
          id: subject.id,
          name: subject.name,
          description: subject.description || '',
          icon: subject.icon || 'book',
          color: subject.color || 'primary',
          topicsCount,
          progress,
        };
      });

      setSubjects(subjectsWithProgress);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <h1 className="text-xl font-display font-bold mb-4">WAEC Subjects</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredSubjects.map((subject) => {
            const IconComponent = iconMap[subject.icon] || BookOpen;
            const colorClass = colorMap[subject.color] || colorMap.primary;
            
            return (
              <Link key={subject.id} to={`/subjects/${subject.id}`}>
                <Card className="h-full hover:shadow-md transition-all hover:border-primary/30">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                      colorClass
                    )}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {subject.topicsCount} topics
                    </p>
                    
                    <div className="mt-auto">
                      <Progress value={subject.progress} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No subjects found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
