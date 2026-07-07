import { useState } from 'react'

export default function TransferForm({ accounts, pending, onTransfer }) {
  const [fromAccountId, setFromAccountId] = useState('')
  const [toAccountId, setToAccountId] = useState('')
  const [amount, setAmount] = useState('')

  const canSubmit =
    !pending && fromAccountId !== '' && toAccountId !== '' && amount !== ''

  function handleSubmit(event) {
    event.preventDefault()
    onTransfer({
      fromAccountId: Number(fromAccountId),
      toAccountId: Number(toAccountId),
      amount: Number(amount),
    })
  }

  return (
    <form className="transfer-form" onSubmit={handleSubmit}>
      <label>
        From
        <select
          value={fromAccountId}
          onChange={(e) => setFromAccountId(e.target.value)}
          required
        >
          <option value="">Select account…</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              #{account.id} — {account.owner}
            </option>
          ))}
        </select>
      </label>

      <label>
        To
        <select
          value={toAccountId}
          onChange={(e) => setToAccountId(e.target.value)}
          required
        >
          <option value="">Select account…</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              #{account.id} — {account.owner}
            </option>
          ))}
        </select>
      </label>

      <label>
        Amount
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <button type="submit" disabled={!canSubmit}>
        {pending ? 'Transferring…' : 'Transfer'}
      </button>
    </form>
  )
}
