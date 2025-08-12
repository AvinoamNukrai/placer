import { useState } from 'react'
import { SmartSearch } from '../ui/SmartSearch'
import { FiltersPanel } from '../ui/FiltersPanel'
import { SummaryStrip } from '../ui/SummaryStrip'
import { PoisTable } from '../ui/PoisTable'
import { Pagination } from '../ui/Pagination'
import { useOptions, usePois, useSummary } from '../services/api'

const DEFAULT_FILTERS = {
  chain_name: '',
  dma: '',
  category: '',
  city: '',
  state: '',
  is_open: 'all' as 'all' | 'open' | 'closed',
  page_size: 10,
  sort_by: 'foot_traffic' as 'name' | 'foot_traffic',
  sort_dir: 'desc' as 'asc' | 'desc',
}

export function DashboardPage() {
  const [pending, setPending] = useState({ ...DEFAULT_FILTERS })
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, page: 1 })

  const submit = () => setFilters({ ...pending, page: 1 })
  const reset = () => { setPending({ ...DEFAULT_FILTERS }); setFilters({ ...DEFAULT_FILTERS, page: 1 }) }

  const handleSmartSearch = (query: string) => {
    // Simple keyword-based smart search
    const lowerQuery = query.toLowerCase()
    const newFilters = { ...DEFAULT_FILTERS }

    if (lowerQuery.includes('walmart')) newFilters.chain_name = 'Walmart'
    if (lowerQuery.includes('target')) newFilters.chain_name = 'Target'
    if (lowerQuery.includes('big lots')) newFilters.chain_name = 'Big Lots'
    if (lowerQuery.includes('kmart')) newFilters.chain_name = 'Kmart'
    if (lowerQuery.includes('amazon')) newFilters.chain_name = 'Amazon 4-Star'

    if (lowerQuery.includes('open')) newFilters.is_open = 'open'
    if (lowerQuery.includes('closed')) newFilters.is_open = 'closed'

    if (lowerQuery.includes('texas') || lowerQuery.includes('tx')) newFilters.state = 'TX'
    if (lowerQuery.includes('california') || lowerQuery.includes('ca')) newFilters.state = 'CA'
    if (lowerQuery.includes('new york') || lowerQuery.includes('ny')) newFilters.state = 'NY'
    if (lowerQuery.includes('florida') || lowerQuery.includes('fl')) newFilters.state = 'FL'

    setPending(newFilters)
    setFilters({ ...newFilters, page: 1 })
  }

  const { data: options } = useOptions()
  const { data: pois, isLoading } = usePois(filters)
  const { data: summary } = useSummary(filters)

  return (
    <div className="container">
      <h1>Big Box POIs</h1>
      <SmartSearch onSearch={handleSmartSearch} loading={isLoading} />
      <FiltersPanel options={options} filters={pending} onChange={setPending} onSubmit={submit} onReset={reset} />
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
