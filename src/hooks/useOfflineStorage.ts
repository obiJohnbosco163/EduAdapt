import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const OFFLINE_STORAGE_KEY = 'eduadapt_offline_content';
const OFFLINE_PROGRESS_KEY = 'eduadapt_offline_progress';

interface OfflineContent {
  id: string;
  type: 'topic' | 'lesson';
  title: string;
  data: any;
  downloadedAt: string;
  size: number;
}

interface OfflineProgress {
  lessonId: string;
  topicId: string;
  status: string;
  completedAt?: string;
  syncedAt?: string;
}

export function useOfflineStorage() {
  const { user } = useAuth();
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [pendingSync, setPendingSync] = useState<OfflineProgress[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalSize, setTotalSize] = useState(0);

  // Load offline content on mount
  useEffect(() => {
    loadOfflineContent();
    loadPendingSync();
    
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingProgress();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadOfflineContent = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const content = JSON.parse(stored) as OfflineContent[];
        setOfflineContent(content);
        setTotalSize(content.reduce((acc, item) => acc + item.size, 0));
      }
    } catch (error) {
      console.error('Error loading offline content:', error);
    }
  }, []);

  const loadPendingSync = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_PROGRESS_KEY);
      if (stored) {
        setPendingSync(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending sync:', error);
    }
  }, []);

  const saveOfflineContent = useCallback((content: OfflineContent[]) => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(content));
      setOfflineContent(content);
      setTotalSize(content.reduce((acc, item) => acc + item.size, 0));
    } catch (error) {
      console.error('Error saving offline content:', error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        toast.error('Storage full! Delete some offline content to download more.');
      }
    }
  }, []);

  const downloadTopic = useCallback(async (topicId: string) => {
    try {
      // Fetch topic with lessons
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;

      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', topicId)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      const contentData = { topic, lessons };
      const contentString = JSON.stringify(contentData);
      const size = new Blob([contentString]).size;

      const newContent: OfflineContent = {
        id: topicId,
        type: 'topic',
        title: topic.title,
        data: contentData,
        downloadedAt: new Date().toISOString(),
        size,
      };

      // Update or add content
      const existing = offlineContent.filter(c => c.id !== topicId);
      saveOfflineContent([...existing, newContent]);

      // Save to database if logged in
      if (user) {
        await supabase.from('downloaded_content').upsert({
          user_id: user.id,
          topic_id: topicId,
          content_type: 'topic',
          content_data: contentData,
          file_size_bytes: size,
        }, { onConflict: 'user_id,topic_id' });
      }

      toast.success(`Downloaded "${topic.title}" for offline use`);
      return true;
    } catch (error) {
      console.error('Error downloading topic:', error);
      toast.error('Failed to download content');
      return false;
    }
  }, [offlineContent, user, saveOfflineContent]);

  const downloadLesson = useCallback(async (lessonId: string) => {
    try {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*, topics(*)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      const contentString = JSON.stringify(lesson);
      const size = new Blob([contentString]).size;

      const newContent: OfflineContent = {
        id: lessonId,
        type: 'lesson',
        title: lesson.title,
        data: lesson,
        downloadedAt: new Date().toISOString(),
        size,
      };

      const existing = offlineContent.filter(c => c.id !== lessonId);
      saveOfflineContent([...existing, newContent]);

      if (user) {
        await supabase.from('downloaded_content').upsert({
          user_id: user.id,
          lesson_id: lessonId,
          topic_id: lesson.topic_id,
          content_type: 'lesson',
          content_data: lesson,
          file_size_bytes: size,
        }, { onConflict: 'user_id,lesson_id' });
      }

      toast.success(`Downloaded "${lesson.title}" for offline use`);
      return true;
    } catch (error) {
      console.error('Error downloading lesson:', error);
      toast.error('Failed to download content');
      return false;
    }
  }, [offlineContent, user, saveOfflineContent]);

  const removeOfflineContent = useCallback((id: string) => {
    const updated = offlineContent.filter(c => c.id !== id);
    saveOfflineContent(updated);
    toast.success('Content removed from offline storage');
  }, [offlineContent, saveOfflineContent]);

  const getOfflineContent = useCallback((id: string) => {
    return offlineContent.find(c => c.id === id);
  }, [offlineContent]);

  const saveProgressOffline = useCallback((progress: OfflineProgress) => {
    const existing = pendingSync.filter(p => p.lessonId !== progress.lessonId);
    const updated = [...existing, progress];
    localStorage.setItem(OFFLINE_PROGRESS_KEY, JSON.stringify(updated));
    setPendingSync(updated);
  }, [pendingSync]);

  const syncPendingProgress = useCallback(async () => {
    if (!user || pendingSync.length === 0) return;

    try {
      for (const progress of pendingSync) {
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          lesson_id: progress.lessonId,
          topic_id: progress.topicId,
          status: progress.status,
          completed_at: progress.completedAt,
        }, { onConflict: 'user_id,lesson_id' });
      }

      localStorage.removeItem(OFFLINE_PROGRESS_KEY);
      setPendingSync([]);
      toast.success('Progress synced successfully!');
    } catch (error) {
      console.error('Error syncing progress:', error);
    }
  }, [user, pendingSync]);

  const clearAllOfflineContent = useCallback(() => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
    setOfflineContent([]);
    setTotalSize(0);
    toast.success('All offline content cleared');
  }, []);

  return {
    offlineContent,
    pendingSync,
    isOnline,
    totalSize,
    downloadTopic,
    downloadLesson,
    removeOfflineContent,
    getOfflineContent,
    saveProgressOffline,
    syncPendingProgress,
    clearAllOfflineContent,
  };
}
