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

    const results = []

    for (const item of items) {
      if (!item.cardmarket_url) {
        results.push({
          item: item.name,
          status: 'No URL'
        })
        continue
      }

      try {
        const response = await fetch(item.cardmarket_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        const html = await response.text()

        // 🔎 Zoek specifiek naar "From" prijs
        const match = html.match(
          /From<\/dt><dd[^>]*>([\d\.,]+)\s?€/
        )

        if (!match) {
          results.push({
            item: item.name,
            status: 'No price found'
          })
          continue
        }

        const price = parseFloat(
          match[1]
            .replace(/\./g, '')
            .replace(',', '.')
        )

        await supabase
          .from('portfolio_items')
          .update({ current_price: price })
          .eq('id', item.id)

        results.push({
          item: item.name,
          price
        })

      } catch (err) {
        results.push({
          item: item.name,
          status: 'Fetch failed'
        })
      }
    }

    return res.status(200).json({
      message: 'Price update finished',
      results
    })

  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}
