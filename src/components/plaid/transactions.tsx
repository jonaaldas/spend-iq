'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCcw, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useFinancialData,
  type Transaction,
  type Account,
  type Institution,
} from '@/hooks/use-financial-data'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown } from 'lucide-react'

export function TransactionsView() {
  // Use the shared financial data hook
  const { transactions, accounts, institutions, isLoading, isRefreshing, error, refreshData } =
    useFinancialData()

  // State to track selected institutions
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  // State to hold sorted transactions to ensure consistent rendering
  const [sortedTransactions, setSortedTransactions] = useState<any[]>([])
  // State to store processed data
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([])
  const [accountsByInstitution, setAccountsByInstitution] = useState<Record<string, any[]>>({})
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [currencyCode, setCurrencyCode] = useState<string>('USD')

  // Set default selected institutions when data is loaded
  useEffect(() => {
    if (institutions.length > 0 && selectedInstitutions.length === 0) {
      // By default, select all institutions
      setSelectedInstitutions(institutions.map(inst => inst.institution_id))
    }
  }, [institutions, selectedInstitutions.length])

  // Process data when transactions, accounts or selectedInstitutions change
  useEffect(() => {
    // Filter accounts based on selected institutions
    const filtered = accounts.filter(
      account =>
        account.institution && selectedInstitutions.includes(account.institution.institution_id)
    )
    setFilteredAccounts(filtered)

    // Calculate total balance
    const total = filtered.reduce((sum, account) => sum + account.balances.current, 0)
    setTotalBalance(total)

    // Set currency code
    if (filtered.length > 0) {
      setCurrencyCode(filtered[0].balances.iso_currency_code)
    }

    // Filter and sort transactions
    const filtered_txns = transactions.filter(transaction => {
      const account = accounts.find(a => a.account_id === transaction.account_id)
      return (
        account?.institution && selectedInstitutions.includes(account.institution.institution_id)
      )
    })

    // Sort transactions by date, newest first (do this once and store the result)
    const sorted = [...filtered_txns].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    setSortedTransactions(sorted)

    // Group accounts by institution
    const grouped = filtered.reduce((grouped: Record<string, any[]>, account) => {
      if (account.institution) {
        const instId = account.institution.institution_id
        if (!grouped[instId]) {
          grouped[instId] = []
        }
        grouped[instId].push(account)
      }
      return grouped
    }, {})
    setAccountsByInstitution(grouped)
  }, [transactions, accounts, selectedInstitutions])

  // Event handlers for institution selection
  const toggleInstitution = (institutionId: string) => {
    setSelectedInstitutions(prev => {
      if (prev.includes(institutionId)) {
        return prev.filter(id => id !== institutionId)
      } else {
        return [...prev, institutionId]
      }
    })
  }

  const selectAllInstitutions = () => {
    setSelectedInstitutions(institutions.map(inst => inst.institution_id))
  }

  const clearInstitutionSelection = () => {
    setSelectedInstitutions([])
  }

  // Show loading state
  if (isLoading) {
    return <TransactionsSkeleton />
  }

  // Show error state
  if (error) {
    return <TransactionsError message={error} />
  }

  // Show empty state if no transactions or accounts
  if (transactions.length === 0 || accounts.length === 0) {
    return <NoTransactions />
  }

  return (
    <div className="space-y-6">
      {/* Header with summary information */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''} | Total
            Balance: {formatCurrency(totalBalance, currencyCode)}
          </p>
        </div>

        <div className="flex gap-2">
          {/* Institution filter dropdown */}
          {institutions.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  Filter Accounts <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Filter by Institution</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {institutions.map(institution => (
                  <DropdownMenuItem
                    key={institution.institution_id}
                    onClick={() => toggleInstitution(institution.institution_id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {selectedInstitutions.includes(institution.institution_id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <div className="w-4" />
                    )}
                    {institution.logo && (
                      <img src={institution.logo} alt={institution.name} className="h-4 w-4" />
                    )}
                    {institution.name}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={selectAllInstitutions} className="cursor-pointer">
                  Select All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={clearInstitutionSelection} className="cursor-pointer">
                  Clear Selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Refresh button */}
          <Button variant="outline" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          {/* Connect account button */}
          <Link href="/dashboard/connect">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Recent Transactions
                <Badge className="ml-2">{sortedTransactions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Use pre-sorted transactions */}
                  {sortedTransactions
                    .slice(0, 100) // Limit to 100 most recent transactions
                    .map(transaction => {
                      const account = accounts.find(a => a.account_id === transaction.account_id)
                      const institution = account?.institution

                      return (
                        <TableRow key={transaction.transaction_id}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell>
                            {transaction.merchant_name || transaction.name}
                            {transaction.pending && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-yellow-600 bg-yellow-50"
                              >
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{transaction.category?.[0] || 'Uncategorized'}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {institution?.logo && (
                                <img
                                  src={institution.logo}
                                  alt={institution.name}
                                  className="h-4 w-4 mr-2"
                                />
                              )}
                              <span>{account?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={transaction.amount > 0 ? 'text-red-600' : 'text-green-600'}
                            >
                              {formatCurrency(
                                transaction.amount,
                                account?.balances.iso_currency_code || 'USD'
                              )}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </CardContent>
            {sortedTransactions.length > 100 && (
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Showing 100 of {sortedTransactions.length} transactions
                </p>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <div className="space-y-6">
            {Object.entries(accountsByInstitution).map(([institutionId, accounts]) => {
              const institution = institutions.find(i => i.institution_id === institutionId)

              if (!institution) return null

              // Calculate institution total balance
              const instTotal = accounts.reduce((sum, account) => sum + account.balances.current, 0)

              return (
                <Card key={institutionId}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      {institution.logo && (
                        <img
                          src={institution.logo}
                          alt={institution.name}
                          className="h-6 w-6 mr-2"
                        />
                      )}
                      {institution.name}
                      <span className="ml-auto text-lg font-normal">
                        {formatCurrency(
                          instTotal,
                          accounts[0]?.balances.iso_currency_code || 'USD'
                        )}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Available</TableHead>
                          <TableHead className="text-right">Current</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map(account => (
                          <TableRow key={account.account_id}>
                            <TableCell className="font-medium">
                              {account.name} {account.mask ? `(${account.mask})` : ''}
                            </TableCell>
                            <TableCell>
                              {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                            </TableCell>
                            <TableCell className="text-right">
                              {account.balances.available !== null
                                ? formatCurrency(
                                    account.balances.available,
                                    account.balances.iso_currency_code
                                  )
                                : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(
                                account.balances.current,
                                account.balances.iso_currency_code
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <Skeleton className="h-10 w-64" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full" />
          <div className="space-y-2 mt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{message}</p>
        <div className="flex space-x-3">
          <Button onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Link href="/dashboard/connect">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function NoTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No transactions found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          We couldn't find any transactions. This could be because:
        </p>
        <ul className="list-disc pl-5 mb-4 space-y-1 text-muted-foreground">
          <li>You haven't connected any accounts yet</li>
          <li>Your connected accounts don't have any transactions</li>
          <li>We're still syncing your transactions (this can take a few minutes)</li>
        </ul>
        <Link href="/dashboard/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Account
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
