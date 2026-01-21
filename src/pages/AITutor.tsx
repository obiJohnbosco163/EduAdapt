import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Sparkles, 
  User,
  Lightbulb,
  BookOpen,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: Calculator, text: "How do I solve quadratic equations?" },
  { icon: BookOpen, text: "Explain indices and powers" },
  { icon: Lightbulb, text: "Tips for WAEC Mathematics" },
];

// Pre-loaded AI responses for offline capability
const offlineResponses: Record<string, string> = {
  "quadratic": `To solve quadratic equations of the form ax² + bx + c = 0:

**Method 1: Factorization**
1. Look for two numbers that multiply to give 'ac' and add to give 'b'
2. Rewrite the middle term using these numbers
3. Factor by grouping

**Method 2: Quadratic Formula**
x = (-b ± √(b² - 4ac)) / 2a

**Example:** x² - 5x + 6 = 0
- Factors of 6 that add to -5: -2 and -3
- (x - 2)(x - 3) = 0
- x = 2 or x = 3

Would you like me to work through more examples?`,
  
  "indices": `**Indices (Powers) - Key Rules:**

1. **Multiplication:** aᵐ × aⁿ = aᵐ⁺ⁿ
2. **Division:** aᵐ ÷ aⁿ = aᵐ⁻ⁿ
3. **Power of a power:** (aᵐ)ⁿ = aᵐⁿ
4. **Zero power:** a⁰ = 1
5. **Negative power:** a⁻ⁿ = 1/aⁿ
6. **Fractional power:** a^(1/n) = ⁿ√a

**Example:** Simplify 2³ × 2⁴
= 2³⁺⁴ = 2⁷ = 128

Need practice questions?`,

  "tips": `**WAEC Mathematics Success Tips:**

📚 **Before the Exam:**
- Practice past questions (at least 5 years)
- Master your formulas
- Understand concepts, don't just memorize

✍️ **During the Exam:**
- Read each question carefully
- Start with questions you know
- Show all your working clearly
- Check units in your answers
- Manage your time (allocate minutes per question)

💡 **Common Mistakes to Avoid:**
- Rushing through calculations
- Forgetting negative signs
- Not simplifying final answers
- Leaving questions blank (attempt all!)

You've got this! 💪`,

  "default": `I understand you're asking about Mathematics. While I have limited offline capabilities, I can help with:

• Number and Numeration
• Algebraic Expressions
• Geometry and Mensuration
• Statistics and Probability
• Trigonometry

Please ask a specific question, and I'll do my best to explain step by step! 📚`
};

export default function AITutor() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '0',
        type: 'ai',
        content: `Hello${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! 👋 I'm your AI Mathematics tutor. I'm here to help you understand any topic, solve problems, and prepare for WAEC. What would you like to learn today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [profile]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('quadratic')) {
      return offlineResponses.quadratic;
    }
    if (lowerMessage.includes('indices') || lowerMessage.includes('power') || lowerMessage.includes('exponent')) {
      return offlineResponses.indices;
    }
    if (lowerMessage.includes('tips') || lowerMessage.includes('waec') || lowerMessage.includes('exam')) {
      return offlineResponses.tips;
    }
    
    return offlineResponses.default;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Save to database if user is logged in
    if (user) {
      await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        message_type: 'user',
        message_content: inputValue
      });
    }

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = getAIResponse(inputValue);
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    // Save AI response
    if (user) {
      await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        message_type: 'ai',
        message_content: aiResponse
      });
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="h-screen flex flex-col bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold">AI Tutor</h1>
            <p className="text-xs text-muted-foreground">
              {profile?.learning_pace === 'slow' && 'Patient explanations'}
              {profile?.learning_pace === 'average' && 'Balanced learning'}
              {profile?.learning_pace === 'fast' && 'Quick explanations'}
              {!profile?.learning_pace && 'Ask me anything!'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === 'user' && "justify-end"
              )}
            >
              {message.type === 'ai' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              </div>
              {message.type === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="space-y-2 pt-4">
              <p className="text-xs text-muted-foreground text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSuggestedQuestion(q.text)}
                  >
                    <q.icon className="h-3 w-3 mr-1" />
                    {q.text}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="sticky bottom-20 bg-background border-t px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}