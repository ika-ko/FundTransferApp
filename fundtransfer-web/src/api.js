const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5137'

async function getJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`)
  }
  return response.json()
}

export function getAccounts() {
  return getJson('/api/accounts')
}

export function getTransactions() {
  return getJson('/api/transactions')
}

// Always resolves to { success, message }: the API returns that shape for
// every outcome (200/400/404/422/500), so non-2xx is not an exception here.
export async function postTransfer({ fromAccountId, toAccountId, amount }) {
  const response = await fetch(`${API_BASE_URL}/api/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromAccountId, toAccountId, amount }),
  })
  return response.json()
}
