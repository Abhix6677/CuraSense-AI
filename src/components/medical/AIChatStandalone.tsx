import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

export default function AIChatStandalone({ patientName = "Patient", initialMessages = [] }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages.length > 0 ? initialMessages : [{
    id: "welcome",
    from: "ai",
    text: (patientName !== "Patient" ? `Hi ${patientName}! ` : "Hi! ") + "I'm **CuraSense AI**. Ask me health questions!",
    ts: Date.now(),
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollHeight;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMsg = { id: `u-${Date.now()}`, from: "me" as const, text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Direct LLM call - Groq Llama3.1 (free, fast)
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer gsk_no_key_required_demo", // Replace with your Groq key from console.groq.com/keys
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are CuraSense AI, empathetic health assistant. Give general advice only. Always recommend doctor. Use markdown." },
            { role: "user", content: text }
          ],
          model: "llama3.1-8b-instant",
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`Groq error: ${res.status}`);

      const data = await res.json();
      const reply = data.choices[0]?.message?.content || "Sorry, no response.";

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, from: "ai" as const, text: reply, ts: Date.now() }]);
    } catch (err: any) {
      console.error("[CuraSense AI]", err);
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        from: "ai" as const,
        text: `**Demo Mode**\\nGroq key needed for full AI. Get free key: console.groq.com/keys\\n\\nDemo response: Stay hydrated, eat well, consult doctor for personal advice.`,
        ts: Date.now(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, patientName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          CuraSense AI Assistant
        </h1>
        <p className="text-muted-foreground">Direct LLM - No Supabase needed</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-6 bg-white/50 rounded-2xl border backdrop-blur-sm">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.from === "me" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg ${
              msg.from === "me" ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm" 
              : msg.isError ? "bg-red-100 border-2 border-red-200 rounded-bl-sm" 
              : "bg-white border rounded-bl-sm"
            }`}>
              {msg.from === "ai" && !msg.isError && (
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-600">
                  <Bot size={16} />
                  CuraSense AI
                </div>
              )}
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl border shadow-lg rounded-bl-sm max-w-[80%]">
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-600">
                <Bot size={16} />
                CuraSense AI
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Dots />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 mt-4 bg-white rounded-2xl border shadow-lg flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about headache, fever, diet, exercise..."
          className="flex-1 resize-none rounded-xl min-h-[50px] max-h-24"
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="rounded-xl h-12 w-12">
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}
