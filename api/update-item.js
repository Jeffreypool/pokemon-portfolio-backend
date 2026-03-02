import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, purchase_price, current_price, quantity, product_type } = req.body

  try {

    // 1️⃣ Update portfolio item
    const { error: updateError } = await supabase
      .from('portfolio_items')
      .update({
        purchase_price,
        current_price,
        quantity,
        product_type
      })
      .eq('id', id)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    // 2️⃣ Save price history snapshot
    const { error: historyError } = await supabase
      .from('price_history')
      .insert({
        item_id: id,
        market_value: current_price
      })

    if (historyError) {
      return res.status(500).json({ error: historyError.message })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
