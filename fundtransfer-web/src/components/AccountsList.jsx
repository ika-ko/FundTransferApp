const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function AccountsList({ accounts }) {
  if (accounts.length === 0) {
    return <p className="muted">No accounts to show.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Owner</th>
          <th className="num">Balance</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>{account.id}</td>
            <td>{account.owner}</td>
            <td className="num">{currency.format(account.balance)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
