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
import { ScrollArea } from "./scroll-area";
import { TokenData } from "@/Types";


const ReadOnlyOutputCard: React.FC<{ tokenData: TokenData[] }> = ({ tokenData }) => {


  const totalBalance: number = tokenData.filter(item => item.selected).reduce((acc: number, item: TokenData) => acc + item.dollarValue, 0)
  
  


  return (
    <>
      <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px] relative">
          <CardHeader>
            <CardTitle>Desired Output</CardTitle>
            <CardDescription>
              View swap reward tokens allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* <Table className=""> */}
              <TableHeader>

                <TableRow>
                  {/* <TableHead className="text-center w-[30px]"></TableHead> */}
                  <TableHead className="text-center w-[200px]">Token</TableHead>
                  {/* <TableHead className="text-right">Balance(%)</TableHead> */}
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-right">Value($)</TableHead>

                </TableRow>
              </TableHeader>
              {/* <TableBody className=""> */}
                <ScrollArea className="h-60 w-full  ">

                  {tokenData.map((item: TokenData, index: number) => (
                    <TableRow key={index} className="overflow-auto" >


                      {/* <TableCell className="font-medium text-start  w-[100px]" >
                        <Checkbox
                          id={`asset-${index}`}
                          checked={item.selected}
                          disabled
                          value={(item.balance / totalBalance * 100).toFixed(2)}
                        />
                      </TableCell> */}

                      <TableCell className="text-start">{item.token}</TableCell>
                      {/* <TableCell className="font-medium ">{(item.balance / (totalBalance == 0 ?  1: totalBalance) * 100).toFixed(2)}%</TableCell> */}
                      <TableCell className="font-medium ">{item.balance.toFixed(2)}</TableCell>
                      <TableCell className="font-medium ">${item.dollarValue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </ScrollArea>
              {/* </TableBody> */}
            {/* </Table> */}


          </CardContent>
          <CardFooter className="absolute bottom-10 w-full flex flex-col justify-center gap-1">
            <Button className="w-full text-center cursor-auto pointer-events-none">
              Converted: ${totalBalance.toFixed(2)}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ReadOnlyOutputCard;
