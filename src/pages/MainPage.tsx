import AuthenticationPage from "@/components/body/AuthenticationPage";
// import DesiredOutputCard from "@/components/body/DesiredOutputCard";
import DesiredOutputCard from "@/components/ui/DesiredOutputCard";
import Navbar from "@/components/header/Navbar";
import PremiumButton from "@/components/ui/PremiumButton";
import {
  buildClaimAndSwapTx,
  checkIfConfirmed,
  checkIfRejected,
  checkIfSigned,
  fetchLastClaimedAmount,
  getLatestExecutionDate,
  transformTransactionDataClaimAndSwapAsset,
  transformTransactionDataClaimAsset,
} from "@/utils/utils";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { JsonRpcSigner } from "ethers";
import { useEffect, useState } from "react";
import {
  useActiveAccount,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
} from "thirdweb/react";
import ClaimableRewardsCard from "@/components/ui/ClaimableRewardsCard";
import { useEthereum } from "@/context/store";
import SafeApiKit from "@safe-global/api-kit";
import Loader from "@/components/ui/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThreeDots } from "react-loader-spinner";
import { ErrorCreateTxPage } from "./ErrorPage";

import ErrorPage from "./ErrorPage";
import { Button } from "@/components/ui/button";
import { Assets, EnsoTx, PendingTxData } from "@/Types";
import { useToast } from "@/components/ui/use-toast";
import ChainAlert from "@/components/ui/Alert";
import { OWNER1_ADDRESS, multiSigAddress } from "@/lib/constants";
import { ReloadIcon } from "@radix-ui/react-icons";
import SwapVisualizationDialog from "@/components/ui/SwapVisualizationDialog";
import AboveData from "@/components/ui/Cla";

import useSWRImmutable from 'swr';


// const fetcher = (url: string) => fetch(url).then((res) => res.json());
const zeriorFetcher = async () => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: 'Basic emtfZGV2XzFlNTVmNTU3ZmM4YjRkMzhiZGUwZTI5YjE3MzRmYmYxOg=='
    }
  };
  // let data = ""
  // fetch('https://api.zerion.io/v1/wallets/0x42b9df65b219b3dd36ff330a4dd8f327a6ada990/positions/?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value', options)

  const res = await fetch('https://api.zerion.io/v1/wallets/0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9/positions/?filter[positions]=no_filter&currency=usd&filter[trash]=only_non_trash&sort=value', options);
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await res.json();
  const positions = data?.data ?? []
  return positions.reduce((acc: any, position: any) => acc + position.attributes.value, 0);
//  await fetch('https://api.zerion.io/v1/wallets/0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9/positions/', options)
//     .then(response => response.json())
//     .then(response => {
//       data = response
//     })
//     .catch(err => console.error(err));
//     return data
}
export const MainPage = () => {
  const {
    // clientSigner,
    // safeApiKit,
    // ethAdapter,
    safe,
    outputAssets,
    setOutputAssets,
    transactionData,
    setTransactionData,
    pendingTransactions,
    // setPendingTransactions,
    isFetchedData,
    setIsFetchedData,
    fetchdata,
    isNewTransaction,
    setIsNewTransaction,
    handleConfirmTX,
    loadingState,
    handleSignTx,
    slippage,
  }: {
    clientSigner: JsonRpcSigner;
    safeApiKit: SafeApiKit;
    ethAdapter: EthersAdapter;
    safe: Safe;
    outputAssets: Assets[];
    setOutputAssets: React.Dispatch<React.SetStateAction<Assets[]>>;
    desiredoutput: Assets[];
    transactionData: any;
    setTransactionData: any;
    pendingTransactions: PendingTxData;
    setPendingTransactions: React.Dispatch<React.SetStateAction<PendingTxData>>;
    isFetchedData: boolean;
    setIsFetchedData: React.Dispatch<React.SetStateAction<boolean>>;
    fetchdata: () => Promise<void>;
    isNewTransaction: boolean;
    setIsNewTransaction: React.Dispatch<React.SetStateAction<boolean>>;
    handleConfirmTX: (safeTxHash: string) => Promise<void>;
    loadingState: {
      swap: boolean;
      sign: boolean;
      reject: boolean;
    };
    setButtonLoading: (type: string, isLoading: boolean) => void;
    handleSignTx: (
      isRejected: boolean,
      pendingTxData?: PendingTxData,
      isNewTx?: boolean
    ) => Promise<void>;
    slippage: number;
  } = useEthereum();
  const activeAccount = useActiveAccount();

  const [needSimulation, setNeedSimulation] = useState<boolean>(true);

  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(false);
  const [checkExecutable, setCheckExecutable] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [authorizedUsers, setAuthorizedUsers] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<any>(null);
  const walletConnectionStatus = useActiveWalletConnectionStatus();

  console.log(walletConnectionStatus);
  const { toast } = useToast();
  const chainID = useActiveWalletChain();

  const testOwner: String = "0xddf809c183EA9e5a268fFfEe5a6C26fc6e2fc525";
  // const supportedChains = { 11155111: "Sepolia" };
  const supportedChains = { 1: 'Ethereum'};

  const isChainSupported = () => {
    return supportedChains.hasOwnProperty(chainID?.id ?? "");
  };

  const { data: multisigBalance  } = useSWRImmutable('multisigBalance',zeriorFetcher,
   {
    // refreshInterval: 100000000 
    refreshInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    dedupeInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    revalidateOnMount: false,
    revalidateOnReconnect: false
  }
);

  const { data: lastExecutionDate  } = useSWRImmutable('fetchlastexecutiondate',getLatestExecutionDate,
   {
    refreshInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    dedupeInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    revalidateOnMount: false,
    revalidateOnReconnect: false
  }
);
const { data: lastClaimedData  } = useSWRImmutable('fetchlastclaim',()=> fetchLastClaimedAmount(lastExecutionDate),
   {
    // refreshInterval: 30 * 60 * 1000, // 30 minutes in milliseconds
    refreshInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    dedupeInterval: 1 * 60 * 1000, // 30 minutes in milliseconds
    revalidateOnMount: false,
    revalidateOnReconnect: false

    // dedupeInterval: 30 * 60 * 1000, // 30 minutes in milliseconds
  }
);

  const handleSimulate = async (
    chainId: string,
    safeAddress: string,
    safeOwner: string,
    simulateClaimAndSwapBoth: boolean = false
  ) => {
    //build transaction
    safeAddress = "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9"; // todo: remove this
    safeOwner = "0x5788F90196954A272347aEe78c3b3F86F548D0a9"; // todo: remove this
    chainId = "1"; // todo: remove this

    setIsSimulating(true);
    try {
      const result: EnsoTx = await buildClaimAndSwapTx(
        chainId,
        safeAddress,
        safeOwner,
        simulateClaimAndSwapBoth,
        outputAssets,
        slippage
      );

      const simulatedData = transformTransactionDataClaimAndSwapAsset(result);
      setTransactionData(result);
      setOutputAssets(simulatedData);
      setNeedSimulation(false);
      console.log(result);
    } catch (error) {
      toast({
        variant: "default",
        className: "bg-red-500 text-white",
        title: "Error in simulating Tx.",
      });
      throw new Error("Error in simulating");
    } finally {
      setIsSimulating(false);
    }
    //set output data
  };

  useEffect(() => {
    try {
      safe
        .getOwners()
        .then((data) => {
          console.log(data);
          console.log(activeAccount?.address)
          setAuthorizedUsers([...data, testOwner.toLowerCase()]);
        })
        .catch((error) => console.error("Error:", error));
    } catch (error) {
      toast({
        title: error as string,
      });
      console.log(error);
    }
  }, [safe]);
  const isExecutable = async () => {
    const nonce = await safe.getNonce();
    const ourNonce = pendingTransactions && pendingTransactions.pending?.nonce;
    console.log(nonce, ourNonce);
    setCheckExecutable(nonce === ourNonce);
    //  return nonce === ourNonce
  };
  useEffect(() => {
    checkIfConfirmed(pendingTransactions, setIsConfirmed);

    isExecutable();

    // return () => {
    //   second
    // }
  }, [pendingTransactions]);

  useEffect(() => {
    console.log("fetchdatadtesxx");
    if (
      authorizedUsers &&
      authorizedUsers.includes(activeAccount?.address)
      // true
    ) {
      console.log(activeAccount?.address);
      setIsAuthorizedUser(true);
      fetchdata();
    }

    console.log(
      pendingTransactions,
      pendingTransactions != null,
      isNewTransaction
    );
  }, [isNewTransaction, activeAccount, authorizedUsers]);

  // if (walletConnectionStatus == "connecting")
  //   return <Loader data="Authenticating..." isChainSupported={isChainSupported()} />;

  if (walletConnectionStatus == "connected" || walletConnectionStatus == "connecting")
    return (
      <>
        <Navbar />
        {!isChainSupported() && <ChainAlert />}

        {walletConnectionStatus == "connecting" && <Loader data="Authenticating..."/>}
        {walletConnectionStatus === "connected" &&
        authorizedUsers &&
        authorizedUsers.includes(activeAccount?.address) ? (
          <>
            {
              // authorizedUsers && authorizedUsers.includes(activeAccount?.address.toLowerCase()) ? (
              isAuthorizedUser ? (
                <>
                  {
                    // true ? (
                    transactionData != null ? (
                      <>
                        {pendingTransactions != null && isNewTransaction ? (
                          <>
                            <div className="flex flex-col gap-10">
                              <div className="flex flex-row gap-10 items-start justify-center px-4">
                                <ClaimableRewardsCard
                                  assets={transformTransactionDataClaimAsset(
                                    transactionData
                                  )}
                                />
                                <DesiredOutputCard
                                  tokenData={transformTransactionDataClaimAndSwapAsset(
                                    transactionData
                                  )}
                                  isEditable={false}
                                />
                                {/* <ReadonlyDesiredOutputCard
                            tokenData={transformTransactionDataClaimAndSwapAsset(
                              transactionData
                            )}
                          /> */}
                              </div>
                              <div className="flex flex-col justify-center items-center gap-2 my-2">
                                <div className="">
                                  {pendingTransactions?.rejected && (
                                    <p>{`Rejected  - ${pendingTransactions?.rejected?.confirmations?.length}/${pendingTransactions?.rejected?.confirmationsRequired}`}</p>
                                  )}
                                </div>
                                <div className="">
                                  {pendingTransactions?.pending && (
                                    <p>{`Confirmations  - ${pendingTransactions?.pending?.confirmations?.length}/${pendingTransactions?.pending?.confirmationsRequired}`}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-full p-4 flex justify-center items-center gap-5">
                              {!isConfirmed ? (
                                <>
                                  <PremiumButton
                                    onClick={() =>
                                      handleSignTx(false, pendingTransactions)
                                    }
                                    hide={checkIfSigned(
                                      pendingTransactions,
                                      activeAccount
                                    )}
                                    label="Sign"
                                    loading={loadingState.sign}
                                  />
                                  <Button
                                    variant="destructive"
                                    hidden={checkIfRejected(
                                      pendingTransactions,
                                      activeAccount
                                    )}
                                    onClick={() =>
                                      handleSignTx(true, pendingTransactions)
                                    }
                                  >
                                    {loadingState.reject ? (
                                      <>
                                        <ThreeDots
                                          visible={true}
                                          height="20"
                                          width="20"
                                          color="#000000"
                                          radius="9"
                                          ariaLabel="three-dots-loading"
                                          wrapperStyle={{}}
                                          wrapperClass=""
                                        />
                                      </>
                                    ) : (
                                      <>Reject</>
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <TooltipProvider delayDuration={10}>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <PremiumButton
                                        onClick={() =>
                                          handleConfirmTX(
                                            pendingTransactions &&
                                              (pendingTransactions.pending
                                                ?.safeTxHash as string)
                                          )
                                        }
                                        label="Confirm"
                                        disabled={!checkExecutable}
                                        // loading={}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {!checkExecutable &&
                                        "Execute tx with lowest nonce first"}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                                {/* <div>
                                 <div
                                    className={`flex flex-row mt-1 gap-2 items-right justify-end`}
                                  >
                              
                                  </div>
                                </div> */}

                            <div className="flex flex-col ">
                              <AboveData treasuryBalance={multisigBalance} lastClaim={lastClaimedData} lastClaimDate={lastExecutionDate}/>
                         
                              <div className="flex flex-row gap-10 items-start justify-center px-4">
                              
                                <ClaimableRewardsCard
                                  assets={transformTransactionDataClaimAsset(
                                    transactionData
                                  )}
                                />
                                <DesiredOutputCard
                                  tokenData={transformTransactionDataClaimAsset(
                                    transactionData
                                  )}
                                  isEditable={true}
                                  needSimulation={needSimulation}
                                  setNeedSimulation={setNeedSimulation}
                                />
                              </div>
                            </div>
                            <div className="flex justify-center items-center py-4 gap-4">
                              {needSimulation ? (
                                <Button
                                disabled={isSimulating}
                                  onClick={() =>
                                    handleSimulate(
                                      "1",
                                      multiSigAddress,
                                      OWNER1_ADDRESS,
                                      true
                                    )
                                  }
                                >
                                  {isSimulating ? (
                                    <>
                                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                      Please wait
                                    </>
                                  ) : (
                                    "Simulate"
                                  )}
                                </Button>
                              ) : (
                                <>
                                <PremiumButton
                                  onClick={() =>
                                    handleSignTx(false, undefined, true)
                                  }
                                  label="Swap"
                                  // disabled={transactionQueue?.count > 0 || true}
                                  loading={loadingState.swap}
                                />
                                <SwapVisualizationDialog src={transactionData.image}/>
                               
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    ) : isFetchedData ? (
                      <div>
                        <Loader data="Fetching transaction data..." />
                      </div>
                    ) : (
                      <>
                        <ErrorCreateTxPage
                          errorTitle={"Failed Tx"}
                          errorDescription={
                            "Failed Simulating the Old Pending tx, please create new replacement tx"
                          }
                          setter={setIsNewTransaction}
                          loader={setIsFetchedData}
                        />
                      </>
                    )
                  }
                </>
              ) : (
                <ErrorPage
                  errorTitle={"401: Unauthorized Access"}
                  errorDescription={
                    "Only Alchemix Finance DevMultisig Owners are authorized."
                  }
                />
              )
            }
          </>
        ) : (
          <Loader data="Authenticating..." />
        )}
      </>
    );
  if (walletConnectionStatus == "disconnected") return <AuthenticationPage />;
};
