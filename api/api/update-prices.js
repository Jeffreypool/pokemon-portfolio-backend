import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    const { data: items, error: fetchError } = await supabase
      .from('portfolio_items')
      .select('*')

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message })
    }

    for (const item of items) {
      const response = await fetch(item.cardmarket_url)
      const html = await response.text()

      // ZEER simpele regex om een prijs te vinden
      const priceMatch = html.match(/€\s?(\d+[\.,]\d+)/)

      if (priceMatch) {
        const price = parseFloat(priceMatch[1].replace(',', '.'))

        await supabase.from('price_snapshots').insert({
          portfolio_item_id: item.id,
          lowest_english_price: price
        })
      }

      // Kleine delay (veiligheid)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return res.status(200).json({
      message: "Prices updated"
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
