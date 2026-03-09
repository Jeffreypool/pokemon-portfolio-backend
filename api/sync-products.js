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

    while (page <= totalPages) {

      const response = await fetch(
        `https://pokemon-tcg-api.p.rapidapi.com/products?page=${page}&sort=relevance`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
            "X-RapidAPI-Host": "pokemon-tcg-api.p.rapidapi.com"
          }
        }
      )

      const apiData = await response.json()

      const products = apiData.data || []
      totalPages = apiData.paging?.total || 1

      for (const product of products) {

        const price = product.prices?.cardmarket?.lowest || null

        await supabase
          .from('products')
          .upsert({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: price,
            updated_at: new Date()
          })

        synced++
      }

      page++
    }

    return res.json({
      synced_products: synced,
      pages_processed: totalPages
    })

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
