import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Binary
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  title: string;
  description: string;
  waec_chapter: string;
  icon: string;
  estimated_duration_minutes: number;
  order_index: number;
  progress?: number;
  lessonsCompleted?: number;
  totalLessons?: number;
}

// Mock topics aligned with WAEC syllabus
const mockTopics: Topic[] = [
  {
    id: '1',
    title: 'Number Bases',
    description: 'Convert between different number bases and perform operations',
    waec_chapter: 'Number and Numeration',
    icon: 'binary',
    estimated_duration_minutes: 45,
    order_index: 1,
    progress: 75,
    lessonsCompleted: 3,
    totalLessons: 4
  },
  {
    id: '2',
    title: 'Fractions, Decimals & Percentages',
    description: 'Operations with fractions, decimals and percentage calculations',
    waec_chapter: 'Number and Numeration',
    icon: 'percent',
    estimated_duration_minutes: 60,
    order_index: 2,
    progress: 40,
    lessonsCompleted: 2,
    totalLessons: 5
  },
  {
    id: '3',
    title: 'Algebraic Expressions',
    description: 'Simplification, expansion and factorization of algebraic expressions',
    waec_chapter: 'Algebraic Processes',
    icon: 'calculator',
    estimated_duration_minutes: 90,
    order_index: 3,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 6
  },
  {
    id: '4',
    title: 'Linear Equations',
    description: 'Solve linear equations in one and two variables',
    waec_chapter: 'Algebraic Processes',
    icon: 'book',
    estimated_duration_minutes: 60,
    order_index: 4,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 4
  },
  {
    id: '5',
    title: 'Quadratic Equations',
    description: 'Solve quadratic equations by factorization and formula',
    waec_chapter: 'Algebraic Processes',
    icon: 'calculator',
    estimated_duration_minutes: 75,
    order_index: 5,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 5
  },
  {
    id: '6',
    title: 'Geometry - Angles',
    description: 'Properties of angles, parallel lines and polygons',
    waec_chapter: 'Geometry and Mensuration',
    icon: 'triangle',
    estimated_duration_minutes: 60,
    order_index: 6,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 4
  },
  {
    id: '7',
    title: 'Geometry - Circles',
    description: 'Circle theorems and properties',
    waec_chapter: 'Geometry and Mensuration',
    icon: 'circle',
    estimated_duration_minutes: 60,
    order_index: 7,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 4
  },
  {
    id: '8',
    title: 'Mensuration',
    description: 'Area, perimeter, surface area and volume calculations',
    waec_chapter: 'Geometry and Mensuration',
    icon: 'shapes',
    estimated_duration_minutes: 90,
    order_index: 8,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 6
  },
  {
    id: '9',
    title: 'Trigonometry',
    description: 'Trigonometric ratios and applications',
    waec_chapter: 'Geometry and Mensuration',
    icon: 'triangle',
    estimated_duration_minutes: 75,
    order_index: 9,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 5
  },
  {
    id: '10',
    title: 'Statistics',
    description: 'Mean, median, mode and data representation',
    waec_chapter: 'Statistics and Probability',
    icon: 'bar-chart',
    estimated_duration_minutes: 60,
    order_index: 10,
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 4
  },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'binary': Binary,
  'percent': Percent,
  'calculator': Calculator,
  'book': BookOpen,
  'triangle': Triangle,
  'circle': Circle,
  'shapes': Shapes,
  'bar-chart': BarChart3,
};

export default function Topics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const chapters = [...new Set(topics.map(t => t.waec_chapter))];

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = !selectedChapter || topic.waec_chapter === selectedChapter;
    return matchesSearch && matchesChapter;
  });

  const totalProgress = Math.round(
    topics.reduce((acc, t) => acc + (t.progress || 0), 0) / topics.length
  );

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
        {filteredTopics.map((topic) => {
          const IconComponent = iconMap[topic.icon] || BookOpen;
          
          return (
            <Link key={topic.id} to={`/topics/${topic.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      topic.progress && topic.progress > 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {topic.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1">
                          <Progress 
                            value={topic.progress || 0} 
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
        })}
      </div>
    </div>
  );
}