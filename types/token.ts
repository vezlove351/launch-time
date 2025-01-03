export interface Transaction {
  type: string;
  buyerAddress: string;
  amount: number;
  date: Date;
}

export interface Token {
  _id: string;
  name: string;
  symbol: string;
  description: string;
  tokenImageUrl: string;
  fundingRaised: string;
  tokenAddress: string;
  creatorAddress: string;
  totalSupply: number;
  availableSupply: number;
  transactions: Transaction[];
}

