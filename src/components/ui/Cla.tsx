// import { Assets } from "@/Types";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  // CardHeader,
  // CardTitle,
} from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { formatMoney } from "@/utils/utils";
// import { Checkbox } from "./checkbox";
// import { TokenData, Assets } from "@/Types";

const AboveData = ({treasuryBalance, lastClaim, lastClaimDate}: any) => {
  // Default totalValue for demonstration

  // const totalValue = assets.reduce(
  //   (total: number, item: Assets) =>
  //     item.tick ? total + item.dollarValue : total,
  //   0,
  // );
  // console.log(assets)
  console.log(lastClaimDate)
  const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });
  const lastClaimD = new Date(lastClaimDate)
const newDate = formatter.format(lastClaimD);

// parse date to DD-MM-YY
  // const newDate = lastClaimD.getDate() + '/' + (lastClaimD.getMonth() + 1) + '/' + lastClaimD.getFullYear();
  return (
    <>
      <div className="flex flex-row gap-10 items-start justify-center px-4">
        <div className="m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-lg p-2">
          <Card className="w-[400px] h-[175px]">
            {/* <CardHeader>
            <CardTitle>Claim Assets</CardTitle>
            <CardDescription>Assets available to claim</CardDescription>
          </CardHeader> */}
            <CardContent>
              <br />
              <div className="flex justify-between ">
                <div className="text-lg">ALCX BRIBED {lastClaimDate && `(${newDate})`}</div>
                <div className="text-lg font-bold">{formatMoney(lastClaim, '')} ALCX </div>
              </div>
              <br />
              <hr />
              <br />
              <div className="flex justify-between ">
                <div className="text-lg">ALCX BUYBACK TARGET</div>
                <div className="text-lg font-bold	">2000 ALCX </div>
              </div>

              <br />
            </CardContent>
          </Card>
        </div>
        <div className="m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-lg p-2">
          <Card className="w-[400px] h-[175px]">
            {/* <CardHeader>
            <CardTitle>Claim Assets</CardTitle>
            <CardDescription>Assets available to claim</CardDescription>
          </CardHeader> */}
            <CardContent>
              <br />
              <div className="flex justify-between ">
                <div className="text-lg">TREASURY BALANCE</div>
                <div className="text-lg font-bold">{formatMoney(treasuryBalance)}</div>
              </div>
              <br />
              <hr />
              <br />
             <>
             <div className="flex justify-between ">
                <div className="text-lg">TARGET BALANCE</div>
                <div className="text-lg font-bold	">$1.5M </div>
              </div>
              <div className="flex justify-between ">
                <div className="text-lg">FUNDING TARGET</div>
                <div className="text-lg font-bold	">$35K </div>
              </div>
             </>
         

              <br />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AboveData;
