type Props = {
  options?: { chain_names: string[]; dmas: number[]; categories: string[] }
  filters: any
  onChange: (next: any) => void
}

export function FiltersPanel({ options, filters, onChange }: Props) {
  const set = (patch: any) => onChange({ ...filters, page: 1, ...patch })

  return (
    <div className="card">
      <h2>Filters</h2>
      <div className="grid">
        <label>
          <span>Chain</span>
          <select value={filters.chain_name} onChange={(e) => set({ chain_name: e.target.value })}>
            <option value="">All</option>
            {options?.chain_names.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>DMA</span>
          <select value={filters.dma} onChange={(e) => set({ dma: e.target.value })}>
            <option value="">All</option>
            {options?.dmas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Category</span>
          <select value={filters.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="">All</option>
            {options?.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>City</span>
          <input value={filters.city} onChange={(e) => set({ city: e.target.value })} placeholder="All" />
        </label>
        <label>
          <span>State</span>
          <input value={filters.state} onChange={(e) => set({ state: e.target.value })} placeholder="All" />
        </label>
        <label>
          <span>Is Open</span>
          <select value={filters.is_open} onChange={(e) => set({ is_open: e.target.value })}>
            <option value="all">All</option>
            <option value="open">Open only</option>
            <option value="closed">Closed only</option>
          </select>
        </label>
      </div>
    </div>
  )
}
