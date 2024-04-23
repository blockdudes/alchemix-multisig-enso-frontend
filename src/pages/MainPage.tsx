import AuthenticationPage from "@/components/body/AuthenticationPage";
import ClaimableRewardsCard from "@/components/body/ClaimableRewardsCard";
import DesiredOutputCard from "@/components/body/DesiredOutputCard";
import Navbar from "@/components/header/Navbar";
import PremiumButton from "@/components/ui/PremiumButton";
import { buildClaimAndSwapTx } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useActiveWalletConnectionStatus } from "thirdweb/react";


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

export const MainPage = () => {
    const [transactionData, setTransactionData] = useState<EnsoTx | null>(null);
  
  
  
    const fetchdata = async () => {
      try {
        console.log("fetching")
        const result = await buildClaimAndSwapTx("1", "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9", "0x5788F90196954A272347aEe78c3b3F86F548D0a9");
        setTransactionData(result);
      } catch (error) {
        console.error(error);
      }
    }
  
    useEffect(() => {
      fetchdata()
    }, []);
  
    const sumClaimAmount = transactionData ? Object.values(transactionData.assetChanges.claim).reduce((sum, current) => sum + current.amount, 0) : 0;
    const sumClaimAndSwapAmount = transactionData ? Object.values(transactionData.assetChanges.claimAndSwap).reduce((sum, current) => sum + current.amount, 0) : 0;
  
  
  
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
          useActiveWalletConnectionStatus() === "connected" ? (
            <>
              <Navbar />
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
                  <ClaimableRewardsCard totalValue={sumClaimAmount} />
                  <DesiredOutputCard totalBalance={sumClaimAndSwapAmount} />
                </div>
              </div>
              <div className="flex justify-center py-4">
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