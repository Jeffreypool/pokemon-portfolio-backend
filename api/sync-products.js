import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  try {

    let page = 1
    let synced = 0

    const MAX_PAGES = 90

    while (page <= MAX_PAGES) {

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

      console.log("PAGE", page, "PRODUCTS:", products.length)

      // stop als er geen producten meer zijn
      if (products.length === 0) break

      const rows = products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.prices?.cardmarket?.lowest || null,
        updated_at: new Date()
      }))

      await supabase
        .from("products")
        .upsert(rows)

      synced += rows.length
      page++

    }

    return res.json({
      synced_products: synced,
      pages_processed: page - 1
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
