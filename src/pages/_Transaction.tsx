import Navbar from "@/components/header/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react";
import PremiumButton from "@/components/ui/PremiumButton";
import { Button } from "@/components/ui/button";
import ReadOnlyRewardsCard from "@/components/ui/ClaimableRewardsCard";
import ReadonlyDesiredOutputCard from "@/components/ui/ReadonlyDesiredOutputCard";
import { useActiveWalletConnectionStatus, useIsAutoConnecting } from "thirdweb/react";
import { buildClaimAndSwapTx, getAllTransations, getPendingTransaction } from "@/utils/utils";
import { Navigate } from "react-router-dom";
import { SafeMessageConfirmation } from "@safe-global/api-kit";
import { signTransaction } from "@/utils/helper";
import Safe, { EthersAdapter, SigningMethod } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import Modal from "@/components/ui/Modal";
import { multiSigAddress } from "@/lib/constants";

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

export const Transaction = ({ rawTX }: any) => {

  const walletStatus = useActiveWalletConnectionStatus();
  const [completedTransaction, setCompletedTransaction] = useState<any>([]);
  const [queuedTransactions, setQueuedTransactions] = useState<any>(null);
  const [rawTransactionData, setRawTransactionData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [nonce, setNonce] = useState<number>(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);



  const fetchdata = async () => {
    try {
      const result = await buildClaimAndSwapTx("1", multiSigAddress, "0x5788F90196954A272347aEe78c3b3F86F548D0a9");
      return result
    } catch (error) {
      console.error(error);
    }
  }


  const getTx = async () => {
    try {

      const queuedtransaction = await getPendingTransaction();
      const queuedMultisigTransaction = queuedtransaction.results.filter(item => item.isExecuted === false);
      setQueuedTransactions(queuedMultisigTransaction)
      
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }
  
  
  // const rawTransaction = await fetchdata();
  // setRawTransactionData(rawTransaction)

  useEffect(() => {
    getTx()
  }, []);


  const transactionsData = [
    {
      id: "0x8626f6940E2eb289",
      proposedBy: "0x8626f6940E",
      signedCount: "1/3",
      details: [
        { address: "0x8626f6940E", signed: true },
        { address: "0x9626234234E", signed: false },
        { address: "0x3506f901E", signed: true },
      ],
    },
    {
      id: "0x34b790e2d18b4788",
      proposedBy: "0x34b790e2d1",
      signedCount: "2/3",
      details: [
        { address: "0x8626f6940E", signed: true },
        { address: "0x9626234234E", signed: false },
        { address: "0x3506f901E", signed: true },
      ],
    },
  ];


  // Dummy data similar to the example you provided earlier
  const dummyAssets = [
    {
      id: 1,
      tokenName: "CRV",
      amount: 100,
      tick: true, // Showing as checked for example
    },
    {
      id: 2,
      tokenName: "CVX",
      amount: 900,
      tick: false,
    },
    {
      id: 3,
      tokenName: "FXS",
      amount: 600,
      tick: true, // Showing as checked for example
    },
    {
      id: 4,
      tokenName: "3CRV",
      amount: 500,
      tick: false,
    },
  ];

  const dummyData: TokenData[] = [
    { token: 'Eth in uniswap', balance: 20, selected: true },
    { token: 'Btc in unisat', balance: 30, selected: true },
    { token: 'Xrp in bitswap', balance: 0, selected: false },
    { token: 'Ltc in litepool', balance: 0, selected: false },
  ];


  const convertToSlice = (address: string) => {
    return address.slice(0, 5) + "..." + address.slice(address.length - 4, address.length);
  }


  const handleSignTx = async () => {
    const ethersProvider = new ethers.BrowserProvider(window.ethereum)
    const signer = await ethersProvider.getSigner()

    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

    // const protocol = new protocolKit();
    const protocol = await Safe.create({ ethAdapter: ethAdapter, safeAddress: "0xab850A24A158Db25a75376fDaa19ef1717cA5F88" });

    try {


      let transactionSafe1_1 = await protocol.createTransaction({
        transactions: [{
          to: rawTransactionData.to,
          value: rawTransactionData.value,
          data: rawTransactionData.data,
          operation: OperationType.DelegateCall, // required for security
        }]
      })



      await protocol.connect(
        { ethAdapter: ethAdapter, safeAddress: "0xab850A24A158Db25a75376fDaa19ef1717cA5F88" }
      )


      await protocol.signTransaction(transactionSafe1_1, SigningMethod.ETH_SIGN_TYPED_DATA_V4);

      const newPendingTransaction: any = await getPendingTransaction();

      if (newPendingTransaction.confirmationsRequired === newPendingTransaction.confirmations.length) {
        protocol.executeTransaction(transactionSafe1_1)
      }

    } catch (error) {
      console.log(error)
      throw error;
    }


  }

  
  const handleRejectTx = async (nonce: number) => {


    const ethersProvider = new ethers.BrowserProvider(window.ethereum)
    const signer = await ethersProvider.getSigner()

    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

    // const protocol = new protocolKit();
    try {
      const protocol = await Safe.create({ ethAdapter: ethAdapter, safeAddress: multiSigAddress });

      const reject_transasction = await protocol.createRejectionTransaction(nonce)

      await protocol.connect(
        { ethAdapter: ethAdapter, safeAddress: multiSigAddress }
      )


      await protocol.signTransaction(reject_transasction, SigningMethod.ETH_SIGN_TYPED_DATA_V4);

      const newPendingTransaction: any = await getPendingTransaction();

      if (newPendingTransaction.confirmationsRequired === newPendingTransaction.confirmations.length) {
        protocol.executeTransaction(reject_transasction)
      }

    } catch (error) {
      console.log(error)
      throw error;
    }


  }
  return (
    <>
      <Navbar />
      <Tabs defaultValue="pending" className="w-full flex flex-col justify-center items-center">
        <TabsList className="">
          <TabsTrigger value="pending" className="">Pending</TabsTrigger>
          {/* <TabsTrigger value="completed">Completed</TabsTrigger> */}
        </TabsList>
        <TabsContent value="completed" className="w-[90%] mt-14">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Target Id</TableHead>
                <TableHead>Proposed by</TableHead>
                <TableHead className="w-[400px] text-center">Signed by</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedTransaction?.map((transaction: any) => (
                <TableRow key={transaction.transactionHash?.slice(0, 3)} className="w-full">
                  <TableCell className="w-[200px]">{convertToSlice(transaction.transactionHash)}</TableCell>
                  <TableCell className="font-medium">{transaction.proposer}</TableCell>
                  <TableCell>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1" className="flex flex-col justify-center items-center">
                        <AccordionTrigger>{`${transaction.confirmationsRequired}/${transaction.confirmationsRequired}`}</AccordionTrigger>
                        <AccordionContent>
                          {transaction.confirmations.map((confirmation: SafeMessageConfirmation, index: number) => (
                            <div key={index} className="flex gap-5 justify-between p-2 border-b border-gray-800">
                              <div>{confirmation.owner}</div>
                              <Checkbox checked={confirmation.signature ? true : false} disabled />
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger className="border border-gray-700 p-2 hover:bg-neutral-900 hover:bg-opacity-50 rounded-md ">
                        View
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="w-[900px]">Details - {transaction.id}</DialogTitle>
                          <DialogDescription>
                            <div className="flex flex-col  pointer-events-none select-none">
                              <div className="flex flex-row gap-10 items-center justify-center ">
                                {/* <div className="m-5 flex flex-col gap-4 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                                    <MetadataCard text={metaData[0]} />
                                    <MetadataCard text={metaData[1]} />
                                  </div>
                                  <div className="m-5 flex flex-col gap-4 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                                    <MetadataCard text={metaData[2]} />
                                    <MetadataCard text={metaData[3]} />
                                  </div> */}
                              </div>
                              <div className="flex flex-row gap-10 items-start justify-center px-4">
                                <ReadOnlyRewardsCard assets={dummyAssets} />
                                {/* <ReadonlyDesiredOutputCard tokenData={dummyData} /> */}
                                {/* <DesiredOutputCard totalBalance={1 || 0} /> */}
                              </div>
                            </div>
                            <div className="flex justify-center items-center gap-10 py-2">
                              <PremiumButton onClick={() => handleSignTx()} label="Sign" />
                              <Button onClick={() => handleRejectTx(nonce)}>Reject</Button>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>



        <TabsContent value="pending" className="w-[90%] mt-14">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">safeTxHash</TableHead>
                <TableHead>Proposed by</TableHead>
                <TableHead className="w-[400px] text-center">Signed by</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queuedTransactions?.map((transaction: any) => (
                <TableRow key={transaction.transactionHash} className="w-full">
                  <TableCell className="w-[200px]">{convertToSlice(transaction.safeTxHash)}</TableCell>
                  <TableCell className="font-medium">{transaction.proposer}</TableCell>
                  <TableCell>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1" className="flex flex-col justify-center items-center">
                        <AccordionTrigger>{`${transaction.confirmations.length}/${transaction.confirmationsRequired}`}</AccordionTrigger>
                        <AccordionContent>
                          {transaction.confirmations.map((confirmation: SafeMessageConfirmation, index: number) => (
                            <div key={index} className="flex gap-5 justify-between p-2 border-b border-gray-800">
                              <div>{confirmation.owner}</div>
                              <Checkbox checked={confirmation.signature ? true : false} disabled />
                            </div>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                  <TableCell className="text-center" >
                    <Modal isOpen={isModalOpen} onClose={closeModal}>
                      <h2 className="text-black">Details - {transaction.id}</h2>
                      <div className="overflow-y-auto max-h-[90%]">
                        <div className="flex flex-col pointer-events-none select-none">
                          <div className="flex flex-row gap-10 items-start justify-center px-4">
                            <ReadOnlyRewardsCard assets={dummyAssets} />
                            <ReadonlyDesiredOutputCard tokenData={dummyData} />
                          </div>
                        </div>
                      </div>
                      <div className="sticky bottom-0 bg-black p-2">
                        <div className="flex justify-center items-center gap-10 py-2">
                          <PremiumButton onClick={() => console.log("clicked")} label="Sign" />
                          <Button onClick={closeModal}>Reject</Button>
                        </div>
                      </div>
                    </Modal>

                    <button onClick={openModal} className="border border-gray-700 p-2 hover:bg-neutral-900 hover:bg-opacity-50 rounded-md ">
                      View
                    </button>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </>

  )
}

