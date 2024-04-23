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
import { useState } from 'react';

const assets = [
  {
    id: 1,
    tokenName: "CRV",
    amount: 100,
    tick: false,
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
    tick: false,
  },
  {
    id: 4,
    tokenName: "3CRV",
    amount: 500,
    tick: false,
  },
];


const ClaimableRewardsCard = ({totalValue}: any) => {

  const [items, setItems] = useState(assets);
  
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
                  {/* <TableHead className="text-right">Balance($)</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset: any, index) => (
                  <TableRow key={index} className="text-center">
                    {/* <TableCell className="font-medium">
                       <Checkbox
                            id={`asset-${index}`}
                            onCheckedChange={() => handleSelect(asset.id)}

                            />
                    </TableCell> */}
                    <TableCell className="font-medium ">{asset.tokenName}</TableCell>
                    {/* <TableCell className="text-right">{asset.amount}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="absolute bottom-0  w-full flex justify-center align-bottom">
            <Button className="w-full">
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