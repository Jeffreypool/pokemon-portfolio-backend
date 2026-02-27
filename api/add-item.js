import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      name,
      set_name,
      condition,
      quantity,
      purchase_price,
      current_price
    } = req.body

    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([
        {
          name,
          set_name,
          condition,
          quantity,
          purchase_price,
          current_price
        }
      ])

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
