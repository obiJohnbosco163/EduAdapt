import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Trash2, 
  WifiOff, 
  Wifi, 
  Cloud, 
  HardDrive,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AvailableTopic {
  id: string;
  title: string;
  lessonsCount: number;
}

export default function Downloads() {
  const { user } = useAuth();
  const {
    offlineContent,
    pendingSync,
    isOnline,
    totalSize,
    downloadTopic,
    removeOfflineContent,
    syncPendingProgress,
    clearAllOfflineContent,
  } = useOfflineStorage();

  const [isSyncing, setIsSyncing] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<AvailableTopic[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableTopics();
  }, [offlineContent]);

  const fetchAvailableTopics = async () => {
    try {
      const { data: topics } = await supabase
        .from('topics')
        .select('id, title')
        .order('order_index')
        .limit(10);

      const { data: lessons } = await supabase
        .from('lessons')
        .select('topic_id');

      const topicsWithLessonCounts = (topics || []).map(topic => ({
        id: topic.id,
        title: topic.title,
        lessonsCount: lessons?.filter(l => l.topic_id === topic.id).length || 0,
      })).filter(t => !offlineContent.some(c => c.id === t.id));

      setAvailableTopics(topicsWithLessonCounts);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncPendingProgress();
    setIsSyncing(false);
  };

  const handleDownload = async (topicId: string) => {
    setDownloading(topicId);
    await downloadTopic(topicId);
    setDownloading(null);
    fetchAvailableTopics();
  };

  // Estimate storage usage (localStorage typically has 5-10MB limit)
  const maxStorage = 5 * 1024 * 1024; // 5MB estimate
  const storagePercentage = Math.min((totalSize / maxStorage) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-display font-bold">Offline Content</h1>
          <Badge 
            variant={isOnline ? "default" : "secondary"} 
            className="gap-1"
          >
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Storage Usage */}
        <Card className="bg-muted/50 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage Used</span>
              </div>
              <span className="text-sm font-bold">{formatBytes(totalSize)}</span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {offlineContent.length} items saved for offline use
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Sync Status */}
        {pendingSync.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Progress Pending Sync</p>
                    <p className="text-xs text-muted-foreground">
                      {pendingSync.length} lesson{pendingSync.length > 1 ? 's' : ''} to sync
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSync}
                  disabled={!isOnline || isSyncing}
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-1" />
                      Sync
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Downloaded Content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Downloaded Content</h2>
            {offlineContent.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllOfflineContent}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {offlineContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Download className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Offline Content</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download topics and lessons to study without internet connection.
                </p>
              </CardContent>
            </Card>
          ) : (
            offlineContent.map((content) => (
              <Card key={content.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      "bg-primary/10 text-primary"
                    )}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{content.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {content.type === 'topic' ? 'Topic' : 'Lesson'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(content.size)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeOfflineContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Downloaded {formatDistanceToNow(new Date(content.downloadedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Available for Download */}
        {isOnline && availableTopics.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Available for Download</h2>
            {availableTopics.slice(0, 5).map((topic) => (
              <Card key={topic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{topic.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {topic.lessonsCount} lessons
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(topic.id)}
                      disabled={downloading === topic.id}
                    >
                      {downloading === topic.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Offline Tips */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">💡 Offline Study Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Download topics before going offline</p>
            <p>• Your progress is saved locally and synced when online</p>
            <p>• AI Tutor has limited offline responses</p>
            <p>• Keep storage under 5MB for best performance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
