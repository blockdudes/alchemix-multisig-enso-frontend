import Navbar from "./components/header/Navbar";
import DesiredOutputCard from "./components/body/DesiredOutputCard";
import ClaimableRewardsCard from "./components/body/ClaimableRewardsCard";
import MetadataCard from "./components/body/MetadataCard";
import { Button } from "./components/ui/button";
import AuthenticationPage from "./components/body/AuthenticationPage";
import { useActiveWalletConnectionStatus } from "thirdweb/react";
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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



interface BaseMetadata {
  key: string;
}

interface SingleValueMetadata extends BaseMetadata {
  value: string;
}

interface MultipleValueMetadata extends BaseMetadata {
  values: Array<{ label: string; value: string; }>;
}

interface MetadataItem {
  key: string;
  value?: string;
  subValues?: { label: string; value: string; }[];
}




import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PremiumButton from "./components/ui/PremiumButton";

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const walletStatus = useActiveWalletConnectionStatus();

  if (walletStatus !== 'connected') {
    // Redirect to the Authentication page or another appropriate page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const MainPage = () => {
  const [totalValue, setTotalValue] = useState(0);

  const [metaData, setMetaData] = useState<{ [key: string]: MetadataItem[] }>({
    group1: [
      { key: "ALCX bribed since last claim", value: "4000 ALCX" },
      { key: "ALCX buyback target", value: "2000 ALCX" },
    ],
    group2: [
      { key: "Treasury stablecoin + ETH Balance", value: "4000 ALCX" },
      {
        key: ":",
        subValues: [
          { label: "Target Balance", value: "1.5M" },
          { label: "Funding Target", value: "35k" }
        ]
      }
    ],
  });


  // Simulate data fetching and updating
  useEffect(() => {
    const data = {
      "group1": [
        { "key": "ALCX bribed since last claim", "value": "4500 ALCX" },
        { "key": "ALCX buyback target", "value": "2500 ALCX" }
      ],
      "group2": [
        { "key": "Treasury stablecoin + ETH Balance", "value": "5000 ALCX" },
        { "key": ":", "value": "Target Balance: 1.6M, Funding Target: 40k" }
      ]
    }
    
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating delay
      setMetaData({
        group1: data.group1.map(item => ({ key: item.key, value: item.value })),
        group2: data.group2.map(item => {
          // Check if the item has sub-values or a single value
          if (item.key === ":") {
            // Assuming the API sends the values as a single string
            return { key: item.key, value: item.value };
          } else {
            return { key: item.key, value: item.value };
          }
        })
      });
    };

    fetchData();
  }, []);

  return (
    <>
      {
        useActiveWalletConnectionStatus() === "connected" ? (
          <>
            <Navbar />
            <div className="flex flex-col ">
              <div className="flex flex-row gap-10 items-center justify-center ">
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
              </div>
              <div className="flex flex-row gap-10 items-start justify-center px-4">
                <ClaimableRewardsCard totalValue={totalValue} setTotalValue={setTotalValue} />
                <DesiredOutputCard totalBalance={totalValue || 0} />
              </div>
            </div>
            <div className="flex justify-center">
              <PremiumButton onClick={() => console.log("clicked")} label="Swap" />

            </div>
          </>
        ) : (
          <AuthenticationPage />
        )
      }
    </>
  )
}

const Transaction = () => {
  const transactionsData = [
    {
      id: "0x8626f6940E2eb289",
      proposedBy: "0x8626f6940E",
      signedCount: "1/3",
      details: [
        "Detail about transaction 1",
        "Another detail about transaction 1",
        "More details about transaction 1",
      ],
    },
    {
      id: "0x34b790e2d18b4788",
      proposedBy: "0x34b790e2d1",
      signedCount: "2/3",
      details: [
        "Detail about transaction 2",
        "Another detail about transaction 2",
        "More details about transaction 2",
      ],
    },
  ];

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
                <TableHead>Signed by</TableHead>
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
                            <p key={index}>{detail}</p>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger>View</DialogTrigger>
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
                                <ClaimableRewardsCard totalValue={1} setTotalValue={1} />
                                <DesiredOutputCard totalBalance={1 || 0} />
                              </div>
                            </div>
                            <div className="flex justify-center items-center gap-10">
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

const App = () => {
  const [totalValue, setTotalValue] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectToDashboard />} />
          <Route path="/dashboard" element={<MainPage />} />
          <Route path="/transaction" element={
            <ProtectedRoute>
              <Transaction />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
