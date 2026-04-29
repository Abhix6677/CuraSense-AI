import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, patient_name, context = [] } = await req.json()

    const gemini_key = Deno.env.get("GEMINI_API_KEY");
    let answer = '';

    if (gemini_key) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gemini_key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: \`Patient: ${patient_name || 'Patient'}\nQuestion: ${question}\` }]
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 }
        })
      });
      const data = await res.json();
      answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    } else {
      // Demo fallback
      answer = 'Hi! CuraSense AI here. Gemini key not set, using demo mode. Your health question received. For full AI, set GEMINI_API_KEY secret. Always consult doctor.';
    }

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})
