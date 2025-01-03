import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';

const API_BASE_URL = 'http://localhost:3000/api';
const MONGODB_URI = 'mongodb+srv://vezlove:572324V-v4@cluster0.bsbwj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function createToken() {
  const response = await fetch(`${API_BASE_URL}/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Token',
      symbol: 'TEST',
      description: 'A token for testing purposes',
      tokenImageUrl: 'https://example.com/test-token.png',
      fundingRaised: '0',
      tokenAddress: '0x1234567890123456789012345678901234567890',
      creatorAddress: '0x0987654321098765432109876543210987654321',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create token: ${response.statusText}`);
  }

  return await response.json();
}

async function buyToken(tokenId, buyerAddress, amount) {
  const response = await fetch(`${API_BASE_URL}/tokens/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId, buyerAddress, amount }),
  });

  if (!response.ok) {
    throw new Error(`Failed to buy token: ${response.statusText}`);
  }

  return await response.json();
}

async function verifyDatabaseState(tokenId) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  try {
    const db = client.db('v0_token_db');
    const tokensCollection = db.collection('tokens');

    const token = await tokensCollection.findOne({ _id: new ObjectId(tokenId) });

    if (!token) {
      throw new Error('Token not found in database');
    }

    console.log('Token in database:', token);

    // Verify token properties
    console.assert(token.name === 'Test Token', 'Token name mismatch');
    console.assert(token.symbol === 'TEST', 'Token symbol mismatch');
    console.assert(token.availableSupply === 999800, 'Available supply mismatch');
    console.assert(token.transactions.length === 1, 'Transaction count mismatch');

    const transaction = token.transactions[0];
    console.assert(transaction.type === 'buy', 'Transaction type mismatch');
    console.assert(transaction.buyerAddress === '0x1111111111111111111111111111111111111111', 'Buyer address mismatch');
    console.assert(transaction.amount === 200, 'Transaction amount mismatch');

  } finally {
    await client.close();
  }
}

async function runTest() {
  try {
    console.log('Creating test token...');
    const { id: tokenId } = await createToken();
    console.log('Token created with ID:', tokenId);

    console.log('Simulating token purchase...');
    const purchaseResult = await buyToken(tokenId, '0x1111111111111111111111111111111111111111', 200);
    console.log('Purchase result:', purchaseResult);

    console.log('Verifying database state...');
    await verifyDatabaseState(tokenId);

    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();