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

      try {

        const response = await fetch(
          `https://api.pokemontcg.io/v2/cards?q=name:"${item.name}"`,
          {
            headers: {
              'X-Api-Key': process.env.POKEMON_TCG_API_KEY
            }
          }
        )

        const raw = await response.text()

        // 👇 BELANGRIJK: laat zien wat API terugstuurt
        return res.status(200).json({
          status: response.status,
          first1000chars: raw.substring(0, 1000)
        })

      } catch (err) {

        return res.status(500).json({
          error: err.message,
          stack: err.stack
        })

      }
    }

  } catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}
