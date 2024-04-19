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


const DesiredOutputCard = ({ totalBalance = 100 }) => {


  const [data, setData] = useState([
    { token: 'Eth in uniswap', balance: 0, selected: false },
    { token: 'Btc in unisat', balance: 0, selected: false },
    { token: 'Eth in uniswap', balance: 0, selected: false },
    { token: 'Btc in unisat', balance: 0, selected: false },
  ]);


  // const handleSliderChange = (index: number, newValue: number) => {

  //   for (let i=0 ; i< length; i++) {

  //   } 

  //   const newTotal = data.reduce((acc, item, i) => {
  //     return i === index ? acc + newValue : acc + item.balance;
  //   }, 0);

  //   if (newTotal <= totalBalance) {
  //     setData(prevData => prevData.map((item, i) =>
  //       i === index ? { ...item, balance: newValue } : item
  //     ));
  //   } else {
  //     // setData()
  //     // alert("Total balance exceeded. Please adjust within the limit");
  //   }
  // };

  const toggleSelected = (index: number) => {
    setData(prevData => {
      let selectedBalance = prevData.reduce((total, item) => item.selected ? total + item.balance : total, 0);
      return prevData.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            selected: !item.selected,
            balance: !item.selected ? totalBalance - selectedBalance : 0
          };
        } else {
          return item;
        }
      });
    });
  };
  


  const handleSliderChange = (index: number, newValue: number) => {
    let newData = [...data];
    newData[index].balance = Math.max(newValue, 1);

    // Recalculate the total used and overbalance only considering selected items
    const totalUsed = newData.reduce((acc, item) => item.selected ? acc + item.balance : acc, 0);
    const overBalance = totalUsed - totalBalance;

    if (overBalance > 0) {
      // Calculate the sum of balances of other selected indices for proportional adjustment
      let sumOfOtherBalances = newData.reduce((acc, item, i) =>
        i !== index && item.selected ? acc + item.balance : acc, 0);

      // Proportionally reduce balances of other selected tokens
      newData.forEach((item, i) => {
        if (i !== index && item.selected) {
          let proportionalDeduction = Math.ceil(item.balance / sumOfOtherBalances * overBalance);
          item.balance = Math.max(item.balance - proportionalDeduction, 1);
        }
      });

      // Recheck the total and adjust if there's still an overbalance
      let finalAdjustment = newData.reduce((acc, item) => item.selected ? acc + item.balance : acc, 0) - totalBalance;
      while (finalAdjustment > 0) {
        newData.forEach((item, i) => {
          if (finalAdjustment > 0 && i !== index && item.selected && item.balance > 1) {
            let adjustAmount = Math.min(finalAdjustment, item.balance - 1);
            item.balance -= adjustAmount;
            finalAdjustment -= adjustAmount;
          }
        });
      }
    }

    setData(newData);
  };





  return (
    <>
      <div className="claimableRewards m-5">
        <Card className="w-[400px] h-[565px]">
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
                    <div className="table-cell">Balance($)</div>
                  </div>
                  <hr />
                  {data.map((item, index) => {
                    return (
                      <div key={index} className="flex justify-between items-center p-2">
                        <div className="table-cell pt-4">
                          <Checkbox
                            id={`asset-${index}`}
                            onCheckedChange={() => toggleSelected(index)}

                            />
                        </div>
                        <div className="flex flex-col w-[60%] gap-2">
                          <div className="table-cell">{item.token}</div>
                          <Slider
                            defaultValue={[0]}
                            max={totalBalance - data.filter(item => item.selected).length + 1}
                            min={1}
                            step={1}
                            value={[item.balance]}
                            onValueChange={(newValue) => handleSliderChange(index, newValue[0])}
                            disabled={!item.selected} 

                          />
                        </div>
                        <div className="table-cell pt-4">{item.balance}</div>

                      </div>
                    )
                  })}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button className="w-[150px]">Total Value: <span className="ml-5">{totalBalance}</span></Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default DesiredOutputCard;
