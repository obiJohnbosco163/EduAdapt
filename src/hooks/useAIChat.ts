import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseAIChatOptions {
  subject?: string;
  topic?: string;
}

export function useAIChat({ subject, topic }: UseAIChatOptions = {}) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Listen for online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const getOfflineResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Offline responses for common topics
    const offlineResponses: Record<string, string> = {
      'quadratic': `**Solving Quadratic Equations** 📐

A quadratic equation has the form: ax² + bx + c = 0

**Methods to solve:**
1. **Factorization** - Find two numbers that multiply to give 'ac' and add to give 'b'
2. **Quadratic Formula** - x = (-b ± √(b² - 4ac)) / 2a
3. **Completing the Square** - Rewrite as (x + p)² = q

**Example:** x² - 5x + 6 = 0
Factors: (x - 2)(x - 3) = 0
Solutions: x = 2 or x = 3

*I'm currently offline, but when you're back online, I can provide more detailed explanations!*`,

      'tenses': `**English Tenses Overview** 📝

**Present Tenses:**
- Simple Present: I study (habitual actions)
- Present Continuous: I am studying (ongoing now)
- Present Perfect: I have studied (completed recently)

**Past Tenses:**
- Simple Past: I studied (completed in past)
- Past Continuous: I was studying (ongoing in past)
- Past Perfect: I had studied (before another past action)

**Future Tenses:**
- Simple Future: I will study
- Future Continuous: I will be studying

*Connect to the internet for personalized help with specific examples!*`,

      'cell': `**Cell Structure Basics** 🔬

**Plant vs Animal Cells:**
- Both have: nucleus, cytoplasm, cell membrane, mitochondria, ribosomes
- Only plant cells: cell wall, chloroplasts, large vacuole

**Key Organelles:**
- **Nucleus** - Contains DNA, controls cell activities
- **Mitochondria** - Powerhouse, produces ATP
- **Ribosome** - Makes proteins
- **Chloroplast** - Photosynthesis (plants only)

*When you're online, ask me for diagrams and detailed explanations!*`,

      'default': `I'm currently in offline mode with limited capabilities. 📴

I can help with basic questions about:
• Mathematics (algebra, geometry, arithmetic)
• English (grammar, tenses, comprehension)
• Sciences (biology, chemistry, physics basics)

For detailed explanations and personalized tutoring, please connect to the internet.

What topic would you like to explore?`
    };

    // Match keywords
    if (lowerMessage.includes('quadratic') || lowerMessage.includes('equation')) {
      return offlineResponses.quadratic;
    }
    if (lowerMessage.includes('tense') || lowerMessage.includes('grammar')) {
      return offlineResponses.tenses;
    }
    if (lowerMessage.includes('cell') || lowerMessage.includes('biology')) {
      return offlineResponses.cell;
    }
    
    return offlineResponses.default;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message to database
    if (user) {
      try {
        await supabase.from('ai_chat_history').insert({
          user_id: user.id,
          message_type: 'user',
          message_content: content.trim(),
        });
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    }

    // Handle offline mode
    if (!isOnline) {
      const offlineResponse = getOfflineResponse(content);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: offlineResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      return;
    }

    // Prepare messages for API
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch(
        `https://ewiaobscdfwvjwnhjzmd.supabase.co/functions/v1/ai-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aWFvYnNjZGZ3dmp3bmhqem1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODg1ODEsImV4cCI6MjA4NDU2NDU4MX0.oAXEmChNFjWBGN5klKsimRrHM6uFAw-fGTk0BtVr5jI`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            subject: subject || 'General',
            topic,
            learningPace: profile?.learning_pace || 'average',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId = (Date.now() + 1).toString();

      // Create initial assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      }

      // Save assistant message to database
      if (user && assistantContent) {
        try {
          await supabase.from('ai_chat_history').insert({
            user_id: user.id,
            message_type: 'ai',
            message_content: assistantContent,
          });
        } catch (error) {
          console.error('Failed to save AI response:', error);
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      toast.error('Failed to get response. Trying offline mode...');
      
      // Fallback to offline response
      const offlineResponse = getOfflineResponse(content);
      setMessages(prev => {
        // Remove empty assistant message if it exists
        const filtered = prev.filter(m => m.content !== '');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: offlineResponse,
          timestamp: new Date(),
        }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, user, profile, subject, topic, isOnline, getOfflineResponse]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isOnline,
    sendMessage,
    clearMessages,
  };
}
