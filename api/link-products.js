import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function normalize(str) {
  return str
    .toLowerCase()
    .replace("etb", "elite trainer box")
    .replace("boosterbox", "booster box")
    .replace("boosterpack", "booster pack")
    .replace(/[^a-z0-9 ]/g, "")
}

export default async function handler(req, res) {

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')

  const { data: products } = await supabase
    .from('products')
    .select('*')

  const results = []

  for (const item of items) {

    const itemName = normalize(item.name)

    const match = products.find(p =>
      normalize(p.name).includes(itemName)
    )

    if (!match) {
      results.push({
        name: item.name,
        status: "no match"
      })
      continue
    }

    await supabase
      .from('portfolio_items')
      .update({ product_id: match.id })
      .eq('id', item.id)

    results.push({
      name: item.name,
      matched_product: match.name
    })
  }

  res.json({
    linked: results
  })
}
