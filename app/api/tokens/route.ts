import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/utils/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  try {
    const db = await connectToDatabase()
    const tokensCollection = db.collection('tokens')

    const tokens = await tokensCollection.find({}).toArray()

    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const tokenData = await req.json()
    const db = await connectToDatabase()
    const tokensCollection = db.collection('tokens')

    const result = await tokensCollection.insertOne({
      ...tokenData,
      createdAt: new Date(),
      totalSupply: 1000000, // Initial total supply
      availableSupply: 1000000, // Initially, all tokens are available
      transactions: [] // Array to store transaction history
    })

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error('Error creating token:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
}

