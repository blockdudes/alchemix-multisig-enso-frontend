import axios from "axios";
// import { ethers, Interface, Result, Transaction } from "ethers";
import {
  OperationType,
  SafeMultisigTransactionResponse,
} from "@safe-global/safe-core-sdk-types";
import { generatePreValidatedSignature } from "@safe-global/protocol-kit/dist/src/utils";
import { ethers } from "ethers";
import SafeApiKit, {
  SafeMultisigTransactionListResponse,
} from "@safe-global/api-kit";
import {
  assetManagerAddresses,
  DEFAULT_LAST_CLAIM_DATE,
  ethAddress,
  multiSigAddress,
  RPC_URL,
  SAFE_TRANSACTION_ORIGIN,
} from "@/lib/constants";
import { Assets, EnsoAction, PendingTxData, AssetChanges, EnsoTx, SafeTxData, EndSimulation, AssetSimpleData, TokenAddressSymbol } from "@/Types";
import { Account } from "thirdweb/wallets";
import { getSwapData } from "./odos";
import { setup } from "./helper";
// import { safeSdk } from "./safe";
import Papa from 'papaparse';

// const tenderly: Tenderly = require("tenderly");
const ensoApi = "https://api.enso.finance/api/v1/";
const tenderlyApi = "https://api.tenderly.co/api/v1";
const tenderlyProjectName = "project";
const tenderlyUserName = "amritjain";
const tenderlyProjectApi = `${tenderlyApi}/account/${tenderlyUserName}/project/${tenderlyProjectName}`;

const ensoApiKey = "1e02632d-6feb-4a75-a157-documentation";
const tenderlyApiKey = "0zBCBQ1AK8PKm51GbN5k9bopBGPXRhmF";

// const zeroAddress = "0x0000000000"
export const swapAssets: AssetSimpleData = {
  "1": {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
    "0xd1b5651e55d4ceed36251c61c50c889b36f6abb5": "sdCRV",
    //sdCRV, veFXS, FXS, CRV, CVX, ALCX, ETH, USDC, pyUSD, AURA
    "0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0":"veFXS",
    "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0":"FXS",
    "0xD533a949740bb3306d119CC777fa900bA034cd52":"CRV",
    "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b":"CVX",
    "0xdbdb4d16eda451d0503b854cf79d55697f90c8df":"ALCX",
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee":"ETH",
    "0x6c3ea9036406852006290770bedfcaba0e23a0e8":"pyUSD",
    "0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF":"AURA"
  },
};

export const getEnsoWalletAddress = async (
  chainId: string,
  fromAddress: string,
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
      },
    );
    return walletAddress;
  } catch (error) {
    throw new Error("Error getting enso wallet address");
  }
};

const claimRewardData = (): EnsoAction[] => {
  try {
    const output: EnsoAction[] = [
      
    ];
    for(const assetManagerAddress of assetManagerAddresses){
      const claimAction = {
        protocol: "enso",
        action: "call",
        args: {
          address: assetManagerAddress,
          method: "claimRewards",
          abi: "function claimRewards() external",
          args: [], // Fix: Allow an empty array for args
        },
      } 
      output.push(claimAction)
    }
    return output;
  } catch (error) {
    throw new Error("Error creating claim reward data");
  }
};

export const usdcSwapData = (
  assetChanges: AssetChanges,
  // safeAddress: string,
  // ensoWalletAddress: string
): EnsoAction[] => {
  try {
    const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const output: EnsoAction[] = [];
    for (const [token, changes] of Object.entries(assetChanges)) {
      const amount = changes.rawAmount.toString(); 
      output.push({
        protocol: "enso",
        action: "route",
        args: {
          tokenIn: token,
          tokenOut: usdcAddress,
          amountIn: amount,
          ignoreAggregators: ["enso"],
        },
      });
      // }
    }
    return output;
  } catch (error) {
    throw new Error("Error creating usdc swap data");
  }
};

const ensoBuildTx = async (
  actions: EnsoAction[],
  fromAddress: string,
  chainId: string,
) => {
  try {
    const response = await axios.post(
      `${ensoApi}shortcuts/bundle?chainId=${chainId}&fromAddress=${fromAddress}`,
      actions,
      {
        headers: {
          Authorization: `Bearer ${ensoApiKey}`,
        },
      },
    );
    const txData = response.data;

    return txData;
  } catch (error) {
    console.log(error);
    throw new Error("Error building transaction");
  }
};

const updateAssetChanges = (
  assetChanges: Record<string, AssetChanges>,
  userAddress: string,
  tokenAddr: string,
  amount: number,
  rawAmount: bigint,
  symbol: string,
  dollarValue: number,
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
        dollarValue: 0,
      };
    }
    assetChanges[userAddress][tokenAddr].amount += amount;
    assetChanges[userAddress][tokenAddr].rawAmount += rawAmount;
    assetChanges[userAddress][tokenAddr].dollarValue += dollarValue;

    return assetChanges;
  } catch (error) {
    throw new Error("Error updating asset changes");
  }
};
export const convertSimulationToAssetChanges = async (
  simulation: any,
): Promise<Record<string, AssetChanges>> => {
  try {
    const assetChangesSimulation =
      simulation.transaction.transaction_info.asset_changes;
    console.log(assetChangesSimulation);
    let assetChanges: Record<string, AssetChanges> = {};

    console.log(assetChangesSimulation);
    for (const changes of assetChangesSimulation) {
      assetChanges = processAssetChanges(assetChanges, changes);
    }
    return assetChanges;
  } catch (error) {
    console.log(error);
    throw new Error("Error converting simulation to asset changes");
  }
};


export const buildClaimAndSwapTx = async (
  chainId: string,
  safeAddress: string,
  safeOwner: string,
  simulateClaimAndSwapBoth: boolean = false,
  outputAssets: Assets[] | undefined,
  slippage: number = 0.3
): Promise<EnsoTx> => {
  try {
    // const ensoWalletAddress = await getEnsoWalletAddress(chainId, safeAddress);

    const claimRewardEnsoData = claimRewardData();

    let ensoTxData = await ensoBuildTx(
      claimRewardEnsoData,
      safeAddress,
      chainId,
    );

    let simulateEnsoClaimTxData;
    try {
      simulateEnsoClaimTxData = await simulateTx(
        chainId,
        ensoTxData.tx,
        safeAddress,
        safeOwner,
      );
    } catch (error) {
      console.log("exitttttt", error);
    }
    const claimAssetChanges = await convertSimulationToAssetChanges(
      simulateEnsoClaimTxData,
    );

    const multisigClaimAssetChanges: AssetChanges =
      claimAssetChanges[safeAddress]; // todo: handle errors



    let multisigClaimAndSwapAssetChanges = {};
    let image = ""
    if (simulateClaimAndSwapBoth && outputAssets != undefined) {


      // const swapData = usdcSwapData(
      //   multisigClaimAssetChanges,
      //   // ensoWalletAddress
      // );
  

      const {data: swapData, image: pathImage} = await getSwapData(
        safeAddress,
        Number(chainId),
        multisigClaimAssetChanges,
        outputAssets,
        slippage,
        // ensoWalletAddress
      );
      console.log(swapData)
      // [...claimRewardEnsoData, ...swapData],
       ensoTxData = await ensoBuildTx(
        [...claimRewardEnsoData, ...swapData],
        safeAddress,
        chainId,
      );

      const simulateEnsoClaimAndSwapTxData = await simulateTx(
        chainId,
        ensoTxData.tx,
        safeAddress,
        safeOwner,
      );

      console.log(ensoTxData)
      console.log(simulateEnsoClaimAndSwapTxData)


      const assetChanges = await convertSimulationToAssetChanges(
        simulateEnsoClaimAndSwapTxData,
      );
      console.log(assetChanges)

      multisigClaimAndSwapAssetChanges = assetChanges[safeAddress];
      image = pathImage
    }
    const outputTx = {
      data: ensoTxData.tx.data,
      to: ensoTxData.tx.to,
      value: ensoTxData.tx.value,
      assetChanges: {
        claim: multisigClaimAssetChanges,
        claimAndSwap: multisigClaimAndSwapAssetChanges,
      },
      image: image
    };

    console.log("-->", outputTx);
    return outputTx;
  } catch (error) {
    console.log(error);
    throw new Error("Error building claim and swap transaction");
  }
};


const safeTxDataFromEnsoTx = async (
  txData: Record<string, string>,
  safeAddress: string,
  safeOwner: string,
) => {
  try {
    const safeSdk = await setup(safeAddress);

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
    console.log(error);
    throw new Error("Error creating safe transaction");
  }
};

export const simulateTx = async (
  chainId: string,
  txData: Record<string, string>,
  safeAddress: string,
  safeOwner: string,
): Promise<object> => {
  try {
    const safeTxData = await safeTxDataFromEnsoTx(
      txData,
      safeAddress,
      safeOwner,
    );
    const response = await axios.post(
      `${tenderlyProjectApi}/simulate`,

      {
        network_id: chainId,
        ...safeTxData,
        "save": true,
        "save_if_fails": true,
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
      },
    );

    // todo: handle error
    return response.data;
  } catch (error) {
    console.log(safeAddress);
    console.log(error);
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

// const getTransactionQueue = async (safeAddress: string, chainId: number) => {
//   try {
//     const networkPrefix = {
//       1: "eth",
//       5: "goerli",
//     }[chainId];
//     const url = `https://app.safe.global/transactions/queue?safe=${networkPrefix}:${safeAddress}`;
//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     throw new Error("Error fetching transaction queue");
//   }
// };

export const getAllTransations = async () => {
  try {
    const ethersProvider = new ethers.JsonRpcProvider(RPC_URL);

    const safeApiKit = new SafeApiKit({
      chainId: (await ethersProvider.getNetwork()).chainId,
    });

    const checksum_multisig = ethers.getAddress(multiSigAddress);
    const transactions = await safeApiKit.getAllTransactions(checksum_multisig);

    return transactions;
  } catch (error) {
    throw new Error("Error fetching all transactions");
  }
};

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
  const symbol = changes.token_info?.symbol?.toUpperCase() || "UNKWN";

  if (changes.type === "Transfer" || changes.type === "Mint") {
    updatedAssetChanges = updateAssetChanges(
      updatedAssetChanges,
      toAddress,
      tokenAddr,
      amount,
      rawAmount,
      symbol,
      dollarValue,
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
      -dollarValue,
    );
  }

  return updatedAssetChanges;
};

export const convertEndSimulationToAssetChanges = async (
  simulation: any,
  assetManagers: string[],
  multiSigAddress: string,
): Promise<EndSimulation> => {
  const assetChangesSimulation =
    simulation.transaction.transaction_info.asset_changes;
  let assetChanges: Record<string, AssetChanges> = {};
  let claimRewards: Record<string, AssetChanges> = {};

  for (const changes of assetChangesSimulation) {
    assetChanges = processAssetChanges(assetChanges, changes);

    const toAddress = changes.to;
    const fromAddress = changes.from;

    if (toAddress === multiSigAddress && assetManagers.includes(fromAddress)) {
      claimRewards = processAssetChanges(claimRewards, changes);
    }
  }
  return { claim: claimRewards, claimAndSwap: assetChanges };
};

export const reSimulateTx = async (
  chainId: string,
  txData: any,
  safeAddress: string,
  safeOwner: string,
) => {
  try {
    const claimAndSwapTxData = await simulateTx(
      chainId,
      txData,
      safeAddress,
      safeOwner,
    );

    console.log(claimAndSwapTxData);

    const assetChanges: EndSimulation =
      await convertEndSimulationToAssetChanges(
        claimAndSwapTxData,
        assetManagerAddresses,
        safeAddress,
      );
      console.log(assetChanges)

    return assetChanges;
    // const multisigAssetChanges = assetChanges.claim[multiSigAddress];
    // const multisigAssetChanges = assetChanges.claim[multiSigAddress];

    // return multisigAssetChanges;
  } catch (error) {
    console.log(error);
    throw new Error("Error re-simulating transaction");
  }
};

export async function getLatestExecutionDate(): Promise<string> {

  const ethersProvider = new ethers.JsonRpcProvider(RPC_URL); // todo: change this
  // todo: change this
  const safeApiKit = new SafeApiKit({
    chainId: (await ethersProvider.getNetwork()).chainId,
  });

  const checksum_multisig = ethers.getAddress(multiSigAddress);
  const transactions: SafeMultisigTransactionResponse[] =
    (await safeApiKit.getMultisigTransactions(checksum_multisig)).results;
  // Filter transactions where the origin is "ENSO"
  const ensoTransactions = transactions.filter(tx => tx.origin === "ENSO");

  // If no transactions match, return null
  if (ensoTransactions.length === 0) {
      return DEFAULT_LAST_CLAIM_DATE;
  }

  // Sort the filtered transactions by executionDate in descending order
  ensoTransactions.sort((a: any, b: any) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime());

  // Return the latest executionDate
  return ensoTransactions[0].executionDate;
}


export const getPendingTransaction =
  async (): Promise<PendingTxData | null> => {
    try {
      // const ethersProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL); // todo: change this
      const ethersProvider = new ethers.JsonRpcProvider(RPC_URL); // todo: change this
      // todo: change this duplicate
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

          if (!isRejected && pendingTx == undefined) {
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
        console.log(pendingTxs);
        return pendingTxs[0];
      }
    } catch (error) {
      console.log(error);
      throw new Error("Error fetching pending transactions");
    }
  };

export const getPendingTransactionDummy =
  async (): Promise<PendingTxData | null> => {
    // await Promise<>;

    // Wait for the Promise to resolve, but do nothing with the result
    await new Promise((resolve) => resolve(null));
    // return dummyData;
    return null;
  };

export const transformTransactionDataClaimAsset = (transactionData: any) => {
  console.log(transactionData)

  const assetChanges = transactionData && transactionData.assetChanges?.claim;
  console.log(assetChanges)

  if (!assetChanges) return []; // Return an empty array if no asset changes
  return Object.entries(assetChanges).map<Assets>(
    ([address, assetData]: [string, any]): Assets => ({
      id: address,
      amount: assetData.amount || 0,
      tick: !!assetData.amount,
      dollarValue: assetData.dollarValue || 0,
      tokenName: assetData.symbol || "",
      percentage: 0,
    }),
  );
};
export const createAssets = (assetsData: TokenAddressSymbol): Assets[] => {
  let assets = [];
  // const assetsData = assetsMultiChainData["1"]; // todo: change this to dynamic chain id
  for (const [address, tokenName] of Object.entries(assetsData)) {
    if (tokenName != "") {
      assets.push({
        id: address,
        tokenName: tokenName,
        amount: 0,
        tick: false,
        dollarValue: 0,
      });
    }
  }
  return assets;
};
export const transformTransactionDataClaimAndSwapAsset = (
  transactionData: any,
) => {

  const claimAndSwapAssets =
    transactionData && transactionData.assetChanges?.claimAndSwap;

  if (!claimAndSwapAssets) return []; // Return an empty array if no assets are present
  const totalDollarValue: number = Object.values(claimAndSwapAssets).reduce(
    (total: number, asset: any) => total + asset.dollarValue,
    0,
  );

  let staticAssetsData = swapAssets["1"]; // todo: make this dynamic
  let outputTransformedData = []
  for(const [address, data] of Object.entries(claimAndSwapAssets)){ 
    const assetData: any = data
    const asset: Assets = {
      id: address,
      tokenName: assetData.symbol || "",
      amount: assetData.amount || 0,
      dollarValue: assetData.dollarValue || 0,
      tick: assetData.amount > 0.1,
      percentage: Number((((assetData.dollarValue || 0) / totalDollarValue) * 100).toFixed(2)),
    }
    if(asset.tick){
      outputTransformedData.push(asset)
      staticAssetsData[address] = ""
    }
  }


  const staticAssets = createAssets(staticAssetsData)
  outputTransformedData.push(...staticAssets)

  // Filter and transform claim and swap assets directly from the data
  // const outputTransformedData = Object.entries(claimAndSwapAssets)
  //   .map<Assets>(
  //     ([address, assetData]: [string, any]): Assets => ({
  //       id: address,
  //       tokenName: assetData.symbol || "",
  //       amount: assetData.amount || 0,
  //       dollarValue: assetData.dollarValue || 0,
  //       tick: assetData.amount > 0.1,
  //       percentage: ((assetData.dollarValue || 0) / totalDollarValue) * 100,
  //     }),
  //   )
  //   .filter((asset) => asset.tick); // Filter out assets below the threshold of 0.001 amount

  // Sort the data by dollar value in descending order
  const sortedData = outputTransformedData.sort(
    (a, b) => b.dollarValue - a.dollarValue,
  );

  return sortedData;
};

// check if transaction is already rejected

export const checkIfSigned = (
  pendingTransactions: any,
  activeAccount: Account | undefined,
) => {
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
export const checkIfRejected = (
  pendingTransactions: any,
  activeAccount: Account | undefined,
) => {
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
const ipfsIncentivesDataUrl = async () => {

    const pinata_file_name = "incentivesData.csv"
    const pinata_key = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5NzUxZWM0MS05ODhhLTQxNTctYThlMC1lNDJiOWRlODZkZDQiLCJlbWFpbCI6ImltaW1pbS5lbWFpbEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzhiNDQ1YWViOGZkMWU2MzZhZDMiLCJzY29wZWRLZXlTZWNyZXQiOiI4ZDkxYTNlYzE4N2QyYzIyYzc4YmMwODg2ZGYyYzA1ZmI3MzkyMjI1YjY0MTZkZTUyMTVkN2Q3OWEyYmMwMzFlIiwiaWF0IjoxNzE3NDUwODExfQ.qhehpv3kIjh8M5b0Yo9hBCpFu2fkMeGBbx0zNbDeFeY';
    const pinata_gateway = "https://gateway.pinata.cloud/ipfs/";

    const request_headers = {
        "Content-Type": "application/json",
        "Authorization": pinata_key
    };

    const find_file_string_1 = "https://api.pinata.cloud/data/pinList?includeCount=false&metadata[name]=";
    const find_file_string_2 = "&status=pinned&pageLimit=1";

    const find_file_url = find_file_string_1 + pinata_file_name + find_file_string_2;

    console.log("Looking up " + pinata_file_name + " file on pinata");

    try {
        const response = await axios.get(find_file_url, { headers: request_headers });
        const pinata = response.data;
        const fileHash = pinata.rows[0].ipfs_pin_hash;
        const ipfsUrl = pinata_gateway + fileHash;
        return ipfsUrl;
    } catch (error) {
        console.error("Error fetching file from Pinata:", error);
        throw error;
    }
}



async function fetchCsvData(url: string): Promise<any[]> {
  const response = await fetch(url);
  const csvText = await response.text();
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error)
    });
  });
}

function parseDate(dateString: string): Date {
  return new Date(dateString);
}

function calculateALCXAmount(data: any[], lastAMOClaimDate: Date): number {
  return data
    .filter(row => parseDate(row.date) > lastAMOClaimDate && row.token_symbol === 'ALCX')
    .reduce((total, row) => total + parseFloat(row.token_amount), 0);
}

export const fetchLastClaimedAmount = async (lastAMOClaimDateString: string = DEFAULT_LAST_CLAIM_DATE) => {
  const url = await ipfsIncentivesDataUrl()
  // const url = 'YOUR_CSV_URL';
    const lastAMOClaimDate = new Date(lastAMOClaimDateString)
  try {
    const csvData = await fetchCsvData(url);
    const totalALCXAmount = calculateALCXAmount(csvData, lastAMOClaimDate);
    console.log(`Total ALCX amount after the last AMO claim: ${totalALCXAmount}`);
    return totalALCXAmount
  } catch (error) {
    console.error('Error fetching or parsing CSV data:', error);
    return 0
  }
};

// check if completed required confirmations
export const checkIfConfirmed = (
  pendingTransactions: any,
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  let confirmed = false;
  const txnData = pendingTransactions?.pending;
  if (txnData) {
    const confirmations_given = txnData?.confirmations.length;
    const confirmations_required = txnData?.confirmationsRequired;
    console.log(confirmations_given);
    console.log(confirmations_required);
    confirmed = confirmations_given >= confirmations_required;
  }

  console.log("Confirmed", confirmed);

  setIsConfirmed(confirmed);
};
export function formatMoney(amount: number, currency: string = '$'): string {
  if (isNaN(amount)) {
      return '';
  }

  const absAmount = Math.abs(amount);
  let formatted = '';

  if (absAmount >= 1e9) {
      formatted = (amount / 1e9).toFixed(2) + 'B';
  } else if (absAmount >= 1e6) {
      formatted = (amount / 1e6).toFixed(2) + 'M';
  } else if (absAmount >= 1e3) {
      formatted = (amount / 1e3).toFixed(2) + 'K';
  } else {
      formatted = amount.toFixed(2);
  }

  return `${currency}${formatted}`;
}