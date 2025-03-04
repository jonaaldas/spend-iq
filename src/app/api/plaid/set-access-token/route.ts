import { NextResponse } from 'next/server'
import { client } from '@/lib/plaid'
import { auth } from '@clerk/nextjs/server'
import redis from '@/redis/redis'
import { CountryCode } from 'plaid'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const public_token = formData.get('public_token') as string

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token,
    })

    const ACCESS_TOKEN = tokenResponse.data.access_token
    const ITEM_ID = tokenResponse.data.item_id

    // Get institution information for this item
    const itemResponse = await client.itemGet({
      access_token: ACCESS_TOKEN,
    })

    const institutionId = itemResponse.data.item.institution_id || ''

    // Get institution details
    const institutionResponse = await client.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US'] as CountryCode[],
    })

    const institutionName = institutionResponse.data.institution.name

    // Get accounts for this item
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    })

    // Store item information including the timestamp
    const timestamp = new Date().toISOString()
    const itemData = {
      item_id: ITEM_ID,
      access_token: ACCESS_TOKEN,
      institution_id: institutionId,
      institution_name: institutionName,
      date_connected: timestamp,
      accounts: accountsResponse.data.accounts,
    }

    // Add to the list of items for this user
    // First, get existing items or create empty array
    const existingItemsJson = (await redis.get(`plaid:${userId}:items`)) || '[]'
    const existingItems = JSON.parse(existingItemsJson)

    // Add the new item, replacing it if it already exists (same institution)
    const itemIndex = existingItems.findIndex((item: any) => item.institution_id === institutionId)
    if (itemIndex >= 0) {
      existingItems[itemIndex] = itemData
    } else {
      existingItems.push(itemData)
    }

    // Save the updated items list
    await redis.set(`plaid:${userId}:items`, JSON.stringify(existingItems))

    // For backward compatibility, still save the most recent token in the old format
    await redis.set(`plaid:${userId}:access_token`, ACCESS_TOKEN)
    await redis.set(`plaid:${userId}:item_id`, ITEM_ID)

    return NextResponse.json({
      success: true,
      institution_name: institutionName,
      accounts: accountsResponse.data.accounts.length,
    })
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return NextResponse.json({ error: 'Failed to exchange public token' }, { status: 500 })
  }
}
