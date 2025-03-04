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
import { Button } from '@/components/ui/button'
import { Plus, RefreshCcw, Unlink, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'

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
  accounts: Account[]
  itemId: string
}

export function AccountsView() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/plaid/get-transactions')

      if (!response.ok) {
        if (response.status === 404) {
          setError('No linked bank accounts found. Please connect an account first.')
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || 'Could not load your accounts. Please try again later.')
        }
        return
      }

      const data = await response.json()

      // Process institutions and accounts from the response
      const accounts = data.accounts || []
      const apiInstitutions = data.institutions || []

      // Group accounts by institution_id
      const groupedInstitutions: Record<string, Institution> = {}

      // First, create institution entries
      apiInstitutions.forEach((inst: any) => {
        groupedInstitutions[inst.institution_id] = {
          institution_id: inst.institution_id,
          name: inst.name,
          accounts: [],
          itemId: '', // Will be populated when we process accounts
        }
      })

      // Then add accounts to their institutions
      accounts.forEach((account: Account) => {
        if (account.institution && groupedInstitutions[account.institution.institution_id]) {
          // Add the account to its institution
          groupedInstitutions[account.institution.institution_id].accounts.push(account)
          // Set the itemId if not already set
          if (!groupedInstitutions[account.institution.institution_id].itemId) {
            groupedInstitutions[account.institution.institution_id].itemId = account.item_id
          }
        }
      })

      setInstitutions(Object.values(groupedInstitutions))
      setError(null)
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError('Could not load your accounts. Please try again later.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAccounts()
  }

  const handleDisconnect = async (itemId: string, institutionName: string) => {
    if (
      confirm(
        `Are you sure you want to disconnect ${institutionName}? This will remove all associated accounts.`
      )
    ) {
      try {
        const response = await fetch('/api/plaid/remove-item', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ item_id: itemId }),
        })

        if (response.ok) {
          toast.success(`Successfully disconnected ${institutionName}`)
          // Remove this institution from the state
          setInstitutions(institutions.filter(inst => inst.itemId !== itemId))
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to disconnect account')
        }
      } catch (err) {
        console.error('Error disconnecting account:', err)
        toast.error('Failed to disconnect account')
      }
    }
  }

  if (isLoading && !isRefreshing) {
    return <AccountsSkeleton />
  }

  if (error && !isRefreshing) {
    return <AccountsError message={error} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground">Manage your connected financial accounts</p>
        </div>
        <div className="flex space-x-3">
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

      {institutions.length === 0 ? (
        <NoAccounts />
      ) : (
        <div className="space-y-6">
          {institutions.map(institution => (
            <InstitutionCard
              key={institution.institution_id}
              institution={institution}
              onDisconnect={() => handleDisconnect(institution.itemId, institution.name)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AccountsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AccountsError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Could not load accounts</CardTitle>
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

function NoAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No accounts connected</CardTitle>
        <CardDescription>You haven't connected any financial accounts yet.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard/connect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Your First Account
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function InstitutionCard({
  institution,
  onDisconnect,
}: {
  institution: Institution
  onDisconnect: () => void
}) {
  // Calculate total balance across all accounts in this institution
  const totalBalance = institution.accounts.reduce(
    (sum, account) => sum + account.balances.current,
    0
  )

  // Get currency code from first account (assuming all accounts use same currency)
  const currencyCode =
    institution.accounts.length > 0 ? institution.accounts[0].balances.iso_currency_code : 'USD'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {institution.logo && (
              <img
                src={institution.logo}
                alt={institution.name}
                className="h-6 w-6 inline-block mr-2"
              />
            )}
            {institution.name}
          </CardTitle>
          <CardDescription>
            {institution.accounts.length} account{institution.accounts.length !== 1 ? 's' : ''} ·
            Total Balance: {formatCurrency(totalBalance, currencyCode)}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onDisconnect}>
          <Unlink className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institution.accounts.map(account => (
              <TableRow key={account.account_id}>
                <TableCell className="font-medium">
                  {account.name} {account.mask ? `(${account.mask})` : ''}
                </TableCell>
                <TableCell>
                  {account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}
                </TableCell>
                <TableCell className="text-right">
                  {account.balances.available !== null
                    ? formatCurrency(account.balances.available, account.balances.iso_currency_code)
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(account.balances.current, account.balances.iso_currency_code)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                    Connected
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link href="/dashboard/home">
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Transactions
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
