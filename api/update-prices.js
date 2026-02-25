import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const { data: items } = await supabase
      .from('portfolio_items')
      .select('*')

    const item = items[0]

    const response = await fetch(item.cardmarket_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const html = await response.text()

    return res.status(200).json({
      status: response.status,
      first500chars: html.slice(0, 500)
    })

  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}
