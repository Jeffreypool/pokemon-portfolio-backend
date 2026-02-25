import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      message: "Supabase connected 🚀",
      items: data
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
