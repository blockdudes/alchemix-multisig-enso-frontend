import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";

export interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
  dollarValue: number;
}

// export interface AssetChanges {
//   [token: string]: {
//     amount: number;
//     rawAmount: bigint;
//   };
// }

export interface AssetSimpleData {
  [chainId: string]: TokenAddressSymbol;
}

export interface TokenAddressSymbol {
  [address: string]: string;
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
  id: string;
  tokenName: string;
  amount: number;
  tick: boolean;
  dollarValue: number;
  percentage?: number;
}

export interface DesiredOutputCardProps {
  totalBalance?: number;
}

export interface PendingTxData {
  pending?: SafeMultisigTransactionResponse;
  rejected?: SafeMultisigTransactionResponse;
}
export interface SafeTxData {
  to: string;
  value: string;
  input: string;
  from: string;
}

export interface EnsoAction {
  protocol: string;
  action: string;
  args: any;
}

export interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
    symbol: string;
    dollarValue: number;
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
  image: string 
}

export interface EndSimulation {
  claim: Record<string, AssetChanges>;
  claimAndSwap: Record<string, AssetChanges>;
}

export interface OdosSwapData {
  data: EnsoAction[]
  image: string
}