import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  try {

    let page = 1
    let totalPages = 1
    let synced = 0

    const MAX_PAGES = 25

    while (page <= totalPages && page <= MAX_PAGES) {

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

      const totalProducts = apiData.paging?.total || products.length
      const perPage = products.length || 20

      totalPages = Math.ceil(totalProducts / perPage)

      console.log("PAGE", page, "OF", totalPages)

      const rows = products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.prices?.cardmarket?.lowest || null,
        updated_at: new Date()
      }))

      if (rows.length) {
        await supabase
          .from("products")
          .upsert(rows)
      }

      synced += rows.length
      page++

      if (products.length === 0) break

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
