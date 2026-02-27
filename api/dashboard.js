import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    let totalPurchase = 0
    let totalCurrent = 0

    for (const item of data) {
      const purchase = Number(item.purchase_price || 0)
      const current = Number(item.current_price || 0)
      const qty = Number(item.quantity || 1)

      totalPurchase += purchase * qty
      totalCurrent += current * qty
    }

    const profit = totalCurrent - totalPurchase

    return res.status(200).json({
      items: data,
      summary: {
        total_items: data.length,
        total_purchase_value: totalPurchase,
        total_current_value: totalCurrent,
        profit: profit
      }
    })

  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}
