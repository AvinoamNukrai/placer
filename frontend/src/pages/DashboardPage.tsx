import { useState } from 'react'
import { FiltersPanel } from '../ui/FiltersPanel'
import { SummaryStrip } from '../ui/SummaryStrip'
import { PoisTable } from '../ui/PoisTable'
import { Pagination } from '../ui/Pagination'
import { useOptions, usePois, useSummary } from '../services/api'

export function DashboardPage() {
  const [filters, setFilters] = useState({
    chain_name: '',
    dma: '',
    category: '',
    city: '',
    state: '',
    is_open: 'all' as 'all' | 'open' | 'closed',
    page: 1,
    page_size: 10,
    sort_by: 'foot_traffic' as 'name' | 'foot_traffic',
    sort_dir: 'desc' as 'asc' | 'desc',
  })

  const { data: options } = useOptions()
  const { data: pois, isLoading } = usePois(filters)
  const { data: summary } = useSummary(filters)

  return (
    <div className="container">
      <h1>Big Box POIs</h1>
      <FiltersPanel options={options} filters={filters} onChange={setFilters} />
      <SummaryStrip total_venues={summary?.total_venues ?? 0} total_foot_traffic={summary?.total_foot_traffic ?? 0} />
      <PoisTable items={pois?.items ?? []} loading={isLoading} />
      <Pagination
        page={pois?.page ?? 1}
        page_size={pois?.page_size ?? filters.page_size}
        total_count={pois?.total_count ?? 0}
        onPage={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  )
}
