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


interface Asset {
  address: string;
  amount: number;
  id: number;
  tick: boolean;
  tokenName: string;
}

const calculateTotalValue = (assets: Asset[]) => {
  return assets.reduce((total: number, asset: Asset) => {
    if (asset.tick) {
      return total + asset.amount;
    } else {
      return total;
    }
  }, 0);
}

const ClaimableRewardsCard = ({ assets }: { assets: Asset[] }) => {


  useEffect(() => {
    setItems(assets);
    setTotalValue(calculateTotalValue(assets));
  }, [assets]);


  const [items, setItems] = useState(assets);
  const [totalValue, setTotalValue] = useState(calculateTotalValue(assets));

  // const handleSelect = (id: number) => {
  //   console.log('handleSelect called');
  //   setItems(items.map(item =>
  //     item.id===id ? {...item, tick:!item.tick} : item
  //     ));
  //   setTotalValue(items.reduce((total, item) =>
  //   item.id===id ? total + (item.tick ? -item.amount:item.amount): total,totalValue
  //   ));
  // };

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
                  <TableHead className="text-right">Balance($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items && items.map((asset: Asset, index: number) => (
                  <TableRow key={index} className="text-center">
                    {/* <TableCell className="font-medium">
                       <Checkbox
                            id={`asset-${index}`}
                            onCheckedChange={() => handleSelect(asset.id)}

                            />
                    </TableCell> */}
                    <TableCell className="font-medium ">{asset.tokenName}</TableCell>
                    <TableCell className="text-right">{asset.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="absolute bottom-0  w-full flex justify-center align-bottom ">
            <Button className="w-full hover:bg-white">
              Total Value:{" "}
              <span className="ml-5">{(totalValue ?? 0).toFixed(2)}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;