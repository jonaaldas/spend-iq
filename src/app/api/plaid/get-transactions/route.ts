import { NextResponse } from 'next/server'
import { client } from '@/lib/plaid'
import { auth } from '@clerk/nextjs/server'
import redis from '@/redis/redis'
import { format, subMonths } from 'date-fns'
import { AxiosError } from 'axios'

interface PlaidItem {
  item_id: string
  access_token: string
  institution_id: string
  institution_name: string
  date_connected: string
}

interface Institution {
  name: string
  institution_id: string
}

export async function GET(request: Request) {
  try {
    // Authenticate the user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all items for this user
    const itemsJson = await redis.get(`plaid:${userId}:items`)
    if (!itemsJson) {
      return NextResponse.json({ error: 'No linked bank accounts found' }, { status: 404 })
    }

    const items: PlaidItem[] = JSON.parse(itemsJson)
    if (items.length === 0) {
      return NextResponse.json({ error: 'No linked bank accounts found' }, { status: 404 })
    }

    // Set date range for transactions
    // By default, get transactions from the last 30 days
    const today = new Date()
    const startDate = format(subMonths(today, 1), 'yyyy-MM-dd')
    const endDate = format(today, 'yyyy-MM-dd')

    // For each item, fetch transactions and accounts
    const allTransactions: any[] = []
    const allAccounts: any[] = []
    const institutions: Record<string, Institution> = {}

    for (const item of items) {
      try {
        const accessToken = item.access_token

        // Fetch transactions with pagination
        let hasMore = true
        let cursor: string | undefined = undefined
        let itemTransactions: any[] = []

        while (hasMore) {
          const transactionsResponse = await client.transactionsSync({
            access_token: accessToken,
            cursor: cursor,
            count: 100, // Adjust count as needed
          })

          const { added, has_more, next_cursor } = transactionsResponse.data

          // Add transactions to our collection
          itemTransactions = [...itemTransactions, ...added]

          // Update pagination state
          hasMore = has_more
          cursor = next_cursor

          // Break if we've got a lot of transactions already
          // This is to prevent excessive API calls during development
          if (itemTransactions.length > 500) break
        }

        // Get accounts
        const accountsResponse = await client.accountsGet({
          access_token: accessToken,
        })

        // Store institution info
        institutions[item.institution_id] = {
          name: item.institution_name,
          institution_id: item.institution_id,
        }

        // Attach institution info to accounts
        const accountsWithInstitution = accountsResponse.data.accounts.map(account => ({
          ...account,
          institution: {
            name: item.institution_name,
            institution_id: item.institution_id,
          },
          item_id: item.item_id,
        }))

        // Add to collections
        allAccounts.push(...accountsWithInstitution)
        allTransactions.push(...itemTransactions)
      } catch (error) {
        console.error(`Error fetching data for item ${item.item_id}:`, error)
        // Continue with other items even if one fails
      }
    }

    return NextResponse.json({
      transactions: allTransactions,
      accounts: allAccounts,
      institutions: Object.values(institutions),
    })
  } catch (err) {
    console.error('Error fetching transactions:', err)

    // Handle specific error types
    if (err instanceof AxiosError) {
      const plaidError = err.response?.data?.error_code

      if (plaidError === 'ITEM_LOGIN_REQUIRED') {
        return NextResponse.json(
          {
            error: 'Your bank connection needs to be updated. Please reconnect your account.',
            error_code: 'ITEM_LOGIN_REQUIRED',
          },
          { status: 400 }
        )
      }

      if (plaidError === 'INVALID_ACCESS_TOKEN') {
        // Invalid token, might need to remove it
        return NextResponse.json(
          {
            error: 'Your bank connection is invalid. Please reconnect your account.',
            error_code: 'INVALID_ACCESS_TOKEN',
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ error: 'Could not retrieve your transactions' }, { status: 500 })
  }
}
