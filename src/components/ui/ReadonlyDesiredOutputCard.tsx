import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "../ui/checkbox";

interface TokenData {
  token: string;
  balance: number;
  selected: boolean;
}

const ReadOnlyOutputCard: React.FC<{ tokenData: TokenData[] }> = ({ tokenData }) => {
  // Dummy data with predefined selection and balance percentages



  return (
    <>
      <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px]">
          <CardHeader>
            <CardTitle>Desired Output (Read-Only)</CardTitle>
            <CardDescription>
              View swap reward tokens allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div>
                  <div className="flex justify-between p-2 pl-12 text-slate-400 text-sm">
                    <div className="h-0 my-0 mx-0 border-0 opacity-0" />
                    <div className="table-cell">Swapable Token</div>
                    <div className="table-cell">Balance (%)</div>
                  </div>
                  <hr />
                  {tokenData.map((item :TokenData , index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 gap-4">
                      <div className="table-cell pt-4">
                        <Checkbox
                          id={`asset-${index}`}
                          checked={item.selected}
                          disabled
                        />
                      </div>
                      <div className="flex flex-col w-[60%] gap-2 pl-4">
                        <div className="table-cell">{item.token}</div>
                        <Slider
                          defaultValue={[item.balance]}
                          max={100}
                          min={0}
                          step={1}
                          value={[item.balance]}
                          disabled={true} // Slider is disabled in read-only mode
                        />
                      </div>
                      <div className="table-cell pt-4 w-24 text-right">{item.balance.toFixed(2)} %</div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center">
            <Button className="w-[200px]">Current Selected : <span className="ml-5">{tokenData.filter(item => item.selected).reduce((acc, item) => acc + item.balance, 0).toFixed(0)}</span></Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ReadOnlyOutputCard;
