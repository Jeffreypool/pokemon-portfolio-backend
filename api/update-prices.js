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

      if (!item.name) {
        results.push({
          item: item.id,
          status: 'No name found'
        })
        continue
      }

      try {
        const response = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:"${item.name}"`,
          {
            headers: {
              'X-Api-Key': process.env.POKEMON_TCG_API_KEY
            }
          }
        )

        const data = await response.json()

        if (!data.data || data.data.length === 0) {
          results.push({
            item: item.name,
            status: 'No card found'
          })
          continue
        }

        const card = data.data[0]

        const price =
          card.tcgplayer?.prices?.holofoil?.market ||
          card.tcgplayer?.prices?.normal?.market ||
          null

        if (!price) {
          results.push({
            item: item.name,
            status: 'No price available'
          })
          continue
        }

        await supabase
          .from('portfolio_items')
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
