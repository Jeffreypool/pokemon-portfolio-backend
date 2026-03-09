import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')

  if (!items || items.length === 0) {
    return res.status(200).json({ message: "No items found" })
  }

  const item = items[0]

  if (!item.cardmarket_url) {
    return res.status(200).json({
      message: "Item has no cardmarket_url",
      item
    })
  }

  const response = await fetch(item.cardmarket_url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const html = await response.text()

  return res.status(200).json({
    url: item.cardmarket_url,
    status: response.status,
    preview: html.substring(0, 500)
  })
}
