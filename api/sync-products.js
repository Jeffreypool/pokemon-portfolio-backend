import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  try {

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

    return res.status(200).json(data)

  } catch (err) {

    return res.status(500).json({
      error: err.message
    })

  }

}
