import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, subject, learningPace, topic } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    // Build context-aware system prompt
    let paceInstruction = '';
    switch (learningPace) {
      case 'slow':
        paceInstruction = 'Use very simple language, short sentences, and lots of examples. Break down concepts into tiny steps. Be extra patient and encouraging. Use analogies from everyday Nigerian life.';
        break;
      case 'fast':
        paceInstruction = 'Be concise and direct. Skip basic explanations unless asked. Focus on key insights and challenge the student with harder examples.';
        break;
      default:
        paceInstruction = 'Use clear, balanced explanations with good examples. Build concepts progressively.';
    }

    const systemPrompt = `You are EduAdapt AI, a friendly and encouraging tutor helping Nigerian secondary school students prepare for WAEC examinations.

SUBJECT CONTEXT: ${subject || 'General WAEC subjects'}
${topic ? `CURRENT TOPIC: ${topic}` : ''}

LEARNING PACE ADAPTATION:
${paceInstruction}

GUIDELINES:
- Always be encouraging and supportive - never judgmental
- Use Nigerian context and examples when relevant (Naira for money, Nigerian places, local scenarios)
- For Mathematics: show step-by-step solutions with clear working
- For Sciences: explain concepts with real-world applications
- For Languages: provide grammar tips and vocabulary building
- Include WAEC exam tips and common mistakes to avoid
- If the student seems confused, try explaining differently
- Use emojis sparingly to keep things friendly 📚
- Keep responses focused and not too long
- End with a question or encouragement to continue learning

Remember: Your goal is to help students succeed in WAEC. Be their supportive study companion!`;

    console.log('Calling AI gateway for subject:', subject, 'pace:', learningPace);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response from AI gateway');
    
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI Tutor error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
