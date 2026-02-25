import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    // 1️⃣ Haal alle portfolio items op
    const { data: items, error } = await supabase
      .from('portfolio_items')
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
        // 3️⃣ Fetch HTML van Cardmarket
        const response = await fetch(item.cardmarket_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        })

        const html = await response.text()

       // Zoek specifiek naar "From" prijs
const priceMatch = html.match(/From<\/dt><dd[^>]*>([\d\.,]+)\s?€/i)

if (!priceMatch) {
  results.push({
    item: item.name,
    status: 'No price found'
  })
  continue
}

const price = parseFloat(
  priceMatch[1]
    .replace(/\./g, '')   // verwijder duizendpunten
    .replace(',', '.')    // komma → punt
)

        // 5️⃣ Zet prijs correct om naar float
        const price = parseFloat(
          priceMatch[1]
            .replace(/\./g, '')   // verwijder duizendpunten
            .replace(',', '.')    // zet komma om naar punt
        )

        if (isNaN(price)) {
          results.push({
            item: item.name,
            status: 'Invalid price format'
          })
          continue
        }

        // 6️⃣ Update Supabase
        const { error: updateError } = await supabase
          .from('portfolio_items')
          .update({ current_price: price })
          .eq('id', item.id)

        if (updateError) {
          results.push({
            item: item.name,
            status: 'Database update failed'
          })
          continue
        }

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
