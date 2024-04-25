import AuthenticationPage from "@/components/body/AuthenticationPage";
import ClaimableRewardsCard from "@/components/body/ClaimableRewardsCard";
import DesiredOutputCard from "@/components/body/DesiredOutputCard";
import Navbar from "@/components/header/Navbar";
import PremiumButton from "@/components/ui/PremiumButton";
import { buildClaimAndSwapTx, convertSimulationToAssetChanges, getEnsoWalletAddress, getPendingTransaction, reSimulateTx, simulateTx, usdcSwapData } from "@/utils/utils";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { OperationType, SafeMultisigTransactionResponse, SafeTransaction, SafeTransactionData } from "@safe-global/safe-core-sdk-types";
import { JsonRpcSigner, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { Transaction } from "./Transaction";
import ReadOnlyRewardsCard from "@/components/ui/ReadonlyRewardCard";
import ReadonlyDesiredOutputCard from "@/components/ui/ReadonlyDesiredOutputCard";
import { CHAIN_ID, OWNER1_ADDRESS, SAFE_OWNER, SAFE_TRANSACTION_ORIGIN, multiSigAddress } from "@/lib/constants";
import anvil from "@/utils/anvil";
import { generatePreValidatedSignature } from "@safe-global/protocol-kit/dist/src/utils";
import { useEthereum } from "@/context/store";
import SafeApiKit from "@safe-global/api-kit";
import Loader from "@/components/ui/Loader";
import { useActiveAccount } from "thirdweb/react";
import ErrorPage from "./ErrorPage";
import { getTheOwners } from "@/utils/helper";


interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
}

interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
  };
}

interface EnsoTx {
  data: string;
  to: string;
  value: string;
  assetChanges: {
    claim: AssetChanges;
    claimAndSwap: AssetChanges;
  };
}

// const AUTHORIZED_USERS = [
//   "0x5788f90196954a272347aee78c3b3f86f548d0a9",
//   "0xf920f2688719012b587afbdec27ec5029c18e875",
//   "0xb9f256128aef64459ce9558826f6466bc010b687",
//   "0xf872703f1c8f93fa186869bac83bac5a0c87c3c8",
//   "0xffaa3cda4f169d33291dd9ddbea8578d1398430e",
//   "0xacd8b7e9ac7a0900cb57007000302b3234e33a36",
//   // my address for testing
//   "0x37a1fb984316c971fec44c1b8e49be93d382d4b3",
// ];

const getOwners = async () => {
  const owners = await getTheOwners();
  return owners
}


export const MainPage = () => {

  const { clientSigner,safeApiKit, ethAdapter, safe }: { clientSigner: JsonRpcSigner, safeApiKit:SafeApiKit, ethAdapter: EthersAdapter, safe: Safe } = useEthereum();
  // const [transactionData, setTransactionData] = useState<EnsoTx | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [transactionQueue, setTransactionQueue] = useState<any>(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<any>(null);
  const walletConnectionStatus = useActiveWalletConnectionStatus();
  const activeAccount = useActiveAccount();

  const testAddress: String = "0x7962eBE98550d53A3608f9caADaCe72ef30De68C";


  useEffect(() => {
    getOwners().then(
      data => {
        setAuthorizedUsers([...data, testAddress.toLowerCase()]);
      }).catch(
        error => 
        console.error('Error:', error));
  }, []);

  const CVX_ADDRESS = "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b";
  const CRV_ADDRESS = "0xd533a949740bb3306d119cc777fa900ba034cd52";
  const FXS_ADDRESS = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
  
  const THREE_CRV_ADDRESS = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";




  const handleGetTransaction = async (safeTxHash: string) => {

    // const ethersProvider = new ethers.BrowserProvider(window.ethereum)
    // const signer = await ethersProvider.getSigner()

    // const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

    // const safeApiKit = new SafeApiKit({
    //   chainId: 11155111n
    // });

   try {
    const tx: SafeMultisigTransactionResponse = await safeApiKit.getTransaction(safeTxHash)
    return tx
   } catch (error) {
    throw error;
   }

  }

  const handleSwap = async () => {

    

    const data = await getPendingTransaction()
    console.log(data)
    if (data.count > 0) {
      throw new Error("There are pending transactions");
    }

    // const ethersProvider = new ethers.BrowserProvider(window.ethereum)
    // const signer = await ethersProvider.getSigner()

    let safeTransaction: SafeTransaction | null =
      (transactionData &&
        (await safe.createTransaction({
          transactions: [
            {
              to: transactionData.to,
              value: transactionData.value,
              data: transactionData.data,
              operation: OperationType.DelegateCall, // required for security
            },
          ],
        }))) || null;

    // const signer = await anvil.setup(1,OWNER1_ADDRESS)

    // const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

    // const safeApiKit = new SafeApiKit({
    //   chainId: 1n
    // });


    // const protocol = await Safe.create({ ethAdapter: ethAdapter, safeAddress: multiSigAddress });


    try {
      let safeTransaction: SafeTransaction | null = transactionData && await safe.createTransaction({
        transactions: [{
          to: transactionData.to,
          value: transactionData.value,
          data: transactionData.data,
          operation: OperationType.DelegateCall, // required for security
        }]
      }) || null;


      await safe.connect(
        { ethAdapter: ethAdapter, safeAddress: multiSigAddress }
      )

      if (safeTransaction) {

        const safeTxHash = await safe.getTransactionHash(safeTransaction)


        // Sign transaction to verify that the transaction is coming from owner 1
        // const senderSignature = await protocol.signHash(safeTxHash)
        const ownerSig = generatePreValidatedSignature(await clientSigner.getAddress());

        // safeTransaction.addSignature(ownerSig);

        let checksumMultiSigAddress = ethers.getAddress(multiSigAddress)

        const proposeTX = await safeApiKit.proposeTransaction({
          safeAddress: checksumMultiSigAddress,
          safeTransactionData: safeTransaction.data, // Fix: Convert expression to 'unknown' first before casting to SafeTransactionData
          safeTxHash,
          senderAddress: await clientSigner.getAddress(),
          senderSignature: ownerSig.data,
          origin: SAFE_TRANSACTION_ORIGIN
        })

        console.log(proposeTX)
      }
    } catch (error) {

      console.log(error)
      throw error
    }
  };

  const transformTransactionDataClaimAsset = (transactionData: any) => {
    const assets = [
      { id: 1, tokenName: "CRV", address: CRV_ADDRESS },
      { id: 2, tokenName: "CVX", address: CVX_ADDRESS },
      { id: 3, tokenName: "FXS", address: FXS_ADDRESS },
      { id: 4, tokenName: "3CRV", address: THREE_CRV_ADDRESS },
    ];

    return assets.map((asset) => {
      const assetData =
        transactionData && transactionData?.assetChanges.claim[asset.address];
      return {
        ...asset,
        amount: assetData ? assetData.amount : 0,
        tick: !!assetData,
      };
    });
  };

  const transformTransactionDataClaimAndSwapAsset = (transactionData: any) => {
    const claimAndSwapAssets = transactionData && transactionData?.assetChanges.claimAndSwap;
    const claimAndSwapTotal = claimAndSwapAssets && Object.values(claimAndSwapAssets).reduce((total: number, asset: any) => total + (asset.amount) as number, 0);


    const dummyData: TokenData[] = [
      { token: 'usdc', 
      balance: (typeof claimAndSwapTotal === 'number' ? claimAndSwapTotal : 0), 
      selected: true },
    ];

    return dummyData;

  }


  const fetchdata = async () => {

    try {
      const data = await getPendingTransaction()
      const filteredTransaction = data.results.filter(result => result.origin === SAFE_TRANSACTION_ORIGIN);
      const filteredData = { ...data, results: filteredTransaction };

      setTransactionQueue(filteredData)

      if (filteredData.count > 0) {
        // simulating pending transaction 

        const txToSimulate = await handleGetTransaction(filteredData.results[0].safeTxHash);


        const txData = {
          chainId: CHAIN_ID,
          data: txToSimulate?.data ,
          from: multiSigAddress,
          to: txToSimulate?.to ,
          value: txToSimulate?.value
        };


        let multisigAssetChanges = await reSimulateTx(
          CHAIN_ID,
          txData,
          multiSigAddress,
          SAFE_OWNER
        );


        const outputTx = {
          data: txToSimulate?.data,
          to: txToSimulate?.to,
          value: txToSimulate?.value,
          assetChanges: {
            claim: multisigAssetChanges,
          }
        }

        setTransactionData(outputTx);

      }
      else {
        try {
          const result = await buildClaimAndSwapTx(CHAIN_ID, multiSigAddress, SAFE_OWNER);
          console.log(result)
          setTransactionData(result);
          
        } catch (error) {
          console.log(error)
        }

      }

    } catch (error) {
      console.error(error);
    }
  };

  // console.log(transactionData)
  useEffect(() => {
    fetchdata();
  }, []);


  const sumClaimAndSwapAmount = transactionData ? Object.values(transactionData.assetChanges.claimAndSwap).reduce((sum, current: any) => sum + current.amount, 0) : 0;


  // const [metaData, setMetaData] = useState<{ [key: string]: MetadataItem[] }>({
  //   group1: [
  //     { key: "ALCX bribed since last claim", value: "4000 ALCX" },
  //     { key: "ALCX buyback target", value: "2000 ALCX" },
  //   ],
  //   group2: [
  //     { key: "Treasury stablecoin + ETH Balance", value: "4000 ALCX" },
  //     {
  //       key: ":",
  //       subValues: [
  //         { label: "Target Balance", value: "1.5M" },
  //         { label: "Funding Target", value: "35k" }
  //       ]
  //     }
  //   ],
  // });

  // Simulate data fetching and updating
  // useEffect(() => {
  //   const data = {
  //     "group1": [
  //       { "key": "ALCX bribed since last claim", "value": "4500 ALCX" },
  //       { "key": "ALCX buyback target", "value": "2500 ALCX" }
  //     ],
  //     "group2": [
  //       { "key": "Treasury stablecoin + ETH Balance", "value": "5000 ALCX" },
  //       { "key": ":", "value": "Target Balance: 1.6M, Funding Target: 40k" }
  //     ]
  //   }

  //   const fetchData = async () => {
  //     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating delay
  //     setMetaData({
  //       group1: data.group1.map(item => ({ key: item.key, value: item.value })),
  //       group2: data.group2.map(item => {
  //         // Check if the item has sub-values or a single value
  //         if (item.key === ":") {
  //           // Assuming the API sends the values as a single string
  //           return { key: item.key, value: item.value };
  //         } else {
  //           return { key: item.key, value: item.value };
  //         }
  //       })
  //     });
  //   };

  //   fetchData();
  // }, []);


  return (
    <>
    {
      walletConnectionStatus === "connected" ? (
        <>
        <Navbar />
        {
          authorizedUsers && authorizedUsers.includes(activeAccount?.address.toLowerCase()) ? (
            <>
            {
              transactionData ? (
                <>
                {
                  transactionQueue != null && transactionQueue?.count > 0 ? (
                    // false ? (
                    <>
                    <div className="flex flex-row gap-10 items-start justify-center px-4">
                      <ReadOnlyRewardsCard
                        assets={transformTransactionDataClaimAsset(transactionData)}
                      />
                      <ReadonlyDesiredOutputCard
                        tokenData={transformTransactionDataClaimAndSwapAsset(transactionData)}
                      />
                    </div>
                    <div className="border p-10 rounded">
                      <Transaction />
                    </div>
                    </>
                  ) : (
                    <>
                    <div className="flex flex-col ">
                      {/* <div className="flex flex-row gap-10 items-center justify-center ">
                      {Object.entries(metaData).map(([groupName, items], index) => (
                        <div key={index} className="m-5 flex flex-col gap-4 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                          {items.map((item, itemIndex) => (
                            <MetadataCard
                              key={itemIndex}
                              text={item.subValues ? `${item.key}: ${item.subValues.map(sub => `${sub.label} ${sub.value}`).join(', ')}` : `${item.key}: ${item.value}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div> */}
                      <div className="flex flex-row gap-10 items-start justify-center px-4">
                        <ClaimableRewardsCard
                          assets={transformTransactionDataClaimAsset(transactionData)}
                        />
                        <DesiredOutputCard
                          totalBalance={sumClaimAndSwapAmount as number}
                        />
                      </div>
                    </div>
                    <div className="flex justify-center py-4">
                      <PremiumButton
                        onClick={() => handleSwap()}
                        label="Swap"
                        disabled={transactionQueue?.count > 0 || true}
                      />
                    </div>
                    </>
                  )
                }
                </>
              ) : (
                <>
                <div>
                  <Loader />
                </div>
                </>
              )
            }
            </>
          ) : (
              <ErrorPage />
          )
        }
        </>
      ) : (
        <AuthenticationPage />
      )
    }
    </>
  );
}