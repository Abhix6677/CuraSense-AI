import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase as supabaseTyped } from "@/integrations/supabase/client";

export type ChatMsg = {
  id: string;
  from: "me" | "ai";
  text: string;
  ts: number;
  isError?: boolean;
};

interface AIChatProps {
  patientName?: string;
  initialMessages?: ChatMsg[];
}

const Dots = () => (
  <span className="inline-flex gap-1 items-center h-5">
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
  </span>
);

const getSmartResponse = (question: string, name: string) => {
  const q = question.toLowerCase();
  
  if (['chest pain', 'cannot breathe', 'stroke', 'seizure'].some(kw => q.includes(kw))) {
    return `**🚨 EMERGENCY!** Please call emergency services (108/911) IMMEDIATELY. ${name}, do not wait.`;
  }
  if (q.includes('headache')) {
    return `**Headache Relief Tips:**\n• Drink plenty of water (dehydration is a common cause)\n• Rest in a dark, quiet room\n• Apply a cold or warm compress to your head/neck\n• Consider safe over-the-counter pain relief like Paracetamol\n\n**Warning:** If it is sudden and severe, or accompanied by vision loss or fever, consult a doctor immediately.\n\n*What do you think triggered it?*`;
  }
  if (q.includes('fever')) {
    return `**Fever Care:**\n• Stay hydrated (water, ORS)\n• Wear light, breathable clothes\n• Rest as much as possible\n• Take Paracetamol for comfort\n\n**See a Doctor if:** It lasts >3 days, goes above 103°F, or you have a stiff neck.\n\n*What is your temperature right now?*`;
  }
  if (q.includes('cough') || q.includes('cold')) {
    return `**Cough & Cold Relief:**\n• Drink warm honey lemon tea\n• Try steam inhalation\n• Gargle with warm salt water\n• Elevate your head while sleeping\n\n**See a Doctor if:** You cough up blood, or it lasts >2 weeks.\n\n*Is it a dry or wet cough?*`;
  }
  if (q.includes('diet') || q.includes('weight')) {
    return `**Daily Nutrition Guide:**\n• Fill half your plate with veggies\n• 1/4 with lean protein (dal/eggs/chicken)\n• 1/4 with whole grains (roti/brown rice)\n• Drink 3L of water daily\n\n**Tip:** Don't skip meals. Consistency is key!\n\n*What is your primary fitness goal?*`;
  }
  if (q.includes('sleep')) {
    return `**Better Sleep Habits:**\n• Stick to a fixed schedule\n• No screens 1 hour before bed\n• Keep your room cool and dark\n• Try the 4-7-8 deep breathing technique\n\n*Do you have a current bedtime routine?*`;
  }
  if (q.includes('hello') || q.includes('hi ')) {
    return `Hello ${name}! How are you feeling today? I'm here to help with any health questions you might have.`;
  }

  return `That's a great question, ${name}.\n\n**General Advice:** Always ensure you stay hydrated, maintain a balanced diet, get 30 minutes of daily exercise, and sleep 7-8 hours a night.\n\nCould you tell me a little more about your symptoms? *(Note: I am an AI assistant - always consult a real doctor for medical diagnosis.)*`;
};

export default function AIChat({ patientName = "Patient", initialMessages = [] }: AIChatProps) {
  const supabase: any = supabaseTyped;
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: "welcome",
            from: "ai",
            text:
              (patientName && patientName !== "Patient"
                ? `Hi ${patientName}! `
                : "Hi! ") +
              "I'm **CuraSense AI**, your health companion. I can help with symptoms, lifestyle tips, diet advice, and understanding your health concerns.\n\nWhat can I help you with today?",
            ts: Date.now(),
          },
        ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = {
      id: "u-" + Date.now(),
      from: "me",
      text,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const apiKey = localStorage.getItem("GEMINI_API_KEY");
      
      if (!apiKey) {
        if (text.trim().startsWith("AIzaSy")) {
          localStorage.setItem("GEMINI_API_KEY", text.trim());
          setMessages((prev) => [
            ...prev,
            { id: "a-" + Date.now(), from: "ai", text: "✅ **API Key successfully saved!**\n\nI am now fully connected to the Live AI network. How can I help you today?", ts: Date.now() },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { id: "a-" + Date.now(), from: "ai", text: "⚠️ To activate **Live AI mode** and get real answers, please paste your **Gemini API Key** here in the chat.\n\n*You can get a free API key instantly at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)*", ts: Date.now() },
          ]);
        }
        setIsLoading(false);
        return;
      }

      console.log("[AIChat] Calling Live Gemini API...");

      // Group consecutive messages of the same role to satisfy Gemini's alternating role requirement
      const rawContents = messages
        .filter(m => m.id !== 'welcome' && !m.isError)
        .map(m => ({
          role: m.from === "me" ? "user" : "model",
          text: m.text
        }));
      
      rawContents.push({ role: "user", text: text });

      const groupedContents: { role: string; parts: { text: string }[] }[] = [];
      for (const msg of rawContents) {
        if (groupedContents.length > 0 && groupedContents[groupedContents.length - 1].role === msg.role) {
          groupedContents[groupedContents.length - 1].parts[0].text += "\n\n" + msg.text;
        } else {
          groupedContents.push({ role: msg.role, parts: [{ text: msg.text }] });
        }
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are CuraSense AI, an empathetic health assistant talking to ${patientName}. Provide helpful, concise advice using markdown. Always advise consulting a real doctor for serious issues.` }]
          },
          contents: groupedContents
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 400 || response.status === 403) {
           localStorage.removeItem("GEMINI_API_KEY");
           throw new Error(`Invalid API Key or Bad Request (${response.status}). I've cleared your key. Please paste a valid Gemini API Key.\n\nDetails: ${errText}`);
        }
        throw new Error(`API error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

      setMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          from: "ai",
          text: reply,
          ts: Date.now(),
        },
      ]);
      setIsLoading(false);
    } catch (err: any) {
      console.log("[AIChat] Error in Live API, falling back or reporting...", err);
      setIsLoading(false);
      
      // If we are actively trying to use an API key and it failed, we MUST tell the user why it failed
      // instead of silently falling back to the offline mock, otherwise they'll think it's broken!
      const isNetworkError = err.name === 'TypeError' && err.message === 'Failed to fetch';
      
      if (localStorage.getItem("GEMINI_API_KEY")) {
        setMessages((prev) => [
          ...prev,
          { 
            id: "err-" + Date.now(), 
            from: "ai", 
            text: `⚠️ **Live AI Connection Failed**\n\n${isNetworkError ? "Network error. An adblocker or browser setting might be blocking the connection to Google APIs." : err.message}\n\n*If you provided an invalid key, it has been cleared. You can paste a new one.*`, 
            ts: Date.now(),
            isError: true
          },
        ]);
        // Also clear key on network error just in case it's completely blocked, so they can reset
        if (isNetworkError) localStorage.removeItem("GEMINI_API_KEY");
        return;
      }
      
      // If no API key was ever set (e.g. they somehow bypassed the check), fallback to smart offline simulation
      const responseText = getSmartResponse(text, patientName || "Patient");
      const msgId = "a-" + Date.now();
      setMessages((prev) => [
        ...prev,
        { id: msgId, from: "ai", text: "", ts: Date.now() },
      ]);

      const words = responseText.split(" ");
      let currentText = "";
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) => 
          prev.map((m) => m.id === msgId ? { ...m, text: currentText } : m)
        );
        await new Promise(r => setTimeout(r, Math.random() * 30 + 20));
      }
    }
  }, [input, isLoading, messages, patientName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.from === "me" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm " +
                (msg.from === "me"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : msg.isError
                  ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-sm"
                  : "bg-card rounded-bl-sm border")
              }
            >
              {msg.from === "ai" && !msg.isError && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot size={14} className="text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-primary">CuraSense AI</span>
                </div>
              )}
              {msg.from === "ai" && msg.isError && (
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} />
                  <span className="text-xs font-semibold">Error</span>
                </div>
              )}
              {msg.from === "me" ? (
                <div className="flex items-start gap-2">
                  <span className="flex-1">{msg.text}</span>
                  <div className="h-5 w-5 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={10} />
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-card rounded-bl-sm border">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot size={14} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary">CuraSense AI</span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2">
                <Dots />
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-card flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your health..."
          className="rounded-xl resize-none min-h-[44px] max-h-32 flex-1"
          rows={1}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          size="icon"
          disabled={isLoading || !input.trim()}
          className="rounded-xl h-11 w-11 shrink-0"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}

