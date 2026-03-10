import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: "TEST PRODUCT",
        slug: "test-product",
        price: 1
      })
      .select()

    return res.json({ data, error })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
