import AuthenticationPage from "@/components/body/AuthenticationPage";
// import DesiredOutputCard from "@/components/body/DesiredOutputCard";
import DesiredOutputCard from "@/components/ui/DesiredOutputCard";
import Navbar from "@/components/header/Navbar";
import PremiumButton from "@/components/ui/PremiumButton";
import {
  checkIfConfirmed,
  checkIfRejected,
  checkIfSigned,
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
import ReadonlyDesiredOutputCard from "@/components/ui/ReadonlyDesiredOutputCard";
import anvil from "@/utils/anvil";
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
import { Assets, PendingTxData, TokenData } from "@/Types";
import { useToast } from "@/components/ui/use-toast";
import ChainAlert from "@/components/ui/Alert";



export const MainPage = () => {
  const {
    clientSigner,
    safeApiKit,
    ethAdapter,
    safe,
    desiredoutput,
    transactionData, setTransactionData, pendingTransactions, setPendingTransactions, isFetchedData, setIsFetchedData,
    fetchdata, isNewTransaction, setIsNewTransaction, handleConfirmTX,
    loadingState, setButtonLoading, handleSignTx
  }: {
    clientSigner: JsonRpcSigner;
    safeApiKit: SafeApiKit;
    ethAdapter: EthersAdapter;
    safe: Safe;
    desiredoutput: Assets[];
    transactionData: any
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
    handleSignTx: (isRejected: boolean, pendingTxData?: PendingTxData, isNewTx?: boolean) => Promise<void>;
  } = useEthereum();
  const activeAccount = useActiveAccount();


  const [isAuthorizedUser, setIsAuthorizedUser] = useState<boolean>(false);
  const [checkExecutable, setCheckExecutable] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [authorizedUsers, setAuthorizedUsers] = useState<any>(null);
  const walletConnectionStatus = useActiveWalletConnectionStatus();
  const { toast } = useToast();
  const chainID = useActiveWalletChain();


  const testOwner: String = "0x7962eBE98550d53A3608f9caADaCe72ef30De68C";
  const supportedChains = { 1: 'Ethereum', 11155111: 'Sepolia' };


  const isChainSupported = () => {
    return supportedChains.hasOwnProperty(chainID?.id ?? '');
  };

  useEffect(() => {
    try {
      safe
        .getOwners()
        .then((data) => {
          console.log(data);
          setAuthorizedUsers([...data, testOwner.toLowerCase()]);
        })
        .catch((error) => console.error("Error:", error));

      isExecutable();
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
    setCheckExecutable(nonce === ourNonce);
    //  return nonce === ourNonce
  };

  useEffect(() => {
    if (
      authorizedUsers && authorizedUsers.includes(activeAccount?.address.toLowerCase())
      // true
    ) {
      setIsAuthorizedUser(true);
      fetchdata()
      checkIfConfirmed(pendingTransactions, setIsConfirmed);
    }

  }, [isNewTransaction, activeAccount, authorizedUsers]);


  return (
    <>
      {walletConnectionStatus === "connected" ? (
        <>
          {!isChainSupported() && <ChainAlert />}
          <Navbar />
          {
            isAuthorizedUser ? (
              // true ? (
              authorizedUsers && authorizedUsers.includes(activeAccount?.address.toLowerCase()) ? (
                <>
                  {
                    // true ? (
                    (transactionData != null) ? (
                      <>
                        {(pendingTransactions != null && isNewTransaction) ? (
                          //  {/* { true ? ( */}
                          <>
                          <div className="flex flex-col gap-10">
                            <div className="flex flex-row gap-10 items-start justify-center px-4">
                              <ClaimableRewardsCard
                                assets={transformTransactionDataClaimAsset(
                                  transactionData
                                )}
                                />
                              <DesiredOutputCard
                                tokenData={transformTransactionDataClaimAndSwapAsset(transactionData)}
                                isEditable={false}
                                />
                              {/* <ReadonlyDesiredOutputCard
                              tokenData={transformTransactionDataClaimAndSwapAsset(
                                transactionData
                              )}
                            /> */}
                            </div>
                              <div className="flex flex-col justify-center items-center gap-2 my-2">
                                <div className="">{pendingTransactions.rejected && <p>{`Total confirmation on Rejcted TX  - ${pendingTransactions?.rejected?.confirmations?.length}/${pendingTransactions?.rejected?.confirmationsRequired}`}</p>}</div>
                                <div className="">{pendingTransactions.pending && <p>{`Total confirmation on Pending TX  - ${pendingTransactions?.pending?.confirmations?.length}/${pendingTransactions?.pending?.confirmationsRequired}`}</p>}</div>
                              </div>
                            </div>
                            <div className="w-full p-4 flex justify-center items-center gap-5">
                              {!isConfirmed ? (
                                <>
                                  <PremiumButton
                                    onClick={() =>
                                      handleSignTx(false, pendingTransactions)
                                    }
                                    hide={checkIfSigned(pendingTransactions, activeAccount)}
                                    label="Sign"
                                    loading={loadingState.sign}
                                  />
                                  <Button
                                    variant="destructive"
                                    hidden={checkIfRejected(pendingTransactions, activeAccount)}
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
                                          handleConfirmTX(pendingTransactions && pendingTransactions.pending?.safeTxHash as string)
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
                            <div className="flex flex-col ">
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
                                />
                              </div>
                            </div>
                            <div className="flex justify-center py-4">
                              <PremiumButton
                                onClick={() =>
                                  handleSignTx(false, undefined, true)
                                  // handleSwap()
                                }
                                label="Swap"
                                // disabled={transactionQueue?.count > 0 || true}
                                loading={loadingState.swap}
                              />
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      isFetchedData ? (
                        <div>
                          <Loader data="Fetching transaction data..." />
                        </div>
                      ) : <>
                        <ErrorCreateTxPage
                          errorTitle={"401: Unauthorized Access"}
                          errorDescription={"Only Alchemix Finance DevMultisig Owners are authorized."}
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
                  errorDescription={"Only Alchemix Finance DevMultisig Owners are authorized."}
                />
              )
            ) : (
              <Loader data="Authenticating..." />
            )
          }
        </>
      ) : (
        <AuthenticationPage />
      )}
    </>
  );
};
