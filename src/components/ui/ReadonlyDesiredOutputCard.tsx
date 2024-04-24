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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "../ui/checkbox";

interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
}

const ReadOnlyOutputCard: React.FC<{ tokenData: TokenData[] }> = ({ tokenData }) => {

  console.log(tokenData)

  const totalBalance: number = tokenData.filter(item => item.selected).reduce((acc: number, item: TokenData) => acc + item.balance, 0)
  return (
    <>
      <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px] relative">
          <CardHeader>
            <CardTitle>Desired Output (Read-Only)</CardTitle>
            <CardDescription>
              View swap reward tokens allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>

                <TableRow>
                  <TableHead className="text-center w-[30px]"></TableHead>
                  <TableHead className="text-left w-[200px]">Swapable Token</TableHead>
                  <TableHead className="text-right">Balance(%)</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenData.map((item: TokenData, index: number) => (
                  <TableRow key={index} >


                    <TableCell className="font-medium text-start  w-[100px]" >
                      <Checkbox
                        id={`asset-${index}`}
                        checked={item.selected}
                        disabled
                        value={(item.balance / totalBalance * 100).toFixed(2)}
                        />
                    </TableCell>

                      <TableCell className="text-start">{item.token}</TableCell>
                    <TableCell className="font-medium ">{(item.balance / totalBalance * 100).toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            

          </CardContent>
          <CardFooter className="absolute bottom-10 w-full flex flex-col justify-center gap-1">
            <Button className="w-full text-center">
              Current Selected: {totalBalance.toFixed(2)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ReadOnlyOutputCard;
