// Interface for the owner confirmation details
interface IOwnerConfirmation {
    owner: string;
    signature: string;
    signatureType: string;
    submissionDate: string;
    transactionHash: string | null;
  }
  
  // Interface for the parameters of the decoded data
  interface IDataParameter {
    name: string;
    type: string;
    value: string ;
  }
  
  // Interface for decoded transaction data
  interface IDataDecoded {
    method: string;
    parameters: IDataParameter[];
  }
  
  // Interface for a single transfer related to a transaction
  interface ITransfer {
    blockNumber: number;
    executionDate: string;
    from: string;
    to: string;
    value: string;
    tokenAddress: string | null;
    tokenId: string | null;
    transactionHash: string;
    type: string;
  }
  
  // Interface for the main multisig transaction object
  export interface IMultisigTransactionState {
    baseGas: number;
    blockNumber: number;
    confirmations: IOwnerConfirmation[];
    confirmationsRequired: number;
    data: string;
    dataDecoded: IDataDecoded;
    ethGasPrice: string;
    executionDate: string;
    executor: string;
    fee: string;
    gasPrice: string;
    gasToken: string;
    gasUsed: number;
    isExecuted: boolean;
    isSuccessful: boolean;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    modified: string;
    nonce: number;
    operation: number;
    origin: string;
    proposer: string;
    refundReceiver: string;
    safe: string;
    safeTxGas: number;
    safeTxHash: string;
    signatures: string;
    submissionDate: string;
    to: string;
    transactionHash: string;
    transfers: ITransfer[];
    trusted: boolean;
    txType: string;
    value: string;
  }
  