// task simulate and show read file

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
import ReadOnlyRewardsCard from "@/components/ui/ReadonlyRewardCard";
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


export const convertToSlice = (address: string) => {
    return address?.slice(0, 5) + "..." + address?.slice(address.length - 4, address.length);
}


const TransactionTable = ({ transactions, isPending }: any) => {
    console.log(transactions)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


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

    return (

        <>
            {transactions && transactions?.map((transaction: any, index: number) => (
                <TableRow key={index} className="w-full">
                    <TableCell>{convertToSlice(transaction.safeTxHash)}</TableCell>
                    <TableCell>{transaction.proposer}</TableCell>
                    <TableCell className="text-">
                        <Accordion type="single" collapsible>
                            <AccordionItem value={`item-${index}`} className="flex flex-col justify-center items-center">
                                <AccordionTrigger>{`${transaction.confirmations.length}/${transaction.confirmationsRequired}`}</AccordionTrigger>
                                <AccordionContent>
                                    {transaction.confirmations.map((confirmation: SafeMessageConfirmation, idx: number) => (
                                        <div key={idx} className="flex gap-5 justify-between p-2 border-b border-gray-800">
                                            <div>{convertToSlice(confirmation.owner)}</div>
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
        </>

    );
};

export const Transaction = () => {

    const walletStatus = useActiveWalletConnectionStatus();
    const [completedTransaction, setCompletedTransaction] = useState<any>([]);
    const [queuedTransactions, setQueuedTransactions] = useState<any>(null);
    const [rawTransactionData, setRawTransactionData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    // const multiSigAddress = import.meta.env.VITE_MULTISIG_ADDRESS;




    const fetchdata = async () => {
        try {
            const result = await buildClaimAndSwapTx("1", multiSigAddress, "0x5788F90196954A272347aEe78c3b3F86F548D0a9");
            console.log("take",result)
            return result
        } catch (error) {
            console.error(error);
        }
    }


    const getTx = async () => {
        try {
            const queuedtransaction = await getPendingTransaction();
            const queuedMultisigTransaction = queuedtransaction.results.filter(item => item.isExecuted === false);
            console.log(queuedMultisigTransaction)
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



    const handleSignTx = async () => {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const signer = await ethersProvider.getSigner()

        const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer })

        // const protocol = new protocolKit();
        const protocol = await Safe.create({ ethAdapter: ethAdapter, safeAddress: multiSigAddress });

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
                { ethAdapter: ethAdapter, safeAddress: multiSigAddress }
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

    const handleRejectTx = async () => {

        let nonce = queuedTransactions[0].nonce;
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
            <Tabs defaultValue="pending" className="w-full flex flex-col justify-center items-center">
                <TabsList>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    {/* <TabsTrigger value="completed">Completed</TabsTrigger> */}
                </TabsList>
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
                        <TableBody className="w-full ">
                                <TransactionTable transactions={queuedTransactions} isPending={true} />

                        </TableBody>
                    </Table>

                </TabsContent>
                {/* <TabsContent value="completed" className="w-[90%] mt-14">
          <TransactionTable transactions={queuedTransactions} isPending={false} />
        </TabsContent> */}
            </Tabs>
        </>
    );

    
}

