import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClaimableRewardsTable from "./ClaimableRewardsTable";

const assets = [
  {
    tokenName: "CRV",
    amount: "100",
  },
  {
    tokenName: "CVX",
    amount: "900",
  },
  {
    tokenName: "FXS",
    amount: "600",
  },
  {
    tokenName: "3CRV",
    amount: "500",
  },
];

function getTotalAssets(assets: any) {
    let totalAmount = 0;
    for (const asset of assets) {
      totalAmount += parseInt(asset.amount);
    }
    return totalAmount;
  }

const ClaimableRewardsCard = () => {
  return (
    <>
      <div className="claimableRewards m-5">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Claim Assets</CardTitle>
            <CardDescription>
              Assets available to claim from AMOS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimableRewardsTable toClaim={assets}/>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button>Total Value: {getTotalAssets(assets)}</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ClaimableRewardsCard;
