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
import { formatCurrency } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCcw, Filter } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  }
}

interface Institution {
  institution_id: string
  name: string
}

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/plaid/get-transactions')

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 404) {
          setError('No linked bank account found. Please connect your account first.')
        } else if (response.status === 400) {
          const errorData = await response.json()
          if (errorData.error_code === 'ITEM_LOGIN_REQUIRED') {
            setError('Your bank connection needs to be updated. Please reconnect your account.')
          } else {
            setError(errorData.error || 'There was an issue with your bank connection.')
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || 'Could not load your transactions. Please try again later.')
        }
        return
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
      setAccounts(data.accounts || [])
      setInstitutions(data.institutions || [])

      // Set all institutions as selected by default
      if (data.institutions && selectedInstitutions.length === 0) {
        setSelectedInstitutions(data.institutions.map((inst: Institution) => inst.institution_id))
      }

      setError(null)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError('Could not load your transactions. Please try again later.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchTransactions()
  }

  const handleInstitutionToggle = (institutionId: string) => {
    setSelectedInstitutions(prev => {
      if (prev.includes(institutionId)) {
        return prev.filter(id => id !== institutionId)
      } else {
        return [...prev, institutionId]
      }
    })
  }

  const handleSelectAllInstitutions = () => {
    setSelectedInstitutions(institutions.map(inst => inst.institution_id))
  }

  const handleClearInstitutions = () => {
    setSelectedInstitutions([])
  }

  // Filter accounts and transactions based on selected institutions
  const filteredAccounts = accounts.filter(
    account =>
      account.institution && selectedInstitutions.includes(account.institution.institution_id)
  )

  const filteredTransactions = transactions.filter(transaction => {
    const account = accounts.find(a => a.account_id === transaction.account_id)
    return account?.institution && selectedInstitutions.includes(account.institution.institution_id)
  })

  if (isLoading && !isRefreshing) {
    return <TransactionsSkeleton />
  }

  if (error && !isRefreshing) {
    return <TransactionsError message={error} />
  }

  if (transactions.length === 0 && !isRefreshing) {
    return <NoTransactions />
  }

  // Calculate total balance across filtered accounts
  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balances.current, 0)

  // Get unique currency code (assuming all accounts use the same currency)
  const currencyCode =
    filteredAccounts.length > 0 ? filteredAccounts[0].balances.iso_currency_code : 'USD'

  // Group accounts by institution for display
  const accountsByInstitution = filteredAccounts.reduce((grouped, account) => {
    const institutionId = account.institution?.institution_id || 'unknown'
    if (!grouped[institutionId]) {
      grouped[institutionId] = []
    }
    grouped[institutionId].push(account)
    return grouped
  }, {} as Record<string, Account[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <p className="text-muted-foreground">Manage your accounts and track your spending</p>
        </div>
        <div className="flex space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter Institutions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex justify-between px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllInstitutions}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearInstitutions}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
              {institutions.map(institution => (
                <DropdownMenuCheckboxItem
                  key={institution.institution_id}
                  checked={selectedInstitutions.includes(institution.institution_id)}
                  onCheckedChange={() => handleInstitutionToggle(institution.institution_id)}
                >
                  {institution.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Link href="/dashboard/connect">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Connect Account
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Overview</CardTitle>
          <CardDescription>
            Total Balance: {formatCurrency(totalBalance, currencyCode)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Current</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map(account => (
                <TableRow key={account.account_id}>
                  <TableCell className="font-medium">
                    {account.name} {account.mask ? `(${account.mask})` : ''}
                  </TableCell>
                  <TableCell>{account.institution?.name || 'Unknown'}</TableCell>
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
                    {formatCurrency(account.balances.current, account.balances.iso_currency_code)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="by-account">By Account</TabsTrigger>
          <TabsTrigger value="by-institution">By Institution</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <TransactionsList
            transactions={filteredTransactions}
            title="All Transactions"
            description="Your transactions from the past 30 days"
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <TransactionsList
            transactions={filteredTransactions.filter(t => t.pending)}
            title="Pending Transactions"
            description="Transactions that haven't settled yet"
          />
        </TabsContent>

        <TabsContent value="by-account" className="mt-4">
          <div className="space-y-6">
            {filteredAccounts.map(account => (
              <TransactionsList
                key={account.account_id}
                transactions={filteredTransactions.filter(t => t.account_id === account.account_id)}
                title={`${account.name} ${account.mask ? `(${account.mask})` : ''}`}
                description={`Transactions for your ${account.subtype} account${
                  account.institution ? ` at ${account.institution.name}` : ''
                }`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-institution" className="mt-4">
          <div className="space-y-6">
            {Object.entries(accountsByInstitution).map(([institutionId, accounts]) => {
              const institution = institutions.find(i => i.institution_id === institutionId)
              const institutionName = institution?.name || 'Unknown Institution'
              const accountIds = accounts.map(a => a.account_id)

              return (
                <TransactionsList
                  key={institutionId}
                  transactions={filteredTransactions.filter(t => accountIds.includes(t.account_id))}
                  title={institutionName}
                  description={`Transactions for your accounts at ${institutionName}`}
                />
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
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionsError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load transactions</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
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

function NoTransactions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No transactions found</CardTitle>
        <CardDescription>
          We couldn't find any transactions for your connected accounts in the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Another Account
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function TransactionsList({
  transactions,
  title,
  description,
}: {
  transactions: Transaction[]
  title: string
  description: string
}) {
  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No transactions found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map(transaction => (
              <TableRow key={transaction.transaction_id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  {transaction.merchant_name || transaction.name}
                  {transaction.pending && (
                    <span className="ml-2 text-xs text-muted-foreground">(Pending)</span>
                  )}
                </TableCell>
                <TableCell>
                  {transaction.category ? transaction.category[0] : 'Uncategorized'}
                </TableCell>
                <TableCell
                  className={`text-right ${
                    transaction.amount > 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
