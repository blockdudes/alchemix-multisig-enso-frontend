export interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
  dollarValue: number;
}


export interface TokenData {
  token: string;
  balance: number;
  dollarValue: number;
  selected: boolean;
}

export interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
  };
}

export interface EnsoTx {
  data: string;
  to: string;
  value: string;
  assetChanges: {
    claim: AssetChanges;
    claimAndSwap: AssetChanges;
  };
}



export interface Assets {
  id: number;
  tokenName: string;
  amount: number;
  tick: boolean;
  dollarValue: number;

}