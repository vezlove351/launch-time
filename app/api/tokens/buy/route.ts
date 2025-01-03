import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/utils/mongodb'
import { ObjectId } from 'mongodb'

interface Transaction {
    type: string;
    buyerAddress: string;
    amount: number;
    date: Date;
  }

  export async function POST(req: Request) {
    try {
      const { tokenId, buyerAddress, amount } = await req.json()
      const db = await connectToDatabase()
      const tokensCollection = db.collection('tokens')
  
      // Find the token and update its available supply
      const token = await tokensCollection.findOne({ _id: new ObjectId(tokenId) })
      if (!token) {
        return NextResponse.json({ error: 'Token not found' }, { status: 404 })
      }
  
      if (token.availableSupply < amount) {
        return NextResponse.json({ error: 'Not enough tokens available' }, { status: 400 })
      }

      const newTransaction: Transaction = {
        type: 'buy',
        buyerAddress,
        amount,
        date: new Date()
      }

    // Update the token document
    const updateResult = await tokensCollection.updateOne(
      { _id: new ObjectId(tokenId) },
      {
        $inc: { availableSupply: -amount },
        $push: { transactions: newTransaction as any }
      }
    )

    if (updateResult.modifiedCount === 0) {
        return NextResponse.json({ error: 'Failed to update token' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Token purchase successful' })
    } catch (error) {
      console.error('Error buying token:', error)
      return NextResponse.json({ error: 'Failed to buy token' }, { status: 500 })
    }
  }

