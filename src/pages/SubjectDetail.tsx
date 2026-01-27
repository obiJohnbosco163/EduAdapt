import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Calculator,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  title: string;
  description: string;
  waec_chapter: string;
  icon: string;
  order_index: number;
  estimated_duration_minutes: number;
  is_premium: boolean;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subjectId) {
      fetchSubjectAndTopics();
    }
  }, [subjectId, user]);

  const fetchSubjectAndTopics = async () => {
    try {
      // Fetch subject
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);

      // Fetch topics for this subject
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index');

      if (topicsError) throw topicsError;

      // Fetch lesson counts per topic
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('topic_id');

      // Fetch user progress
      let progressData: any[] = [];
      if (user) {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id);
        progressData = data || [];
      }

      // Calculate progress per topic
      const topicsWithProgress: Topic[] = (topicsData || []).map(topic => {
        const topicLessons = lessonsData?.filter(l => l.topic_id === topic.id) || [];
        const completedLessons = progressData.filter(
          p => p.topic_id === topic.id && p.status === 'completed'
        ).length;
        const totalLessons = topicLessons.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: topic.id,
          title: topic.title,
          description: topic.description || '',
          waec_chapter: topic.waec_chapter || '',
          icon: topic.icon || 'book',
          order_index: topic.order_index,
          estimated_duration_minutes: topic.estimated_duration_minutes || 30,
          is_premium: topic.is_premium || false,
          progress,
          lessonsCompleted: completedLessons,
          totalLessons,
        };
      });

      setTopics(topicsWithProgress);
    } catch (error) {
      console.error('Error fetching subject details:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProgress = topics.length > 0
    ? Math.round(topics.reduce((acc, t) => acc + t.progress, 0) / topics.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Subject not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/subjects">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold">{subject.name}</h1>
            <p className="text-sm text-muted-foreground">{topics.length} topics</p>
          </div>
        </div>

        {/* Overall Progress */}
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
      <div className="px-4 py-4 space-y-3">
        {topics.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Topics coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">
                We're adding content for {subject.name}. Check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          topics.map((topic) => (
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
                      <Calculator className="h-6 w-6" />
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
                          <Progress value={topic.progress} className="h-1.5" />
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
          ))
        )}
      </div>
    </div>
  );
}
