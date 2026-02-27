import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const { data: items, error } = await supabase
      .from('portfolio_items')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const total_items = items.length

    const total_purchase_value = items.reduce(
      (sum, item) => sum + (item.purchase_price || 0) * (item.quantity || 1),
      0
    )

    const total_current_value = items.reduce(
      (sum, item) => sum + (item.current_price || 0) * (item.quantity || 1),
      0
    )

    const profit = total_current_value - total_purchase_value

    return res.status(200).json({
      items,
      summary: {
        total_items,
        total_purchase_value,
        total_current_value,
        profit
      }
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
