import axios from "axios";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
// import { ethers, Interface, Result, Transaction } from "ethers";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import { generatePreValidatedSignature } from "@safe-global/protocol-kit/dist/src/utils";
import { ethers, Interface, Result, Transaction } from "ethers"
import SafeApiKit from '@safe-global/api-kit';
import {  multiSigAddress, RPC_URL, SAFE_API_URL } from "@/lib/constants";



// const tenderly: Tenderly = require("tenderly");
const ensoApi = "https://api.enso.finance/api/v1/";
const ensoApiKey = "1e02632d-6feb-4a75-a157-documentation";
const tenderlyApi = "https://api.tenderly.co/api/v1";
const tenderlyProjectName = "project";
const tenderlyUserName = "amritjain";

const tenderlyProjectApi = `${tenderlyApi}/account/${tenderlyUserName}/project/${tenderlyProjectName}`;
const tenderlyApiKey = "0zBCBQ1AK8PKm51GbN5k9bopBGPXRhmF";
const safeOwner: string = "0x5788F90196954A272347aEe78c3b3F86F548D0a9";
const chainId: number = 1;

const threePoolManagerAddress = "0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b";
const twoPoolManagerAddress = "0x06378717d86b8cd2dba58c87383da1eda92d3495";
const poolManagerAddress = "0x9fb54d1f6f506feb4c65b721be931e59bb538c63";
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
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
  safeAddress: string,
  ensoWalletAddress: string
): EnsoAction[] => {
  try {
    const usdcAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    const output: EnsoAction[] = [];
    for (const [token, changes] of Object.entries(assetChanges)) {
      const amount = (changes.rawAmount / BigInt(10000000)).toString(); // todo: change this divide only used because enso route function is failing
      // use token address and amount to create the ensorouteaction
      const approveToken = approveTokenData(token, ensoWalletAddress, amount);
      output.push(approveToken);
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
    throw new Error("Error building transaction")
  }
  
};

const updateAssetChanges = (
  assetChanges: Record<string, AssetChanges>,
  userAddress: string,
  tokenAddr: string,
  amount: number,
  rawAmount: bigint
): Record<string, AssetChanges> => {
  try {
    if (!assetChanges[userAddress]) {
      assetChanges[userAddress] = {};
    }
    if (!assetChanges[userAddress][tokenAddr]) {
      assetChanges[userAddress][tokenAddr] = {
        amount: 0,
        rawAmount: BigInt(0),
      };
    }
    assetChanges[userAddress][tokenAddr].amount += amount;
    assetChanges[userAddress][tokenAddr].rawAmount += rawAmount;
  
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

  for (const changes of assetChangesSimulation) {
    let tokenAddr = changes.token_info.contract_address;
    if (changes.token_info.type == "Native" || !tokenAddr) {
      tokenAddr = ethAddress;
    }
    const data = {};
    const toAddress = changes.to;

    const amount = Number(changes.amount);
    const rawAmount = BigInt(changes.raw_amount);
    if (changes.type == "Transfer" || changes.type == "Mint") {
      assetChanges = updateAssetChanges(
        assetChanges,
        toAddress,
        tokenAddr,
        amount,
        rawAmount
      );
    }

    if (changes.type === "Transfer" || changes.type == "Burn") {
      const fromAddress = changes.from;

      assetChanges = updateAssetChanges(
        assetChanges,
        fromAddress,
        tokenAddr,
        -amount,
        -rawAmount
      );
    }
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
  safeOwner: string
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
    safeAddress,
    ensoWalletAddress
  );

  // [...claimRewardEnsoData, ...swapData],
  const ensoClaimAndSwapTxData = await ensoBuildTx(
    [...claimRewardEnsoData],
    safeAddress,
    chainId
  );

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

  const multisigAssetChanges = assetChanges[multiSigAddress];

  const outputTx = {
    data: ensoClaimAndSwapTxData.tx.data,
    to: ensoClaimAndSwapTxData.tx.to,
    value: ensoClaimAndSwapTxData.tx.value,
    assetChanges: {
      claim: multisigClaimAssetChanges,
      claimAndSwap: multisigAssetChanges,
    },
  };

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


export const getPendingTransaction = async () => {
  try {
    
    const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);
    
    const safeApiKit = new SafeApiKit({
      chainId: (await ethersProvider.getNetwork()).chainId,
    });
  
    console.log(safeApiKit)
    const checksum_multisig = ethers.getAddress(multiSigAddress)
    const transactions = await safeApiKit.getPendingTransactions(checksum_multisig);
    
    console.log(transactions)
    return transactions;
  } catch (error) {
    console.log(error)
    throw new Error("Error fetching pending transactions")
  }

}


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
  
    const assetChanges = await convertSimulationToAssetChanges(
      claimAndSwapTxData
    );
    
  
    const multisigAssetChanges = assetChanges[multiSigAddress];
  
    return multisigAssetChanges;
    
    
  } catch (error) {
    throw new Error("Error re-simulating transaction");
  }


}

// export const rejectionTransaction = await protocolKit.createRejectionTransaction(safeTransaction.data.nonce)

