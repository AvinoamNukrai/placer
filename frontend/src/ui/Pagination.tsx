type Props = {
  page: number
  page_size: number
  total_count: number
  onPage: (p: number) => void
}

export function Pagination({ page, page_size, total_count, onPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total_count / page_size))
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(Math.min(totalPages, page + 1))

  return (
    <div className="pagination">
      <button onClick={prev} disabled={page <= 1}>&laquo; Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={next} disabled={page >= totalPages}>Next &raquo;</button>
    </div>
  )
}
