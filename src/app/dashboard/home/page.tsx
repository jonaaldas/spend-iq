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
import { useState } from 'react'

export default function ConnectPage() {
  const [isConnected, setIsConnected] = useState(false)
  return (
    <>
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Account</CardTitle>
            <CardDescription>
              Link your bank accounts securely using Plaid's trusted connection service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 font-medium">How it works:</h3>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Click the "Connect Your Account" button below</li>
                <li>Select your bank from the list of supported institutions</li>
                <li>Securely log in to your bank using your existing credentials</li>
                <li>Choose which accounts you want to connect</li>
                <li>You'll be redirected back once the connection is complete</li>
              </ol>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
              <h3 className="mb-1 flex items-center font-medium text-amber-800 dark:text-amber-500">
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Security Note
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Your bank login credentials are never shared with us. Plaid uses bank-level security
                to ensure your information stays protected.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full">Connect Your Account</Button>
            <p className="text-center text-xs text-muted-foreground">
              By connecting your account, you agree to our{' '}
              <Link href="#" className="underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      ) : (
        <div>
          <h1>Welcome to Spend IQ</h1>
        </div>
      )}
    </>
  )
}
