import { serve } from "https://deno.land/std@0.168.0/http/server.js"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question, patient_name, context } = await req.json()
    
    // Demo response
    let answer = `Hi ${patient_name || 'Patient'}! Thanks for your question: "${question}". `

    if (question.toLowerCase().includes('headache')) {
      answer += 'Sorry about the headache. Rest in dark room, hydrate, paracetamol if needed. See doctor if severe or persistent.'
    } else if (question.toLowerCase().includes('fever')) {
      answer += 'Fever is body fighting infection. Stay hydrated, rest, paracetamol. Doctor if >3 days or high fever.'
    } else {
      answer += 'General health advice: balanced diet, exercise, sleep well, regular checkups. Consult your doctor.'
    }

    answer += '\\n\\n*Demo mode - Gemini coming soon!* Always consult healthcare professional.'

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: corsHeaders
    })
  }
})

