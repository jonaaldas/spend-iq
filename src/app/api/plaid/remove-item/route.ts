import { NextResponse } from 'next/server'
import { client } from '@/lib/plaid'
import { auth } from '@clerk/nextjs/server'
import redis from '@/redis/redis'

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the item_id from the request
    const { item_id } = await request.json()
    if (!item_id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // Get all items for this user
    const itemsJson = await redis.get(`plaid:${userId}:items`)
    if (!itemsJson) {
      return NextResponse.json({ error: 'No items found' }, { status: 404 })
    }

    const items = JSON.parse(itemsJson)

    // Find the item
    const itemIndex = items.findIndex((item: any) => item.item_id === item_id)
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Get the access token for this item
    const accessToken = items[itemIndex].access_token

    try {
      // Remove the item from Plaid
      await client.itemRemove({
        access_token: accessToken,
      })
    } catch (error) {
      console.error('Error removing item from Plaid:', error)
      // Continue with removal from local storage even if Plaid API call fails
    }

    // Remove the item from the items array
    items.splice(itemIndex, 1)

    // Update the items in Redis
    await redis.set(`plaid:${userId}:items`, JSON.stringify(items))

    // If this was the last item and we have old format tokens, clear those too
    if (items.length === 0) {
      await redis.del(`plaid:${userId}:access_token`)
      await redis.del(`plaid:${userId}:item_id`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing item:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}
