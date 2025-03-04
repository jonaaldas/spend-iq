'use client'

import { useEffect, useState } from 'react'
import { TransactionsView } from '@/components/plaid/transactions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/plaid/get-transactions')
        if (!response.ok) {
          // If response is not OK, don't set isConnected
          if (response.status === 404) {
            // 404 means no linked bank account - this is expected for new users
            console.log('No linked bank account found')
          } else {
            // Other errors
            console.error('Error checking connection:', await response.text())
          }
          return
        }

        // Only set isConnected if we successfully got transactions
        const data = await response.json()
        if (data.transactions && data.accounts) {
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center p-12">Loading...</div>
  }

  if (!isConnected) {
    return <NotConnectedView />
  }

  return <TransactionsView />
}

function NotConnectedView() {
  return (
    <div className="mx-auto max-w-4xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Your Financial Dashboard</h1>
        <p className="text-muted-foreground">Track your income and expenses in one place</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Connect your bank account to begin tracking your finances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Connect your bank accounts securely using Plaid to automatically import your
            transactions and start tracking your spending.
          </p>

          <div className="flex justify-center pt-4">
            <Link href="/dashboard/connect">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Connect Your First Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Connect Your Accounts?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Automatic Import</h3>
              <p className="text-sm text-muted-foreground">
                Transactions are automatically imported from your bank, saving you time.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Complete View</h3>
              <p className="text-sm text-muted-foreground">
                See all your accounts in one place for a comprehensive view of your finances.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Smart Categorization</h3>
              <p className="text-sm text-muted-foreground">
                Transactions are automatically categorized to help you understand your spending.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
