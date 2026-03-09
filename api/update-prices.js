import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  // 1️⃣ portfolio items ophalen
  const { data: items, error } = await supabase
    .from('portfolio_items')
    .select('*')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // 2️⃣ ÉÉN API request doen
  const response = await fetch(
    "https://pokemon-prices.p.rapidapi.com/products?page=1&per_page=200",
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
      }
    }
  )

  const apiData = await response.json()
  const products = apiData.data || []

  const results = []

  // 3️⃣ portfolio items matchen
  for (const item of items) {

    const match = products.find(p =>
      p.name.toLowerCase().includes(item.name.toLowerCase())
    )

    if (!match) {
      results.push({
        name: item.name,
        status: "no match"
      })
      continue
    }

    const price = match.prices?.cardmarket?.lowest

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
