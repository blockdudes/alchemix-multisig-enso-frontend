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


const ClaimableRewardsCard = () => {
  const [items, setItems] = useState(assets);
  const [totalValue, setTotalValue] = useState(0);

  const handleSelect = (id) => {
    setItems(items.map(item =>
      item.id===id ? {...item, tick:!item.tick} : item
      ));
    setTotalValue(items.reduce((total, item) =>
    item.id===id ? total + (item.tick ? -item.amount:item.amount): total,totalValue
    ));
  };

  return (
    <>
      <div className="m-5">
        <Card className="w-[400px] h-[565px]">
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
                  <TableHead className="w-[80px]"></TableHead>
                  <TableHead>Claimable Tokens</TableHead>
                  <TableHead className="text-right">Balance($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <input
                        type="checkBox"
                        onChange={() => handleSelect(asset.id)}>
                      </input>
                      <label
                        htmlFor="asset"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      ></label>
                    </TableCell>
                    <TableCell className="font-medium">{asset.tokenName}</TableCell>
                    <TableCell className="text-right">{asset.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-center align-bottom">
            <Button className="w-[150px]">
              Total Value:{" "}
              <span className="ml-5">{totalValue}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;