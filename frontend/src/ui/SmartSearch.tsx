type Props = {
  onSearch: (query: string) => void
  loading?: boolean
}

export function SmartSearch({ onSearch, loading }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('query') as string
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="card">
      <h3>Smart Search</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          name="query"
          placeholder="Ask a question like 'Show me all open Walmarts in Texas' or 'Find stores with high foot traffic'"
          style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}
          disabled={loading}
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </form>
    </div>
  )
}