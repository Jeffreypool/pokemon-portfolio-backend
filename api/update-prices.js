import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // 1️⃣ Haal alle portfolio items op
    const { data: items, error: fetchError } = await supabase
      .from('portfolio_items')
      .select('*')

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message })
    }

    const results = []

    // 2️⃣ Loop door elk item
    for (const item of items) {

      console.log(`Fetching price for ${item.name}`)

      const response = await fetch(item.cardmarket_url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      })

      const html = await response.text()

      // 3️⃣ Zoek eerste euro prijs in HTML (MVP)
      const priceMatch = html.match(/€\s?(\d+[\.,]?\d*)/)

      if (!priceMatch) {
        results.push({
          item: item.name,
          status: "No price found"
        })
        continue
      }

      const price = parseFloat(priceMatch[1].replace(',', '.'))

      // 4️⃣ Sla snapshot op
      const { error: insertError } = await supabase
        .from('price_snapshots')
        .insert({
          portfolio_item_id: item.id,
          lowest_english_price: price
        })

      if (insertError) {
        results.push({
          item: item.name,
          status: "DB insert failed"
        })
      } else {
        results.push({
          item: item.name,
          status: "Updated",
          price
        })
      }

      // 5️⃣ Kleine delay (veiligheid)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    return res.status(200).json({
      message: "Price update finished",
      results
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
