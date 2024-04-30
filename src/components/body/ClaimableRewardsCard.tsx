import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from 'react';
import { Assets } from "@/Types";
import { ScrollArea } from "../ui/scroll-area";



const calculateTotalValue = (assets: Assets[]) => {
  return assets.reduce((total: number, asset: Assets) => {
    if (asset.tick) {
      return total + asset.dollarValue;
    } else {
      return total;
    }
  }, 0);
}

const ClaimableRewardsCard = ({ assets }: { assets: Assets[] }) => {


  useEffect(() => {
    setItems(assets);
    setTotalValue(calculateTotalValue(assets));
  }, [assets]);


  const [items, setItems] = useState(assets);
  const [totalValue, setTotalValue] = useState(calculateTotalValue(assets));


  return (
    <>
      <div className="m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px] relative">
          <CardHeader>
            <CardTitle>Claim Assets</CardTitle>
            <CardDescription>
              Assets available to claim from AMOS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form >
                <div className="w-full items-center gap-4">
                <div>
                  <div className="flex justify-between p-2 pl-12 text-slate-400 text-sm  ">
                    <div className="table-cell text-start">Token</div>
                    <div className="table-cell text-start">Balance</div>
                    <div className="table-cell text-start">Amount($)</div>
                  </div>
                  <hr />
                  <ScrollArea className="h-60 w-full scroll-px-py">
                  {items && items.map((item:Assets , index: number) => {
                    return (
                      <div key={index} className="flex justify-between items-center p-2 gap-4 ml-8">
                     
                     <div className="table-cell ">{item.tokenName}</div>
                     <div className="table-cell ">{item.amount.toFixed(2)}</div>
                     <div className="table-cell ">${item.dollarValue.toFixed(2)}</div>
                     
                     {/* <div className="table-cell pt-4 w-24 text-right">{totalBalance ? (item.balance / (totalBalance ?? 1) * 100).toFixed(2) : 0 } %</div> */}

                   </div>
                    )
                  })}
                  </ScrollArea>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="absolute bottom-0  w-full flex justify-center align-bottom border ">
            <Button className=" w-full cursor-auto pointer-events-none">
              Total Value:{" "}
              <span className="ml-5">${(totalValue).toFixed(2)}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;