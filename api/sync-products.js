import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  const response = await fetch(
    "https://pokemon-prices.p.rapidapi.com/products",
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "pokemon-prices.p.rapidapi.com"
      }
    }
  )

  const data = await response.json()

  res.status(200).json(data)
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
