import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const {
      name,
      set_name,
      condition,
      quantity,
      purchase_price,
      current_price,
      product_type
    } = req.body

    if (!name || !purchase_price || !current_price) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .insert([
        {
          name,
          set_name,
          condition,
          quantity: parseInt(quantity),
          purchase_price: parseFloat(purchase_price),
          current_price: parseFloat(current_price),
          product_type   // 🔥 HIER zat het probleem
        }
      ])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, item: data[0] })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
