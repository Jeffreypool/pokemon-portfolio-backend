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
    const { id, sold_price } = req.body

    if (!id || sold_price === undefined) {
      return res.status(400).json({ error: 'Missing parameters' })
    }

    const { error } = await supabase
      .from('portfolio_items')
      .update({
        sold: true,
        sold_price: sold_price,
        sold_date: new Date()
      })
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
