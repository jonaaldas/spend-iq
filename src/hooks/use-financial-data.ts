'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Transaction {
  transaction_id: string
  account_id: string
  amount: number
  date: string
  name: string
  merchant_name: string | null
  pending: boolean
  transaction_type: string
  payment_channel: string
  category: string[]
  category_id: string
  location?: {
    address?: string
    city?: string
    region?: string
    postal_code?: string
    country?: string
    lat?: number
    lon?: number
  }
}

export interface Account {
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

export interface Institution {
  institution_id: string
  name: string
  logo?: string
  accounts: Account[]
  itemId: string
}

interface FinancialData {
  transactions: Transaction[]
  accounts: Account[]
  institutions: Institution[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  refreshData: () => void
}

// Central hook for fetching and managing financial data
export function useFinancialData(): FinancialData {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch financial data
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setIsLoading(isLoading => isLoading || isRefreshing)

        // Add refresh parameter when forcing refresh
        const refreshParam = forceRefresh ? '?refresh=true' : ''
        const response = await fetch(`/api/plaid/get-transactions${refreshParam}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('No linked bank accounts found. Please connect an account first.')
          } else if (response.status === 400) {
            const errorData = await response.json().catch(() => ({ error: 'Invalid request' }))
            setError(errorData.error || 'There was an issue with the request. Please try again.')
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            setError(
              errorData.error || 'Could not load your financial data. Please try again later.'
            )
          }
          return
        }

        const data = await response.json()

        // Process the data
        setTransactions(data.transactions || [])
        setAccounts(data.accounts || [])

        // Process institutions data
        const apiInstitutions = data.institutions || []

        // Group accounts by institution_id
        const groupedInstitutions: Record<string, Institution> = {}

        // First, create institution entries
        apiInstitutions.forEach((inst: any) => {
          groupedInstitutions[inst.institution_id] = {
            institution_id: inst.institution_id,
            name: inst.name,
            logo: inst.logo,
            accounts: [],
            itemId: '', // Will be populated when we process accounts
          }
        })

        // Then add accounts to their institutions
        data.accounts.forEach((account: Account) => {
          if (account.institution && groupedInstitutions[account.institution.institution_id]) {
            // Add the account to its institution
            groupedInstitutions[account.institution.institution_id].accounts.push(account)
            // Set the itemId if not already set
            if (!groupedInstitutions[account.institution.institution_id].itemId) {
              groupedInstitutions[account.institution.institution_id].itemId = account.item_id
            }
          }
        })

        // Sort institutions by name for consistent rendering
        const sortedInstitutions = Object.values(groupedInstitutions).sort((a, b) =>
          a.name.localeCompare(b.name)
        )

        setInstitutions(sortedInstitutions)
        setError(null)
      } catch (err) {
        console.error('Error fetching financial data:', err)
        setError('Could not load your financial data. Please try again later.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [isRefreshing]
  )

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Function to refresh data on demand
  const refreshData = useCallback(() => {
    setIsRefreshing(true)
    fetchData(true) // Pass true to force a refresh
  }, [fetchData])

  return {
    transactions,
    accounts,
    institutions,
    isLoading,
    isRefreshing,
    error,
    refreshData,
  }
}
