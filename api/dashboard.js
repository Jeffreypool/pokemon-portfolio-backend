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

    const totalPurchase = items.reduce((sum, item) => {
      return sum + (item.purchase_price * item.quantity)
    }, 0)

    const totalCurrent = items.reduce((sum, item) => {
      return sum + (item.current_price * item.quantity)
    }, 0)

    const profit = totalCurrent - totalPurchase

    return res.status(200).json({
      items,
      summary: {
        total_items: items.length,
        total_purchase_value: totalPurchase,
        total_current_value: totalCurrent,
        profit
      }
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
