const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// The API stores UTC timestamps but serializes them without a zone marker,
// so mark them as UTC before converting to the viewer's local time.
function formatTimestamp(value) {
  const iso = /(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`
  return new Date(iso).toLocaleString()
}

export default function TransactionHistory({ transactions, accounts }) {
  if (transactions.length === 0) {
    return <p className="muted">No transfers have been attempted yet.</p>
  }

  const ownerById = new Map(accounts.map((a) => [a.id, a.owner]))
  const label = (id) =>
    ownerById.has(id) ? `#${id} — ${ownerById.get(id)}` : `#${id}`

  return (
    <table>
      <thead>
        <tr>
          <th>When</th>
          <th>From</th>
          <th>To</th>
          <th className="num">Amount</th>
          <th>Status</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{formatTimestamp(t.timestamp)}</td>
            <td>{label(t.fromAccountId)}</td>
            <td>{label(t.toAccountId)}</td>
            <td className="num">{currency.format(t.amount)}</td>
            <td>
              <span className={`badge ${t.succeeded ? 'success' : 'error'}`}>
                {t.succeeded ? 'Success' : 'Failed'}
              </span>
            </td>
            <td>{t.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
