import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')

    if (error) {
      return res.status(500).json({
        step: "supabase error",
        error: error.message
      })
    }

    return res.status(200).json({
      step: "supabase works",
      count: data.length
    })

  } catch (err) {
    return res.status(500).json({
      step: "crashed before query",
      error: err.message
    })
  }
}
