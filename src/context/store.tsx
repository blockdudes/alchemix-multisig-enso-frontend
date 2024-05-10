import { createContext, useContext, useEffect, useState } from "react";
import { JsonRpcSigner, ethers } from "ethers";
import anvil from "@/utils/anvil";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import {
  CHAIN_ID,
  OWNER1_ADDRESS,
  RPC_URL,
  SAFE_OWNER,
  SAFE_TRANSACTION_ORIGIN,
  multiSigAddress,
} from "@/lib/constants";
import SafeApiKit from "@safe-global/api-kit";
import { Assets, PendingTxData, TokenData } from "@/Types";
import {
  EndSimulation,
  buildClaimAndSwapTx,
  getPendingTransaction,
  reSimulateTx,
} from "@/utils/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  OperationType,
  SafeMultisigTransactionResponse,
  SafeTransaction,
} from "@safe-global/safe-core-sdk-types";

export const appState = createContext<any>(null);

const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSigner, setClientSigner] = useState<JsonRpcSigner | null>(null);
  const [rpcSigner, setRpcSigner] = useState<ethers.Wallet | null>(null);
  const [ethAdapter, setEthAdapter] = useState<EthersAdapter | null>(null);
  const [safe, setSafe] = useState<Safe | null>(null);
  const [safeApiKit, setSafeApiKit] = useState<SafeApiKit | null>(null);
  const dummyData = [
    {
      id: "0",
      tokenName: "USDC",
      amount: 0,
      tick: false,
      dollarValue: 0,
      percentage: 0,
    },
    // { id: "1" ,tokenName: 'USDC2', amount: 0, tick: false, dollarValue: 0 , percentage: 0},
    // { id: "2" ,tokenName: 'USDC3', amount: 0, tick: false, dollarValue: 0 , percentage: 0},
    // { token: 'USDC', balance: 0, selected: false, dollarValue: 0 },
    // { token: 'Btc in unisat', balance: 0, selected: false,dollarValue: 0 },
  ];
  const [outputAssets, setOutputAssets] = useState<Assets[]>(dummyData);

  const [transactionData, setTransactionData] = useState<any>(null);
  const [pendingTransactions, setPendingTransactions] = useState<any>(null);
  const [isFetchedData, setIsFetchedData] = useState<boolean>(false);
  const [isNewTransaction, setIsNewTransaction] = useState<boolean>(true);
  const { toast } = useToast();

  // button loading
  const [loadingState, setLoadingState] = useState({
    swap: false,
    sign: false,
    reject: false,
  });
  // useEffect(() => {}

  const setButtonLoading = (type: string, isLoading: boolean) =>
    setLoadingState((prev) => ({ ...prev, [type]: isLoading }));

  const fetchdata = async () => {
    setIsFetchedData(true);
    const pendingTX = await getPendingTransaction();
    console.log("---000000-----", pendingTX);
    pendingTX && setPendingTransactions(pendingTX);

    if (pendingTX && isNewTransaction) {
      try {
        console.log("enterr here");
        const multiSigAddress = "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9"; // todo: remove this
        const SAFE_OWNER = "0x5788F90196954A272347aEe78c3b3F86F548D0a9"; // todo: remove this
        const CHAIN_ID = "1";
        const txData = {
          chainId: CHAIN_ID,
          data: pendingTX?.pending?.data,
          from: multiSigAddress,
          to: pendingTX?.pending?.to,
          value: pendingTX?.pending?.value,
        };
        let endSimulation: EndSimulation = await reSimulateTx(
          CHAIN_ID,
          txData,
          multiSigAddress,
          SAFE_OWNER,
        );
        const multisigClaimAssetChanges = endSimulation.claim[multiSigAddress];
        const multisigClaimAndSwapAssetChanges =
          endSimulation.claimAndSwap[multiSigAddress];
        console.log(multisigClaimAssetChanges);
        console.log(multisigClaimAndSwapAssetChanges);
        const outputTx = {
          data: pendingTX?.pending?.data,
          to: pendingTX?.pending?.to,
          value: pendingTX?.pending?.value,
          assetChanges: {
            claim: multisigClaimAssetChanges,
            claimAndSwap: multisigClaimAndSwapAssetChanges,
          },
        };

        console.log("outputtx", outputTx);
        setTransactionData(outputTx);
      } catch (error) {
        toast({
          variant: "default",
          className: "bg-red-500 text-white",
          title: "Uh oh! Something went wrong.",
          description: (error as Error).message,
        });
        throw new Error("Error in fetching data");
      } finally {
        setIsFetchedData(false);
      }
    } else {
      try {
        const multiSigAddress = "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9"; // todo: remove this
        const SAFE_OWNER: string = "0x5788F90196954A272347aEe78c3b3F86F548D0a9"; // todo: remove this
        const CHAIN_ID: string = "1"; // todo: remove this
        const result = await buildClaimAndSwapTx(
          CHAIN_ID,
          multiSigAddress,
          SAFE_OWNER,
        );
        console.log(`ress`, result);
        setTransactionData(result);
      } catch (error) {
        console.log(error);
        toast({
          variant: "default",
          className: "bg-red-500 text-white",
          title: "Uh oh! Something went wrong.",
          description: (error as Error).message,
        });
        throw new Error("Error in fetching data");
      } finally {
        setIsFetchedData(false);
      }
    }
  };

  const simulateOutputAssets = async (outputAssets: Assets[]) => {};
  const handleConfirmTX = async (safeTxHash: string) => {
    try {
      const safeTransaction =
        safeApiKit && (await safeApiKit.getTransaction(safeTxHash));
      const executeTransaction =
        safe &&
        safeTransaction &&
        (await safe.executeTransaction(safeTransaction));
      const receipt = await executeTransaction?.transactionResponse?.wait();
      console.log(receipt);
      toast({
        variant: "default",
        className: "bg-green-500 text-white",
        title: "Success!",
        description: "Transaction Successfully Executed",
      });
    } catch (error) {
      console.log(error);
      toast({
        variant: "default",
        className: "bg-red-500 text-white",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
      });
      throw new Error("Error in confirming transaction");
    }
  };

  const handleSignTx = async (
    isRejected: boolean,
    pendingTxData?: PendingTxData,
    isNewTx: boolean = false,
  ) => {
    try {
      if (!isRejected && (pendingTransactions || isNewTx)) {
        if (pendingTxData === undefined && isNewTx) {
          if (!outputAssets.some((item) => item.tick)) {
            toast({
              variant: "default",
              className: "bg-red-500 text-white",
              title: "At least one item must be selected.",
            });
            throw new Error("Please select a desired output");
          }
          setButtonLoading("swap", true);
        } else {
          setButtonLoading("sign", true);
        }
      } else if (isRejected) {
        setButtonLoading("reject", true);
      } else {
        throw new Error("Invalid transaction state.");
      }

      let signTransaction:
        | SafeTransaction
        | SafeMultisigTransactionResponse
        | null = null;
      let isProposed = true;
      if (pendingTxData && pendingTxData.pending) {
        if (isRejected) {
          if (pendingTxData.rejected) {
            signTransaction = pendingTxData.rejected;
          } else {
            signTransaction =
              safe &&
              (await safe.createRejectionTransaction(
                pendingTxData.pending.nonce,
              ));
            isProposed = false;
          }
        } else {
          if (pendingTxData.pending) {
            signTransaction = pendingTxData.pending;
          }
        }
      } else if (isNewTx && transactionData) {
        // here
        const nextNonce = !isNewTransaction
          ? pendingTransactions && pendingTransactions.pending?.nonce
          : safeApiKit && (await safeApiKit.getNextNonce(multiSigAddress));

        console.log(
          nextNonce,
          pendingTransactions?.pending?.nonce,
          safeApiKit && (await safeApiKit.getNextNonce(multiSigAddress)),
        );

        signTransaction =
          safe &&
          (await safe.createTransaction({
            transactions: [
              {
                to: transactionData.to,
                value: transactionData.value,
                data: transactionData.data,
                operation: OperationType.DelegateCall, // required for security
              },
            ],
            options: {
              nonce: nextNonce,
            },
          }));
        isProposed = false;
      }

      if (signTransaction) {
        let safeTxHash = "";
        if ("safe" in signTransaction) {
          safeTxHash = (signTransaction as SafeMultisigTransactionResponse)
            .safeTxHash;
        } else {
          console.log("sdfsdf", signTransaction);
          safeTxHash =
            (safe &&
              (await safe.getTransactionHash(
                signTransaction as SafeTransaction,
              ))) ||
            "";
        }
        console.log(safeTxHash);

        safe &&
          ethAdapter &&
          (await safe.connect({
            ethAdapter: ethAdapter,
            safeAddress: multiSigAddress,
          }));
        const senderSignature = safe && (await safe.signHash(safeTxHash));

        senderSignature &&
          toast({
            variant: "default",
            title: "Transaction successfully signed.",
          });

        if (!isProposed) {
          let checksumMultiSigAddress = ethers.getAddress(multiSigAddress);

          safeApiKit &&
            clientSigner &&
            senderSignature &&
            (await safeApiKit.proposeTransaction({
              safeAddress: checksumMultiSigAddress,
              safeTransactionData: (signTransaction as SafeTransaction).data, // Fix: Convert expression to 'unknown' first before casting to SafeTransactionData
              safeTxHash,
              senderAddress: await clientSigner.getAddress(),
              senderSignature: senderSignature.data,
              origin: SAFE_TRANSACTION_ORIGIN,
            }));

          toast({
            variant: "default",
            title: "Success! Proposal created.",
          });
          // reload page after swap successfull
          window.location.reload();
        } else {
          safeApiKit &&
            senderSignature &&
            (await safeApiKit.confirmTransaction(
              safeTxHash,
              senderSignature.data,
            ));
        }
      } else {
        throw new Error("No transaction to sign");
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "default",
        className: "bg-red-500 text-white",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
      });
      throw error;
    } finally {
      setButtonLoading("sign", false);
      setButtonLoading("swap", false);
      setButtonLoading("reject", false);
    }
  };

  useEffect(() => {
    const initEthereum = async () => {
      if (!window.ethereum) {
        console.error("Ethereum provider (e.g., MetaMask) not found");
        return;
      }

      try {
        const injectedProvider = new ethers.BrowserProvider(window.ethereum);

        const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
        const injectedSigner = await injectedProvider.getSigner();
        const rpc_Signer = new ethers.Wallet(
          import.meta.env.VITE_SECRET_KEY,
          rpcProvider,
        );
        const ethAdapter = new EthersAdapter({
          ethers,
          signerOrProvider: injectedSigner,
        });
        const safeApiKit = new SafeApiKit({
          chainId: 11155111n, // Converted CHAIN_ID to a bigint
        });
        const _safe = await Safe.create({
          ethAdapter,
          safeAddress: multiSigAddress,
        });

        setClientSigner(injectedSigner);
        setRpcSigner(rpc_Signer);
        setEthAdapter(ethAdapter);
        setSafe(_safe);
        setSafeApiKit(safeApiKit);
      } catch (error) {
        throw error;
      }
    };

    initEthereum();
  }, []);

  return (
    <appState.Provider
      value={{
        safeApiKit,
        clientSigner,
        rpcSigner,
        ethAdapter,
        safe,
        outputAssets,
        setOutputAssets,
        transactionData,
        setTransactionData,
        pendingTransactions,
        setPendingTransactions,
        isFetchedData,
        setIsFetchedData,
        fetchdata,
        isNewTransaction,
        setIsNewTransaction,
        handleConfirmTX,
        handleSignTx,
        loadingState,
        setButtonLoading,
      }}
    >
      {children}
    </appState.Provider>
  );
};

export default GlobalStateProvider;
export const useEthereum = () => useContext(appState);
