import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const RATE_LIMIT_MS = 1000
const sessionLastClick = new Map<string, number>()

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { cta_label, destination_url, page_path, session_id } = await req.json()

    if (!cta_label || !session_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const last = sessionLastClick.get(session_id) ?? 0
    if (Date.now() - last < RATE_LIMIT_MS) {
      return new Response(JSON.stringify({ ok: true, throttled: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    sessionLastClick.set(session_id, Date.now())

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('cta_clicks').insert({
      cta_label,
      destination_url: destination_url ?? null,
      page_path: page_path ?? null,
      session_id,
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
