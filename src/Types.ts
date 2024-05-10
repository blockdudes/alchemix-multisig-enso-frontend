import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";

export interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
  dollarValue: number;
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
