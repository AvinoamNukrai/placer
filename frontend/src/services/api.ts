import { useQuery } from '@tanstack/react-query'

const BASE = '' // proxied by Vite to http://localhost:4000

export type Filters = {
  chain_name?: string
  dma?: string | number
  category?: string
  city?: string
  state?: string
  is_open?: 'all' | 'open' | 'closed'
  page?: number
  page_size?: number
  sort_by?: 'name' | 'foot_traffic'
  sort_dir?: 'asc' | 'desc'
}

function toQuery(params: Record<string, any>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  return search.toString()
}

export function useOptions() {
  return useQuery({
    queryKey: ['options'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/options`)
      if (!res.ok) throw new Error('Failed to load options')
      return res.json() as Promise<{ chain_names: string[]; dmas: number[]; categories: string[] }>
    },
  })
}

export function usePois(filters: Filters) {
  return useQuery({
    queryKey: ['pois', filters],
    queryFn: async () => {
      const qs = toQuery(filters)
      const res = await fetch(`${BASE}/api/pois?${qs}`)
      if (!res.ok) throw new Error('Failed to load pois')
      return res.json() as Promise<{ items: any[]; page: number; page_size: number; total_count: number }>
    },
    keepPreviousData: true,
  })
}

export function useSummary(filters: Filters) {
  return useQuery({
    queryKey: ['summary', filters],
    queryFn: async () => {
      const { page, page_size, sort_by, sort_dir, ...aggFilters } = filters
      const qs = toQuery(aggFilters)
      const res = await fetch(`${BASE}/api/summary?${qs}`)
      if (!res.ok) throw new Error('Failed to load summary')
      return res.json() as Promise<{ total_venues: number; total_foot_traffic: number }>
    },
  })
}
