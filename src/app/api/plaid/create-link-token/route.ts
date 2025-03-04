import { NextResponse } from 'next/server'
import { client } from '@/lib/plaid'
import { CountryCode, Products } from 'plaid'
import { auth } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const request = {
      user: { client_user_id: userId },
      client_name: 'Personal Finance Dashboard',
      products: [Products.Transactions, Products.Investments, Products.Auth],
      country_codes: [CountryCode.Us, CountryCode.Es],
      language: 'en',
    }
    const response = await client.linkTokenCreate(request)
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
