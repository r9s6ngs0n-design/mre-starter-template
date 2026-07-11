import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { adminLeadNotificationHtml, leadConfirmationHtml } from '../_shared/email-templates.ts'

interface LeadRecord {
  id: string
  full_name: string
  email: string
  mobile: string | null
  category: string
  enquiry_type: string
  preferred_location: string | null
  budget_range: string | null
  requirements: string | null
  assigned_to: string | null
}

async function sendResendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MR ESTATES <noreply@mrestates.com.au>',
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error('Resend error:', text)
  }
}

Deno.serve(async (req) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const lead: LeadRecord = body.record ?? body

    if (!lead?.id) {
      return new Response(JSON.stringify({ error: 'Missing lead record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminEmail = Deno.env.get('ADMIN_NOTIFY_EMAIL')
    if (adminEmail) {
      await sendResendEmail(
        adminEmail,
        `New ${lead.enquiry_type} lead — ${lead.full_name}`,
        adminLeadNotificationHtml(lead)
      )
    }

    await sendResendEmail(
      lead.email,
      'We received your enquiry — MR ESTATES',
      leadConfirmationHtml(lead.full_name)
    )

    const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await supabase.from('lead_tasks').insert({
      lead_id: lead.id,
      assigned_to: lead.assigned_to,
      title: 'Follow up new lead',
      due_at: dueAt,
    })

    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      type: 'note',
      body: `Lead received via ${lead.enquiry_type} form. Automated follow-up task created.`,
    })

    if (Deno.env.get('TWILIO_ENABLED') === 'true' && lead.assigned_to) {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
      const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER')

      if (accountSid && authToken && fromNumber) {
        const { data: agent } = await supabase
          .from('team_members')
          .select('phone')
          .eq('id', lead.assigned_to)
          .single()

        if (agent?.phone) {
          const creds = btoa(`${accountSid}:${authToken}`)
          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                Authorization: `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: agent.phone,
                From: fromNumber,
                Body: `New MR ESTATES lead: ${lead.full_name} (${lead.enquiry_type}). Check the CRM.`,
              }),
            }
          )
        }
      }
    }

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
