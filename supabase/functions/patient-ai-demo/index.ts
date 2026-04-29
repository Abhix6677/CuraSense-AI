Deno.serve((req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return Response.json({ answer: 'CuraSense AI Demo Response: Hi! Your message received. Gemini integration ready once key validated. Test successful! Always consult doctor.' }, {
    status: 200,
    headers: corsHeaders
  })
})
