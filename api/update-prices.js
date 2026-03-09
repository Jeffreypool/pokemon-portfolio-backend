import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')

  const results = []

  for (const item of items) {

    const query = encodeURIComponent(item.name)

    const response = await fetch(
      `https://pokemon-prices.p.rapidapi.com/products/search?q=${query}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
        }
      }
    )

    const data = await response.json()

    if (!data || data.length === 0) {
      results.push({
        name: item.name,
        status: "not found"
      })
      continue
    }

    const price = data[0].cardmarket?.first_english_nm

    if (!price) {
      results.push({
        name: item.name,
        status: "no price"
      })
      continue
    }

    await supabase
      .from('portfolio_items')
      .update({ current_price: price })
      .eq('id', item.id)

    results.push({
      name: item.name,
      new_price: price
    })
  }

  return res.status(200).json({
    updated: results
  })
}
