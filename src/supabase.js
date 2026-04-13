import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Fetch all prices for a lonja from Supabase ────────────────────────────────
export async function fetchPrices(lonjaId) {
  const { data, error } = await supabase
    .from('prices')
    .select('*')
    .eq('lonja_id', lonjaId)
    .order('session_date', { ascending: true })

  if (error) {
    console.error('fetchPrices error:', error)
    return {}
  }

  // Convert rows to { [date]: { product_key: value, ... } }
  const result = {}
  data.forEach(row => {
    if (!result[row.session_date]) result[row.session_date] = {}
    result[row.session_date][row.product_key] = row.price
  })
  return result
}

// ── Save extracted prices for a session ──────────────────────────────────────
export async function savePrices(lonjaId, sessionDate, pricesObj) {
  const rows = Object.entries(pricesObj)
    .filter(([, v]) => v != null)
    .map(([key, value]) => ({
      lonja_id: lonjaId,
      session_date: sessionDate,
      product_key: key,
      price: value
    }))

  if (!rows.length) return

  const { error } = await supabase
    .from('prices')
    .upsert(rows, { onConflict: 'lonja_id,session_date,product_key' })

  if (error) console.error('savePrices error:', error)
}

// ── Check which session dates already exist ───────────────────────────────────
export async function fetchExistingDates(lonjaId) {
  const { data, error } = await supabase
    .from('prices')
    .select('session_date')
    .eq('lonja_id', lonjaId)

  if (error) return new Set()
  return new Set(data.map(r => r.session_date))
}
