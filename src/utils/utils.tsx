import axios from "axios";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
// import { ethers, Interface, Result, Transaction } from "ethers";
import { OperationType, SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";
import { generatePreValidatedSignature } from "@safe-global/protocol-kit/dist/src/utils";
import { ethers } from "ethers"
import SafeApiKit, { SafeMultisigTransactionListResponse } from '@safe-global/api-kit';
import { ethAddress, multiSigAddress, RPC_URL, SAFE_TRANSACTION_ORIGIN, SEPOLIA_RPC_URL, threePoolManagerAddress } from "@/lib/constants";
import { Assets, PendingTxData } from "@/Types";
import { Account } from "thirdweb/wallets";
import { useEthereum } from "@/context/store";
import { dummyData } from "@/dummydata";



// const tenderly: Tenderly = require("tenderly");
const ensoApi = "https://api.enso.finance/api/v1/";
const tenderlyApi = "https://api.tenderly.co/api/v1";
const tenderlyProjectName = "project";
const tenderlyUserName = "amritjain";
const tenderlyProjectApi = `${tenderlyApi}/account/${tenderlyUserName}/project/${tenderlyProjectName}`;


const ensoApiKey = "1e02632d-6feb-4a75-a157-documentation";
const tenderlyApiKey = "0zBCBQ1AK8PKm51GbN5k9bopBGPXRhmF";

// const zeroAddress = "0x0000000000"
interface SafeTxData {
  to: string;
  value: string;
  input: string;
  from: string;
}

interface EnsoAction {
  protocol: string;
  action: string;
  args: any;
}

interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
    symbol: string;
    dollarValue: number
  };
}
interface EnsoRouteAction extends EnsoAction {
  protocol: string;
  action: string;
  args: {
    slippage: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    receiver: string;
  };
}

export interface EndSimulation {
  claim: Record<string, AssetChanges>;
  claimAndSwap: Record<string, AssetChanges>;
}

let safeSdk: Safe;
export const getEnsoWalletAddress = async (
  chainId: string,
  fromAddress: string
): Promise<string> => {
  try {
    const {
      data: { address: walletAddress },
    } = await axios.get(
      `${ensoApi}wallet?chainId=${chainId}&fromAddress=${fromAddress}`,
      {
        headers: {
          Authorization: `Bearer ${ensoApiKey}`,
        },
      }
    );
    return walletAddress;
  } catch (error) {
    throw new Error("Error getting enso wallet address")
  }

};

const claimRewardData = (): EnsoAction[] => {
  try {
    const output: EnsoAction[] = [
      {
        protocol: "enso",
        action: "call",
        args: {
          address: threePoolManagerAddress,
          method: "claimRewards",
          abi: "function claimRewards() external",
          args: [], // Fix: Allow an empty array for args
        },
      }, // todo: add more manager addresses
    ];
    return output;
  } catch (error) {
    throw new Error("Error creating claim reward data")
  }

};

export const usdcSwapData = (
  assetChanges: AssetChanges,
  // safeAddress: string,
  ensoWalletAddress: string
): EnsoAction[] => {
  try {
    const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const output: EnsoAction[] = [];
    for (const [token, changes] of Object.entries(assetChanges)) {
      const amount = (changes.rawAmount).toString(); // todo: change this divide only used because enso route function is failing
      // use token address and amount to create the ensorouteaction
      const approveToken = approveTokenData(token, ensoWalletAddress, amount);
      output.push(approveToken);
      if (token != "0xd533a949740bb3306d119cc777fa900ba034cd52") {
        output.push({
          protocol: "enso",
          action: "route",
          args: {
            tokenIn: token,
            tokenOut: usdcAddress,
            amountIn: amount,
          },
        });
      }
    }
    return output
  } catch (error) {
    throw new Error("Error creating usdc swap data")
  }
  ;
};

const ensoBuildTx = async (
  actions: EnsoAction[],
  fromAddress: string,
  chainId: string
) => {
  try {
    const response = await axios.post(
      `${ensoApi}shortcuts/bundle?chainId=${chainId}&fromAddress=${fromAddress}`,
      actions,
      {
        headers: {
          Authorization: `Bearer ${ensoApiKey}`,
        },
      }
    );
    const txData = response.data;

    return txData;
  } catch (error) {
    console.log(error)
    throw new Error("Error building transaction")
  }

};

const updateAssetChanges = (
  assetChanges: Record<string, AssetChanges>,
  userAddress: string,
  tokenAddr: string,
  amount: number,
  rawAmount: bigint,
  symbol: string,
  dollarValue: number
): Record<string, AssetChanges> => {
  try {
    if (!assetChanges[userAddress]) {
      assetChanges[userAddress] = {};
    }
    if (!assetChanges[userAddress][tokenAddr]) {
      assetChanges[userAddress][tokenAddr] = {
        amount: 0,
        rawAmount: BigInt(0),
        symbol: symbol,
        dollarValue: 0
      };
    }
    assetChanges[userAddress][tokenAddr].amount += amount;
    assetChanges[userAddress][tokenAddr].rawAmount += rawAmount;
    assetChanges[userAddress][tokenAddr].dollarValue += dollarValue;

    return assetChanges;
  } catch (error) {
    throw new Error("Error updating asset changes")
  }

};
export const convertSimulationToAssetChanges = async (
  simulation: any
): Promise<Record<string, AssetChanges>> => {
  try {
    const assetChangesSimulation =
      simulation.transaction.transaction_info.asset_changes;
    console.log(assetChangesSimulation)
    let assetChanges: Record<string, AssetChanges> = {};

    console.log(assetChangesSimulation)
    for (const changes of assetChangesSimulation) {

      assetChanges = processAssetChanges(
        assetChanges,
        changes,

      );

    }
    return assetChanges;
  } catch (error) {
    console.log(error)
    throw new Error("Error converting simulation to asset changes")
  }

};

interface EnsoTx {
  data: string;
  to: string;
  value: string;
  assetChanges: {
    claim: AssetChanges;
    claimAndSwap: AssetChanges;
  };
}


export const buildClaimAndSwapTx = async (
  chainId: string,
  safeAddress: string,
  safeOwner: string,
  simulateClaimAndSwapBoth: boolean = false
): Promise<EnsoTx> => {

  try {
    const ensoWalletAddress = await getEnsoWalletAddress(chainId, safeAddress);

    const claimRewardEnsoData = claimRewardData();

    const ensoClaimRewardData = await ensoBuildTx(
      claimRewardEnsoData,
      safeAddress,
      chainId
    );


    let simulateEnsoClaimTxData;
    try {
      simulateEnsoClaimTxData = await simulateTx(
        chainId,
        ensoClaimRewardData.tx,
        safeAddress,
        safeOwner
      );
    } catch (error) {
      console.log("exitttttt", error)
    }
    const claimAssetChanges = await convertSimulationToAssetChanges(
      simulateEnsoClaimTxData
    );


    const multisigClaimAssetChanges: AssetChanges =
      claimAssetChanges[safeAddress]; // todo: handle errors


    const swapData = usdcSwapData(
      multisigClaimAssetChanges,
      ensoWalletAddress
    );

    // [...claimRewardEnsoData, ...swapData],
    const ensoClaimAndSwapTxData = await ensoBuildTx(
      [...claimRewardEnsoData,...swapData],
      safeAddress,
      chainId
    );

      let multisigClaimAndSwapAssetChanges = {};

      if(simulateClaimAndSwapBoth){

    const simulateEnsoClaimAndSwapTxData = await simulateTx(
      chainId,
      ensoClaimAndSwapTxData.tx,
      safeAddress,
      safeOwner
    );

    console.log(ensoClaimAndSwapTxData)

    const assetChanges = await convertSimulationToAssetChanges(
      simulateEnsoClaimAndSwapTxData
    );

     multisigClaimAndSwapAssetChanges = assetChanges[safeAddress];

      }
    const outputTx = {
      data: ensoClaimAndSwapTxData.tx.data,
      to: ensoClaimAndSwapTxData.tx.to,
      value: ensoClaimAndSwapTxData.tx.value,
      assetChanges: {
        claim: multisigClaimAssetChanges,
        claimAndSwap: multisigClaimAndSwapAssetChanges,
      },
    };

    console.log("-->",outputTx)
    return outputTx;
  } catch (error) {
    console.log(error)
    throw new Error("Error building claim and swap transaction")
  }

};


const approveTokenData = (
  tokenAddress: string,
  receiverAddress: string,
  amount: string
) => {
  try {
    const output = {
      protocol: "enso",
      action: "approve",
      args: {
        token: tokenAddress,
        spender: receiverAddress,
        amount: amount,
      },
    };
    return output;
  } catch (error) {
    throw new Error("Error creating approve token data");
  }
};

const safeTxDataFromEnsoTx = async (
  txData: Record<string, string>,
  safeAddress: string,
  safeOwner: string
) => {

  try {
    const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);

    safeSdk = await Safe.create({
      ethAdapter: new EthersAdapter({ ethers, signerOrProvider: ethersProvider }),
      safeAddress: safeAddress,
    });

    const safeTransaction = await safeSdk.createTransaction({
      transactions: [
        {
          to: txData.to,
          value: txData.value,
          data: txData.data,
          operation: OperationType.DelegateCall, // required for security
        },
      ],
    });
    const ownerSig = generatePreValidatedSignature(safeOwner);

    safeTransaction.addSignature(ownerSig);

    const safeTxInput = await safeSdk.getEncodedTransaction(safeTransaction);
    const safeTxData: SafeTxData = {
      to: safeAddress,
      value: safeTransaction.data.value,
      input: safeTxInput,
      from: safeOwner,
    };

    return safeTxData;
  } catch (error) {
    console.log(error)
    throw new Error("Error creating safe transaction");
  }


};

export const simulateTx = async (
  chainId: string,
  txData: Record<string, string>,
  safeAddress: string,
  safeOwner: string
): Promise<object> => {
  try {

    const safeTxData = await safeTxDataFromEnsoTx(txData, safeAddress, safeOwner);
    const response = await axios.post(
      `${tenderlyProjectApi}/simulate`,

      {
        network_id: chainId,
        ...safeTxData,
        state_objects: {
          [safeAddress]: {
            storage: {
              "0x0000000000000000000000000000000000000000000000000000000000000004":
                "0x0000000000000000000000000000000000000000000000000000000000000001",
            },
          },
        },
      },
      {
        headers: {
          "X-Access-Key": tenderlyApiKey,
        },
      }
    );

    // todo: handle error
    return response.data;

  } catch (error) {
    console.log(safeAddress)
    console.log(error)
    throw new Error("Error simulating transaction");
  }

};

// const setup = async (safeAddress: string) => {
// const ethersProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
// safeSdk = await Safe.create({
//   ethAdapter: new EthersAdapter({ ethers, signerOrProvider: ethersProvider }),
//   safeAddress: safeAddress,
// });
// };
// async function main() {
//   try {
//     await setup(multiSigAddress);
//     await buildClaimAndSwapTx(chainId.toString(), multiSigAddress, safeOwner);
//   } catch (e) {
//     console.log(e);
//   }
// }
// main();



const getTransactionQueue = async (safeAddress: string, chainId: number) => {
  try {
    const networkPrefix = {
      1: "eth",
      5: "goerli",
    }[chainId];
    const url = `https://app.safe.global/transactions/queue?safe=${networkPrefix}:${safeAddress}`;
    const response = await axios.get(url);
    return response.data;

  } catch (error) {
    throw new Error("Error fetching transaction queue");
  }
};

export const getAllTransations = async () => {

  try {

    const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);


    const safeApiKit = new SafeApiKit({
      chainId: (await ethersProvider.getNetwork()).chainId,

    });

    const checksum_multisig = ethers.getAddress(multiSigAddress)
    const transactions = await safeApiKit.getAllTransactions(checksum_multisig);

    return transactions;

  } catch (error) {
    throw new Error("Error fetching all transactions")
  }


}

const processAssetChanges = (
  assetChanges: Record<string, AssetChanges>,
  changes: any,

): Record<string, AssetChanges> => {

  let updatedAssetChanges = { ...assetChanges };
  let tokenAddr = changes.token_info.contract_address;
  if (changes.token_info.type === "Native" || !tokenAddr) {
    tokenAddr = ethAddress;
  }
  const amount = Number(changes.amount);
  const dollarValue = Number(changes.dollar_value);
  const rawAmount = BigInt(changes.raw_amount);
  const toAddress = changes.to;
  const fromAddress = changes.from;
  const symbol = changes.token_info?.symbol?.toUpperCase() || 'UNKWN';


  if (changes.type === "Transfer" || changes.type === "Mint") {
    updatedAssetChanges = updateAssetChanges(
      updatedAssetChanges,
      toAddress,
      tokenAddr,
      amount,
      rawAmount,
      symbol,
      dollarValue
    );
  }

  if (changes.type === "Transfer" || changes.type === "Burn") {
    updatedAssetChanges = updateAssetChanges(
      updatedAssetChanges,
      fromAddress,
      tokenAddr,
      -amount,
      -rawAmount,
      symbol,
      -dollarValue
    );
  }

  return updatedAssetChanges;
};

export const convertEndSimulationToAssetChanges = async (
  simulation: any,
  assetManagers: string[],
  multiSigAddress: string
): Promise<EndSimulation> => {
  const assetChangesSimulation =
    simulation.transaction.transaction_info.asset_changes;
  let assetChanges: Record<string, AssetChanges> = {};
  let claimRewards: Record<string, AssetChanges> = {};

  for (const changes of assetChangesSimulation) {

    assetChanges = processAssetChanges(
      assetChanges,
      changes,

    );

    const toAddress = changes.to;
    const fromAddress = changes.from;

    if (toAddress === multiSigAddress && assetManagers.includes(fromAddress)) {
      claimRewards = processAssetChanges(
        claimRewards,
        changes,
      );
    }
  }
  return { claim: claimRewards, claimAndSwap: assetChanges };
};

export const reSimulateTx = async (
  chainId: string,
  txData: any,
  safeAddress: string,
  safeOwner: string
) => {

  try {
    const claimAndSwapTxData = await simulateTx(
      chainId,
      txData,
      safeAddress,
      safeOwner
    );

    console.log(claimAndSwapTxData)

    const assetChanges: EndSimulation = await convertEndSimulationToAssetChanges(
      claimAndSwapTxData,
      [threePoolManagerAddress],
      safeAddress
    );

    return assetChanges
    // const multisigAssetChanges = assetChanges.claim[multiSigAddress];
    // const multisigAssetChanges = assetChanges.claim[multiSigAddress];

    // return multisigAssetChanges;


  } catch (error) {
    console.log(error)
    throw new Error("Error re-simulating transaction");
  }


}

export const getPendingTransaction_null =
  async (): Promise<PendingTxData | null> => {
    try {
      const ethersProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL); // todo: change this

      const safeApiKit = new SafeApiKit({
        chainId: (await ethersProvider.getNetwork()).chainId,
      });

      const checksum_multisig = ethers.getAddress(multiSigAddress);
      const pendingTxData: SafeMultisigTransactionListResponse =
        await safeApiKit.getPendingTransactions(checksum_multisig);
      const pendingTxs: PendingTxData[] = [];

      const ensoPendingTxs: Record<number, SafeMultisigTransactionResponse[]> =
        {};

      for (const tx of pendingTxData.results) {
        if (tx.origin === SAFE_TRANSACTION_ORIGIN) {
          if (ensoPendingTxs[tx.nonce]) {
            ensoPendingTxs[tx.nonce].push(tx);
          } else {
            ensoPendingTxs[tx.nonce] = [tx];
          }
        }
      }

      for (const [_, txs] of Object.entries(ensoPendingTxs)) {
        let isTxRejected = false;
        let pendingTx: SafeMultisigTransactionResponse | undefined = undefined;
        let rejectedTx: SafeMultisigTransactionResponse | undefined = undefined;

        for (const tx of txs) {
          const confirmationsRequired = tx.confirmationsRequired;
          const confirmations = tx.confirmations?.length ?? 0;
          let txConfirmed = false;

          if (confirmations >= confirmationsRequired) {
            txConfirmed = true;
          }

          const isRejected = tx.data == null && tx.value === "0";

          if (!isRejected) {
            pendingTx = tx;
          } else {
            rejectedTx = tx;
          }

          if (!isTxRejected && txConfirmed && isRejected) {
            isTxRejected = true;
          }
        }

        let txData: PendingTxData | undefined;
        if (pendingTx && !isTxRejected) {
          txData = {};
          txData.pending = pendingTx;
          if (rejectedTx) {
            txData.rejected = rejectedTx;
          }
        }

        if (txData) {
          pendingTxs.push(txData);
        }
      }

      if (pendingTxs.length === 0) {
        return null;
      } else {
        return pendingTxs[0];
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error fetching pending transactions");
    }

  };

export const getPendingTransaction =
  async (): Promise<PendingTxData | null> => {
    // await Promise<>;


    // Wait for the Promise to resolve, but do nothing with the result
    await new Promise((resolve) => resolve(null));
    return dummyData;
    // return null;
  }



  export const transformTransactionDataClaimAsset = (transactionData: any) => {
    const assetChanges = transactionData && transactionData.assetChanges?.claim;
    if (!assetChanges) return []; // Return an empty array if no asset changes
  
    return Object.entries(assetChanges).map<Assets>(([address, assetData]: [string, any]): Assets => ({
      id: address,
      amount: assetData.amount || 0,
      tick: !!assetData.amount,
      dollarValue: assetData.dollarValue || 0,
      tokenName: assetData.symbol || "",
      percentage: 0
    }));
  };
  

  export const transformTransactionDataClaimAndSwapAsset = (transactionData: any) => {
    const claimAndSwapAssets = transactionData && transactionData.assetChanges?.claimAndSwap;

    if (!claimAndSwapAssets) return []; // Return an empty array if no assets are present
    const totalDollarValue: number = Object.values(claimAndSwapAssets).reduce((total: number, asset: any) => total + asset.dollarValue, 0);
  
    // Filter and transform claim and swap assets directly from the data
    const outputTransformedData = Object.entries(claimAndSwapAssets)
      .map<Assets>(([address, assetData]: [string, any]):Assets => ({
        id: address,
        tokenName: assetData.symbol || "",
        amount: assetData.amount || 0,
        dollarValue: assetData.dollarValue || 0,
        tick: assetData.amount > 0.001,
        percentage: (assetData.dollarValue || 0) / totalDollarValue
      }))
      .filter(asset => asset.tick); // Filter out assets below the threshold of 0.001 amount
  
    // Sort the data by dollar value in descending order
    const sortedData = outputTransformedData.sort((a, b) => b.dollarValue - a.dollarValue);
  
    return sortedData;
  };
  
  // check if transaction is already rejected

  export const checkIfSigned = (pendingTransactions:any,activeAccount: Account | undefined  ) => {
    const txnData = pendingTransactions?.pending;
    if (!txnData) {
      return false;
    }
    const user = activeAccount?.address.toLowerCase();
    let hasSigned: boolean = false;
    for (const item of txnData?.confirmations) {
      if (item.owner.toLowerCase() === user) {
        hasSigned = true;
        break;
      }
    }

    console.log("signed", hasSigned);
    return hasSigned;
  };


  // check if transaction is already rejected
  export const checkIfRejected = (pendingTransactions:any,activeAccount: Account | undefined  ) => {
    const txnData = pendingTransactions?.rejected;
    let hasRejected: boolean = false;
    if (txnData) {
      const user = activeAccount?.address.toLowerCase();
      for (const item of txnData?.confirmations) {
        if (item.owner.toLowerCase() === user) {
          hasRejected = true;
          break;
        }
      }
    }


    return hasRejected;
  };

  // check if completed required confirmations
  export const checkIfConfirmed = (pendingTransactions:any, setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>) => {
    let confirmed = false;
    const txnData = pendingTransactions?.pending;
    if (txnData) {
      const confirmations_given = txnData?.confirmations.length;
      const confirmations_required = txnData?.confirmationsRequired;
      confirmed = confirmations_given >= confirmations_required;
    }

    console.log("Confirmed", confirmed)

    setIsConfirmed(confirmed);
  }
  