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
import { useState } from "react";


interface TokenData {
  token: string;
  balance: number; // This will now store the percentage
  selected: boolean;
}

interface DesiredOutputCardProps {
  totalBalance?: number;
}

const DesiredOutputCard: React.FC<DesiredOutputCardProps> = ({ totalBalance }) => {

  const [totalUsed, setTotalUsed] = useState(0);
  const [data, setData] = useState([
    { token: 'Eth in uniswap', balance: 0, selected: false },
    { token: 'Btc in unisat', balance: 0, selected: false },
    { token: 'Eth in uniswap', balance: 0, selected: false },
    { token: 'Btc in unisat', balance: 0, selected: false },
  ]);

  const updateTotalUsed = () => {
    const total = data.reduce((prev, cur) => prev + cur.balance, 0);
    setTotalUsed(total);
  }


  const toggleSelected = (index: number) => {
    const newData = [...data];
    const isSelectedNow = !newData[index].selected;

    newData[index].selected = isSelectedNow;
    if (isSelectedNow) {
        // Calculate the new percentage if this token is now selected
        const selectedItemsCount = newData.filter(item => item.selected).length;
        const newPercentage = 100 / selectedItemsCount;
        newData.forEach((item, idx) => {
            if (item.selected) {
                item.balance = (newPercentage / 100) * (totalBalance || 1);
            }
        });
    } else {
        // Redistribute the balance among the remaining selected items
        const selectedItems = newData.filter(item => item.selected);
        const newPercentage = selectedItems.length > 0 ? 100 / selectedItems.length : 0;
        selectedItems.forEach(item => {
            item.balance = (newPercentage / 100) * (totalBalance || 1);
        });
    }

    setData(newData);
    updateTotalUsed();
};



const handleSliderChange = (index : number, newPercentage : number) => {
  const newData = [...data];
  newData[index].balance = (newPercentage / 100) * (totalBalance || 1);

  const totalSelectedPercentage = newData.reduce((acc, item) => item.selected ? acc + (item.balance / (totalBalance || 1) * 100) : acc, 0);
  if (totalSelectedPercentage !== 100) {
      const scalingFactor = 100 / totalSelectedPercentage;
      newData.forEach(item => {
          if (item.selected) {
              item.balance = (item.balance / (totalBalance || 1) * 100) * scalingFactor / 100 * (totalBalance || 1);
          }
      });
  }
  console.log(newData)
  setData(newData);
};



  return (
    <>
      <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
        <Card className="w-[400px] h-[480px]">
          <CardHeader>
            <CardTitle>Desired Output</CardTitle>
            <CardDescription>
              Swap reward tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div>
                  <div className="flex justify-between p-2 pl-12 text-slate-400 text-sm  ">
                    <div className="h-0 my-0 mx-0 border-0 opacity-0" />
                    <div className="table-cell">Swapable Token</div>
                    <div className="table-cell">Balance (%)</div>
                  </div>
                  <hr />
                  {data.map((item, index) => {
                    return (
                      <div key={index} className="flex justify-between items-center p-2">
                        <div className="table-cell pt-4">
                          <Checkbox
                            id={`asset-${index}`}
                            onCheckedChange={() => toggleSelected(index)}
                            disabled={totalBalance == 0}
                          />
                        </div>
                        <div className="flex flex-col w-[60%] gap-2">
                          <div className="table-cell">{item.token}</div>
                          <Slider
                            defaultValue={[0]}
                            max={100}
                            min={1}
                            step={1}
                            value={[data[index].balance / (totalBalance ?? 1) * 100]}
                            onValueChange={(newValue) => handleSliderChange(index, newValue[0])}
                            disabled={!item.selected}
                          />


                        </div>
                        <div className="table-cell pt-4">{totalBalance ? (item.balance / (totalBalance ?? 1) * 100).toFixed(2) : 0 }</div>

                      </div>
                    )
                  })}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col justify-center">
            <Button className="w-[200px]">Current Selected : <span className="ml-5">{totalUsed}</span></Button>
          </CardFooter>

        </Card>
      </div>
    </>
  );
};

export default DesiredOutputCard;
