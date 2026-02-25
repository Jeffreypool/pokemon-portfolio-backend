import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // 1️⃣ Haal alle items op uit Supabase
    const { data: items, error } = await supabase
      .from('items')
      .select('*')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const results = []

    // 2️⃣ Loop door alle items
    for (const item of items) {
      if (!item.cardmarket_url) {
        results.push({
          item: item.name,
          status: 'No Cardmarket URL'
        })
        continue
      }

      try {
        // 3️⃣ Fetch de HTML van Cardmarket
        const response = await fetch(item.cardmarket_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        const html = await response.text()

        // 4️⃣ Zoek prijs (bijv: 18.500,00 €)
        const priceMatch = html.match(
          /(\d{1,3}(?:\.\d{3})*,\d{2})\s?€/
        )

        if (!priceMatch) {
          results.push({
            item: item.name,
            status: 'No price found'
          })
          continue
        }

        // 5️⃣ Zet om naar normaal getal
        const price = parseFloat(
          priceMatch[1]
            .replace(/\./g, '')  // verwijder duizendtallen
            .replace(',', '.')   // vervang komma door punt
        )

        // 6️⃣ Update Supabase
        await supabase
          .from('items')
          .update({ current_price: price })
          .eq('id', item.id)

        results.push({
          item: item.name,
          price: price
        })

      } catch (err) {
        results.push({
          item: item.name,
          status: 'Error fetching price'
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
