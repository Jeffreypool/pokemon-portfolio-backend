import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  const { data: items, error } = await supabase
    .from('portfolio_items')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  const results = []

  for (const item of items) {

    const query = encodeURIComponent(item.name)

   const response = await fetch(
  "https://pokemon-prices.p.rapidapi.com/products?page=1&per_page=200",
  {
    headers: {
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
    }
  }
)

    const data = await response.json()

results.push({
  query: item.name,
  api_response: data
})

continue

    if (!data || !data.data || data.data.length === 0) {
      results.push({
        name: item.name,
        status: "not found"
      })
      continue
    }

    const product = data.data[0]

    if (!product.prices || !product.prices.cardmarket) {
      results.push({
        name: item.name,
        status: "no cardmarket price"
      })
      continue
    }

    const price = product.prices.cardmarket.lowest

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
