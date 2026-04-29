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

export default function AIChat({ patientName = "Patient", initialMessages = [] }: AIChatProps) {
  const supabase = supabaseTyped;
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialMessages.length > 0
      ? initialMessages
      : [{
          id: "welcome",
          from: "ai",
          text: (patientName && patientName !== "Patient" ? `Hi ${patientName}! ` : "Hi! ") +
            "I'm **CuraSense AI**, your health companion. Works offline! Ask about symptoms, diet, sleep.",
          ts: Date.now(),
        }]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isLoading]);

  const getSmartResponse = (question: string, name: string) => {
    const q = question.toLowerCase();
    
    // Emergency
    if (['chest pain', 'cannot breathe', 'stroke', 'seizure'].some(kw => q.includes(kw))) {
      return `**🚨 EMERGENCY!** Call 108/911 NOW. ${name}, do not wait.`;
    }

    if (q.includes('headache')) {
      return `**Headache help:**\\n• Drink water (dehydration common)\\n• Dark quiet room\\n• Neck massage\\n• Paracetamol (safe dose)\\n\\n**Urgent:** Sudden severe, vision loss, fever → doctor NOW.\\n\\nTriggers?`;
    }

    if (q.includes('fever')) {
      return `**Fever care:**\\n• Hydrate (water, ORS)\\n• Light clothes\\n• Paracetamol for comfort\\n• Rest\\n\\n**Doctor:** >3 days, >103°F, stiff neck.\\n\\nTemp now?`;
    }

    if (q.includes('cough') || q.includes('cold')) {
      return `**Cough relief:**\\n• Honey lemon tea\\n• Steam inhalation\\n• Salt gargle\\n• Elevate head sleep\\n\\n**Doctor:** Blood mucus, >2 weeks.\\n\\nDry/wet?`;
    }

    if (q.includes('diet') || q.includes('weight')) {
      return `**Daily nutrition:**\\n• 1/2 veggies\\n• 1/4 protein (dal/eggs)\\n• 1/4 grains (roti/rice)\\n• 3L water\\n\\n**Tips:** No skipping, rainbow veggies.\\n\\nGoal?`;
    }

    if (q.includes('sleep')) {
      return `**Sleep better:**\\n• Fixed schedule\\n• No screens 1hr before\\n• Cool dark room\\n• 4-7-8 breathing\\n\\nBedtime routine?`;
    }

    return `Hi ${name}! Good health question.\\n**Basics:** Hydrate, balanced diet, 30min walk, 7-8hr sleep.\\nTell me more! *AI assistant - consult doctor for diagnosis.*`;
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: "u-" + Date.now(),
      from: "me" as const,
      text,
      ts: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Offline-first + online try
    let reply = null;
    try {
      const { data, error } = await supabase.functions.invoke("patient-ai-assistant", {
        body: { question: text, patient_name: patientName, stream: false }
      });
      reply = String(data?.answer || "").trim();
    } catch {
      // Offline LLM
      reply = getSmartResponse(text, patientName || "you");
    }

    setMessages(prev => [...prev, {
      id: "a-" + Date.now(),
      from: "ai" as const,
      text: reply || "Sorry, try again.",
      ts: Date.now(),
    }]);
    setIsLoading(false);
  }, [input, isLoading, patientName, supabase]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-indigo-100 p-4 rounded-2xl shadow-xl">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map(msg => (
          <div key={msg.id} className={msg.from === "me" ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
              msg.from === "me" 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
                : msg.isError 
                  ? "bg-red-100 border-2 border-red-200 text-red-800 rounded-bl-sm"
                  : "bg-white/80 backdrop-blur-sm border border-white/50 rounded-bl-sm"
            }`}>
              {msg.from === "ai" && !msg.isError && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-blue-600 text-sm">CuraSense AI</span>
                </div>
              )}
              <div className="prose prose-sm max-w-none leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 rounded-bl-sm shadow-md">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-blue-600 text-sm">CuraSense AI</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Dots />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about headache, fever, diet, sleep..."
          className="flex-1 bg-white border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={1}
          disabled={isLoading}
          maxLength={1000}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all rounded-2xl"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}

