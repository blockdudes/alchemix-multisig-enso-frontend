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
import { Checkbox } from "./checkbox";
import { TokenData, Assets } from "@/Types";


const ClaimableRewardsCard = ({ assets }: any) => {
  // Default totalValue for demonstration

  const totalValue = assets.reduce(
    (total: number, item: Assets) => item.tick ? total + item.dollarValue : total, 0);

  return (
    <>
      <div className="m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px]">
          <CardHeader>
            <CardTitle>Claim Assets</CardTitle>
            <CardDescription>
              Assets available to claim 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* <TableHead className="w-[80px]"></TableHead> */}
                  <TableHead className="text-center">Claimable Tokens</TableHead>
                  <TableHead className="text-center">Balance</TableHead>
                  <TableHead className="text-center">Amount($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset: Assets, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-center">{asset.tokenName}</TableCell>
                    <TableCell className="text-center">{asset.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center">${asset.dollarValue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="absolute bottom-3 left-0 w-full flex flex-col justify-center gap-1 ">
          <Button className="w-full text-center cursor-auto pointer-events-none">
              Total Value: <span className="ml-5">${totalValue.toFixed(2)}</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;
