import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  ChevronRight, 
  BookOpen, 
  Calculator, 
  Shapes, 
  BarChart3,
  Percent,
  Triangle,
  Circle,
  Binary,
  Ruler,
  CircleDot,
  Sigma,
  Dice5,
  Equal,
  Superscript,
  Variable,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

interface TopicWithProgress extends Tables<'topics'> {
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Calculator': Calculator,
  'Percent': Percent,
  'Superscript': Superscript,
  'Variable': Variable,
  'Equal': Equal,
  'Parabola': Calculator,
  'CircleDot': CircleDot,
  'Ruler': Ruler,
  'Triangle': Triangle,
  'Sigma': Sigma,
  'BarChart3': BarChart3,
  'Dice5': Dice5,
  'Binary': Binary,
  'Circle': Circle,
  'Shapes': Shapes,
  'book': BookOpen,
};

export default function Topics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<TopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics();
  }, [user]);

  const fetchTopics = async () => {
    try {
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('order_index');

      if (topicsError) throw topicsError;

      // Fetch lesson counts per topic
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('topic_id');

      // Fetch user progress if logged in
      let progressData: Tables<'user_progress'>[] = [];
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        progressData = data || [];
      }

      // Combine data
      const topicsWithProgress: TopicWithProgress[] = (topicsData || []).map(topic => {
        const topicLessons = lessonsData?.filter(l => l.topic_id === topic.id) || [];
        const completedLessons = progressData.filter(
          p => p.topic_id === topic.id && p.status === 'completed'
        ).length;
        const totalLessons = topicLessons.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          ...topic,
          progress,
          lessonsCompleted: completedLessons,
          totalLessons,
        };
      });

      setTopics(topicsWithProgress);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chapters = [...new Set(topics.map(t => t.waec_chapter).filter(Boolean))] as string[];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = !selectedChapter || topic.waec_chapter === selectedChapter;
    return matchesSearch && matchesChapter;
  });

  const totalProgress = topics.length > 0 
    ? Math.round(topics.reduce((acc, t) => acc + (t.progress || 0), 0) / topics.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-28 w-full" />
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
        <h1 className="text-xl font-display font-bold mb-4">WAEC Mathematics Topics</h1>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Chapter Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <Badge
            variant={selectedChapter === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedChapter(null)}
          >
            All Topics
          </Badge>
          {chapters.map(chapter => (
            <Badge
              key={chapter}
              variant={selectedChapter === chapter ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedChapter(chapter)}
            >
              {chapter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="px-4 py-4">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Topics List */}
      <div className="px-4 space-y-3">
        {filteredTopics.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No topics found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTopics.map((topic) => {
            const IconComponent = iconMap[topic.icon || 'book'] || BookOpen;
            
            return (
              <Link key={topic.id} to={`/topics/${topic.id}`}>
                <Card className={cn(
                  "hover:shadow-md transition-all hover:border-primary/30",
                  topic.is_premium && "border-accent/30"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                        topic.progress > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{topic.title}</h3>
                              {topic.is_premium && (
                                <Lock className="h-3.5 w-3.5 text-accent" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {topic.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1">
                            <Progress 
                              value={topic.progress} 
                              className="h-1.5" 
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {topic.lessonsCompleted}/{topic.totalLessons} lessons
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {topic.waec_chapter}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ~{topic.estimated_duration_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}