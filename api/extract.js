// api/extract.js — Vercel serverless function
// Called by the frontend or GitHub Actions cron to extract prices from a PDF
// and save them to Supabase.

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // server-side: service key, not anon
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const EXTRACTION_PROMPT = `Extract cereal/oilseed prices from this Lonja PDF.
Return ONLY valid JSON, no markdown, no other text.
Use the numeric value in the COTIZACION ACTUAL column (€/Tonelada), or null if "S/O" or missing.

{
  "tbn_g1":null,"tbn_g2":null,"tbn_g3":null,"tbn_g4":null,"tbn_pienso":null,
  "tdn_g1":null,"tdn_g2":null,"tdn_g3":null,"tdn_g4":null,
  "ti_pienso":null,
  "cebada_nac":null,"cebada_imp":null,
  "trit_nac":null,"trit_imp":null,
  "avena_nac":null,"avena_imp":null,
  "maiz_nac":null,"maiz_imp":null,
  "habas_nac":null,"habas_imp":null,
  "guisan_nac":null,"guisan_imp":null,
  "girasol_alto":null,"girasol_conv":null,
  "colza":null
}`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lonja_id, date, url } = req.body

  if (!lonja_id || !date || !url) {
    return res.status(400).json({ error: 'Missing lonja_id, date or url' })
  }

  try {
    // 1. Fetch PDF via allorigins proxy (avoids CORS)
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const pdfRes = await fetch(proxy)
    if (!pdfRes.ok) throw new Error(`PDF fetch failed: ${pdfRes.status}`)
    const pdfBuffer = await pdfRes.arrayBuffer()
    const base64 = Buffer.from(pdfBuffer).toString('base64')

    // 2. Extract with Claude
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: EXTRACTION_PROMPT }
        ]
      }]
    })

    const text = msg.content.map(b => b.text || '').join('')
    const prices = JSON.parse(text.replace(/```json|```/g, '').trim())

    // 3. Save to Supabase
    const rows = Object.entries(prices)
      .filter(([, v]) => v != null)
      .map(([key, value]) => ({
        lonja_id,
        session_date: date,
        product_key: key,
        price: value
      }))

    if (rows.length) {
      const { error } = await supabase
        .from('prices')
        .upsert(rows, { onConflict: 'lonja_id,session_date,product_key' })
      if (error) throw error
    }

    return res.status(200).json({ ok: true, date, rows: rows.length })

  } catch (err) {
    console.error('extract error:', err)
    return res.status(500).json({ error: err.message })
  }
}
