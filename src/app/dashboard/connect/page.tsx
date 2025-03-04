'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'

export default function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [showPlaidLink, setShowPlaidLink] = useState(false)
  const router = useRouter()

  const onSuccess = (public_token: string, metadata: any) => {
    console.log('Success:', public_token, metadata)
    exchangePublicTokenForAccessToken(public_token)
  }

  const exchangePublicTokenForAccessToken = async (public_token: string) => {
    try {
      const response = await fetch('/api/plaid/set-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `public_token=${public_token}`,
      })

      if (!response.ok) {
        throw new Error('Failed to exchange token')
      }

      const data = await response.json()
      console.log('Exchange success:', data)
      // Redirect to the dashboard after successful connection
      router.push('/dashboard/home')
    } catch (error) {
      console.error('Error exchanging token:', error)
    }
  }

  const config = {
    token: linkToken,
    onSuccess,
    onExit: (err: any, metadata: any) => {
      console.log('Exit:', err, metadata)
      setShowPlaidLink(false)
    },
  }

  const { open, ready } = usePlaidLink(config)

  useEffect(() => {
    if (showPlaidLink && ready && linkToken) {
      open()
      setShowPlaidLink(false)
    }
  }, [showPlaidLink, ready, open, linkToken])

  const handleConnectClick = async () => {
    if (linkToken && ready) {
      setShowPlaidLink(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to create link token')
      }
      const data = await response.json()
      console.log('Link token:', data.link_token)
      setLinkToken(data.link_token)
      setShowPlaidLink(true)
    } catch (error) {
      console.error('Error getting link token:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Connect a New Account</h1>
        <p className="text-muted-foreground">
          Connect additional accounts to get a more complete view of your finances
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connect Your Account</CardTitle>
          <CardDescription>
            Link your bank accounts securely using Plaid&apos;s trusted connection service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 font-medium">How it works:</h3>
            <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Click the &quot;Connect Your Account&quot; button below</li>
              <li>Select your bank from the list of supported institutions</li>
              <li>Securely log in to your bank using your existing credentials</li>
              <li>Choose which accounts you want to connect</li>
              <li>You&apos;ll be redirected back once the connection is complete</li>
            </ol>
          </div>

          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <h3 className="mb-1 flex items-center font-medium text-amber-800 dark:text-amber-400">
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              Security Note
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your bank login credentials are never shared with us. Plaid uses bank-level security
              to ensure your information stays protected.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard/home')}>
            Cancel
          </Button>
          <Button onClick={handleConnectClick} disabled={isLoading}>
            {isLoading ? 'Connecting...' : 'Connect Account'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
