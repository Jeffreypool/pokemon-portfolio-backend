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
        `https://pokemon-tcg-api.p.rapidapi.com/products?page=${page}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "pokemon-tcg-api.p.rapidapi.com"
          }
        }
      )

      const apiData = await response.json()
      const products = apiData.data || []

      if (products.length === 0) {
        hasMore = false
        break
      }

      for (const product of products) {

        const price = product.prices?.cardmarket?.lowest

        if (!price) continue

        const { error } = await supabase
          .from("products")
          .update({ price })
          .eq("name", product.name)

        if (!error) {
          updated++
        }
      }

      page++

      // veiligheidsstop tegen te veel calls
      if (page > 20) {
        hasMore = false
      }

    }

    await supabase.rpc("insert_price_snapshots")

    return res.status(200).json({
      updated_products: updated
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
