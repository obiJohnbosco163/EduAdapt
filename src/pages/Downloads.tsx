import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Trash2, 
  HardDrive,
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DownloadedContent {
  id: string;
  topicId: string;
  topicTitle: string;
  lessonsCount: number;
  sizeBytes: number;
  downloadedAt: Date;
}

// Mock data
const mockDownloads: DownloadedContent[] = [
  {
    id: '1',
    topicId: '1',
    topicTitle: 'Number Bases',
    lessonsCount: 4,
    sizeBytes: 2500000,
    downloadedAt: new Date(Date.now() - 86400000)
  },
  {
    id: '2',
    topicId: '2',
    topicTitle: 'Fractions & Percentages',
    lessonsCount: 5,
    sizeBytes: 3200000,
    downloadedAt: new Date(Date.now() - 172800000)
  }
];

const availableTopics = [
  { id: '3', title: 'Algebraic Expressions', lessons: 6, size: 4100000 },
  { id: '4', title: 'Linear Equations', lessons: 4, size: 2800000 },
  { id: '5', title: 'Quadratic Equations', lessons: 5, size: 3500000 },
];

export default function Downloads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloads, setDownloads] = useState<DownloadedContent[]>(mockDownloads);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const totalSize = downloads.reduce((acc, d) => acc + d.sizeBytes, 0);

  const handleDownload = async (topicId: string, topicTitle: string, lessons: number, size: number) => {
    setDownloading(topicId);
    
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newDownload: DownloadedContent = {
      id: Date.now().toString(),
      topicId,
      topicTitle,
      lessonsCount: lessons,
      sizeBytes: size,
      downloadedAt: new Date()
    };

    setDownloads(prev => [...prev, newDownload]);
    setDownloading(null);

    toast({
      title: "Downloaded successfully!",
      description: `${topicTitle} is now available offline.`
    });
  };

  const handleDelete = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    toast({
      title: "Removed from downloads",
      description: "The content has been deleted."
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold">Offline Downloads</h1>
          <Badge variant={isOnline ? "default" : "secondary"} className="gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Storage Info */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Storage Used</p>
                <p className="text-sm text-muted-foreground">
                  {formatSize(totalSize)} • {downloads.length} topics
                </p>
              </div>
            </div>
            <Progress value={Math.min((totalSize / 50000000) * 100, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatSize(50000000 - totalSize)} remaining
            </p>
          </CardContent>
        </Card>

        {/* Downloaded Content */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Downloaded Topics
          </h2>
          
          {downloads.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Download className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No downloads yet</p>
                <p className="text-sm">Download topics to learn offline</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {downloads.map(download => (
                <Card key={download.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{download.topicTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {download.lessonsCount} lessons • {formatSize(download.sizeBytes)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(download.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available for Download */}
        {isOnline && (
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Available for Download
            </h2>
            
            <div className="space-y-2">
              {availableTopics
                .filter(t => !downloads.some(d => d.topicId === t.id))
                .map(topic => (
                  <Card key={topic.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {topic.lessons} lessons • {formatSize(topic.size)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={downloading === topic.id}
                          onClick={() => handleDownload(topic.id, topic.title, topic.lessons, topic.size)}
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
          </div>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <WifiOff className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">You're Offline</p>
                  <p className="text-sm text-muted-foreground">
                    Your downloaded content is available. Connect to the internet to download more topics or sync your progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}