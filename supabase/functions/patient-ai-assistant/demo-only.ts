import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, patient_name, context = [] } = await req.json()

    // Use demo response always (no API keys needed)
    function buildDemoResponse(question: string, patientName: string, context: any[]): string {
      const q = question.toLowerCase();
      const name = patientName || 'there';
      if (q.includes('headache')) {
        return `Hi ${name}, sorry about the headache. Drink water, rest in dark room. See doctor if severe.**
      }
      // Add more demo logic...
      return `Hi ${name}, thanks for asking. Here's some health advice. Consult your doctor for personalized care.`;
    }

    const answer = buildDemoResponse(question, patient_name, context);

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders },
    )
  }
})
