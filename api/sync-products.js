import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  try {

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

return res.status(200).json(apiData)
     }
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

    }

    res.status(200).json({
      synced_products: products.length
    })

  } catch (err) {

    res.status(500).json({
      error: err.message
    })

  }

}
