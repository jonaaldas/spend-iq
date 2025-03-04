'use client'

import { useState, useEffect } from 'react'

// Interfaces for the financial data
interface Transaction {
  transaction_id: string
  amount: number
  date: string
  name: string
  merchant_name: string | null
  category: string[]
  payment_channel: string
  pending: boolean
  account_id: string
}

interface Account {
  account_id: string
  balances: {
    available: number | null
    current: number
    iso_currency_code: string
    limit: number | null
  }
  mask: string
  name: string
  official_name: string | null
  type: string
  subtype: string
  item_id: string
  institution?: {
    name: string
    institution_id: string
    logo?: string
  }
}

interface Institution {
  institution_id: string
  name: string
  logo?: string
}

interface FinancialData {
  transactions: Transaction[]
  accounts: Account[]
  institutions: Institution[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refresh: () => void
}

// Create a singleton to prevent multiple fetches
let globalData: {
  transactions: Transaction[]
  accounts: Account[]
  institutions: Institution[]
  lastFetched: number | null
} = {
  transactions: [],
  accounts: [],
  institutions: [],
  lastFetched: null,
}

// Cache validity duration (in milliseconds)
const CACHE_VALIDITY = 5 * 60 * 1000 // 5 minutes

export function useFinancialData(): FinancialData {
  const [transactions, setTransactions] = useState<Transaction[]>(globalData.transactions)
  const [accounts, setAccounts] = useState<Account[]>(globalData.accounts)
  const [institutions, setInstitutions] = useState<Institution[]>(globalData.institutions)
  const [isLoading, setIsLoading] = useState(globalData.lastFetched === null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (forceRefresh = false) => {
    try {
      // Only show loading state if we don't have any data yet
      if (globalData.transactions.length === 0) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      // Check if cache is still valid (only if not forcing refresh)
      const now = Date.now()
      if (
        !forceRefresh &&
        globalData.lastFetched &&
        now - globalData.lastFetched < CACHE_VALIDITY &&
        globalData.transactions.length > 0
      ) {
        console.log('Using in-memory cached data')
        setTransactions(globalData.transactions)
        setAccounts(globalData.accounts)
        setInstitutions(globalData.institutions)
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      // Add refresh parameter when forcing refresh to bypass server cache too
      const refreshParam = forceRefresh ? '?refresh=true' : ''
      const response = await fetch(`/api/plaid/get-transactions${refreshParam}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('No linked bank accounts found. Please connect an account first.')
        } else if (response.status === 400) {
          const errorData = await response.json()
          if (errorData.error_code === 'ITEM_LOGIN_REQUIRED') {
            setError('Your bank connection needs to be updated. Please reconnect your account.')
          } else {
            setError(errorData.error || 'There was an issue with your bank connection.')
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || 'Could not load your financial data. Please try again later.')
        }
        return
      }

      const data = await response.json()

      // Update both local state and global cache
      const fetchedTransactions = data.transactions || []
      const fetchedAccounts = data.accounts || []
      const fetchedInstitutions = data.institutions || []

      // Update global cache
      globalData = {
        transactions: fetchedTransactions,
        accounts: fetchedAccounts,
        institutions: fetchedInstitutions,
        lastFetched: Date.now(),
      }

      // Update component state
      setTransactions(fetchedTransactions)
      setAccounts(fetchedAccounts)
      setInstitutions(fetchedInstitutions)
      setError(null)
    } catch (err) {
      console.error('Error fetching financial data:', err)
      setError('Could not load your financial data. Please try again later.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial fetch when component mounts (if needed)
  useEffect(() => {
    fetchData(false)
  }, [])

  // Function to trigger a refresh
  const refresh = () => {
    fetchData(true)
  }

  return {
    transactions,
    accounts,
    institutions,
    isLoading,
    isRefreshing,
    error,
    refresh,
  }
}
