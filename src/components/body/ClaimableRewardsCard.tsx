import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useState } from 'react';
import { Assets } from "@/Types";


const calculateTotalValue = (assets: Assets[]) => {
  return assets.reduce((total: number, asset: Assets) => {
    if (asset.tick) {
      return total + asset.amount;
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
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="w-[80px]"></TableHead> */}
                  <TableHead className="text-center">Claimable Tokens</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Amount($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items && items.map((asset: Assets, index: number) => (
                  <TableRow key={index} className="text-center">
                    {/* <TableCell className="font-medium">
                       <Checkbox
                            id={`asset-${index}`}
                            onCheckedChange={() => handleSelect(asset.id)}

                            />
                    </TableCell> */}
                    <TableCell className="font-medium ">{asset.tokenName}</TableCell>
                    <TableCell className="text-right">{asset.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${asset.dollarValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="absolute bottom-0  w-full flex justify-center align-bottom ">
            <Button className=" w-full cursor-auto pointer-events-none">
              Total Value:{" "}
              <span className="ml-5">${(totalValue ?? 0).toFixed(2)}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;