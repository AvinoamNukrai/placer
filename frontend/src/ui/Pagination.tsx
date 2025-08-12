type Props = {
  page: number
  page_size: number
  total_count: number
  onPage: (p: number) => void
}

function windowedPages(current: number, total: number, radius = 1) {
  const pages: (number | '…')[] = []
  const first = 1
  const last = total
  const start = Math.max(first, current - radius)
  const end = Math.min(last, current + radius)
  if (start > first) {
    pages.push(first)
    if (start > first + 1) pages.push('…')
  }
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < last) {
    if (end < last - 1) pages.push('…')
    pages.push(last)
  }
  return pages
}

export function Pagination({ page, page_size, total_count, onPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total_count / page_size))
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(Math.min(totalPages, page + 1))
  const pages = windowedPages(page, totalPages, 1)

  return (
    <div className="pagination">
      <button className="btn" onClick={prev} disabled={page <= 1}>Previous</button>
      <div className="page-pills">
        {pages.map((p, i) => (
          p === '…' ? (
            <span key={`e${i}`} className="ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pill ${p === page ? 'active' : ''}`}
              onClick={() => onPage(p)}
              disabled={p === page}
            >
              {p}
            </button>
          )
        ))}
      </div>
      <button className="btn" onClick={next} disabled={page >= totalPages}>Next</button>
    </div>
  )
}
