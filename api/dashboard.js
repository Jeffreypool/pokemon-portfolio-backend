import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  const { data, error } = await supabase
    .from('portfolio_items')
    .select(`
      *,
      price_snapshots (
        price,
        snapshot_date
      )
    `)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // pak per item de nieuwste snapshot
  const items = data.map(item => {

    const latestSnapshot = item.price_snapshots
      ?.sort((a, b) => new Date(b.snapshot_date) - new Date(a.snapshot_date))[0]

    return {
      ...item,
      current_price: latestSnapshot?.price || null
    }

  })

  return res.status(200).json({
    items
  })

}
