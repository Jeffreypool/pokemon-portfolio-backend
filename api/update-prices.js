import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  try {

    let page = 1
    let hasMore = true
    let updated = 0

    while (hasMore) {

      const response = await fetch(
        `https://pokemon-prices.p.rapidapi.com/products?page=${page}&per_page=200`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
          }
        }
      )

      const apiData = await response.json()
      console.log("API RAW:", apiData)
      const products = apiData.data || []
      console.log("API PRODUCTS SAMPLE:", products.slice(0,5))

      if (products.length === 0) {
        hasMore = false
        break
      }

      for (const product of products) {

        if (!product.id) continue

        const price = product.prices?.cardmarket?.lowest || null
        if (!price) continue

        await supabase
  .from('products')
  .update({ price })
  .eq('name', product.name)

        updated++
      }

      page++
    }

    // snapshots maken voor grafiek
    await supabase.rpc('insert_price_snapshots')

    return res.status(200).json({
      updated_products: updated
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
