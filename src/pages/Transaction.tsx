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
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { getAllTransations, getPendingTransaction } from "@/utils/utils";
import { Navigate } from "react-router-dom";

interface TokenData {
    token: string;
    balance: number;
    selected: boolean;
  }
  
export const Transaction = () => {

    const walletStatus = useActiveWalletConnectionStatus();
    const [allTransactions, setAllTransactions] = useState(null);
    const [queuedTransactions, setQueuedTransactions] = useState(null);
  
    console.log(walletStatus)
    const getTx  = async () => {
      let alltransaction; 
      let queuedtransaction;
      try {
         alltransaction  = await getAllTransations();
         queuedtransaction  = await getPendingTransaction();
         console.log(alltransaction, queuedtransaction)
    
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } 
     
    }
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

    if (walletStatus !== 'connected') {
      console.log("check 2", useActiveWalletConnectionStatus())
      // Redirect to the Authentication page or another appropriate page
      return <Navigate to="/dashboard" replace />;
    }

  
    return (
      <>
        <Navbar />
        <Tabs defaultValue="pending" className="w-full flex flex-col justify-center items-center">
          <TabsList className="">
            <TabsTrigger value="pending" className="">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="w-[90%] mt-14">
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
                {transactionsData.map((transaction) => (
                  <TableRow key={transaction.id} className="w-full">
                    <TableCell className="w-[200px]">{transaction.id}</TableCell>
                    <TableCell className="font-medium">{transaction.proposedBy}</TableCell>
                    <TableCell>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1" className="flex flex-col justify-center items-center">
                          <AccordionTrigger>{transaction.signedCount}</AccordionTrigger>
                          <AccordionContent>
                            {transaction.details.map((detail, index) => (
                              <div key={index} className="flex gap-5 justify-between p-2 border-b border-gray-800">
                                <p>{detail.address}</p>
                                <Checkbox checked={detail.signed} disabled />
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
                                  <ReadonlyDesiredOutputCard tokenData={dummyData} />
                                  {/* <DesiredOutputCard totalBalance={1 || 0} /> */}
                                </div>
                              </div>
                              <div className="flex justify-center items-center gap-10 py-2">
                                <PremiumButton onClick={() => console.log("clicked")} label="Sign" />
                                <Button>Reject</Button>
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
          <TabsContent value="completed">Completed transactions.</TabsContent>
        </Tabs>
      </>
  
    )
  }
  