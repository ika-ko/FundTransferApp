import { useCallback, useEffect, useState } from 'react'
import { getAccounts, getTransactions, postTransfer } from './api.js'
import AccountsList from './components/AccountsList.jsx'
import TransferForm from './components/TransferForm.jsx'
import TransactionHistory from './components/TransactionHistory.jsx'

export default function App() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [transferResult, setTransferResult] = useState(null)
  const [transferPending, setTransferPending] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        getAccounts(),
        getTransactions(),
      ])
      setAccounts(accountsData)
      setTransactions(transactionsData)
      setLoadError(null)
    } catch {
      setLoadError('Could not reach the API. Is the backend running?')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleTransfer = useCallback(
    async (request) => {
      setTransferPending(true)
      setTransferResult(null)
      try {
        const result = await postTransfer(request)
        setTransferResult(result)
      } catch {
        setTransferResult({
          success: false,
          message: 'Could not reach the API. Is the backend running?',
        })
      } finally {
        setTransferPending(false)
        await refresh()
      }
    },
    [refresh],
  )

  return (
    <main className="app">
      <h1>Fund Transfer</h1>
      {loadError && <p className="banner error">{loadError}</p>}

      <section>
        <h2>Accounts</h2>
        <AccountsList accounts={accounts} />
      </section>

      <section>
        <h2>New Transfer</h2>
        <TransferForm
          accounts={accounts}
          pending={transferPending}
          onTransfer={handleTransfer}
        />
        {transferResult && (
          <p className={`banner ${transferResult.success ? 'success' : 'error'}`}>
            {transferResult.message}
          </p>
        )}
      </section>

      <section>
        <h2>Transaction History</h2>
        <TransactionHistory transactions={transactions} accounts={accounts} />
      </section>
    </main>
  )
}
