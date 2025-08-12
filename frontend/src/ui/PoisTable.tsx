type Item = {
  entity_id: string
  name: string
  chain_name: string
  category: string
  dma: number
  city: string
  state: string
  visits: number
  is_open: number | boolean
}

export function PoisTable({ items, loading }: { items: Item[]; loading?: boolean }) {
  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Chain Name</th>
            <th>Category</th>
            <th>DMA</th>
            <th>City</th>
            <th>State</th>
            <th>Visits</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="empty">Loading…</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty">No results</td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={it.entity_id}>
                <td>{it.name}</td>
                <td>{it.chain_name}</td>
                <td>{it.category}</td>
                <td>{it.dma}</td>
                <td>{it.city}</td>
                <td>{it.state}</td>
                <td>{it.visits.toLocaleString()}</td>
                <td>
                  <span className={Number(it.is_open) ? 'badge open' : 'badge closed'}>
                    {Number(it.is_open) ? 'Open' : 'Closed'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
