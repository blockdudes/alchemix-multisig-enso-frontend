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
import { useState } from "react";


const DesiredOutputCard = ({totalBalance = 110}) => {


  const [data, setData] = useState([
    { token: 'Eth in uniswap', balance: 10 },
    { token: 'Btc in unisat', balance: 5 },
    { token: 'Eth in uniswap', balance: 10 },
    { token: 'Btc in unisat', balance: 5 },
    { token: 'Eth in uniswap', balance: 10 },
    { token: 'Btc in unisat', balance: 5 },
  ]);

  // const handleSliderChange = (index: number, newValue: number) => {
  //   setData(prevData => prevData.map((item, i) => 
  //     i === index ? { ...item, balance: newValue } : item
  //   ));
  // };

  const handleSliderChange = (index: number, newValue: number) => {
    const newTotal = data.reduce((acc, item, i) => {
      return i === index ? acc + newValue : acc + item.balance;
    }, 0);

    if (newTotal <= totalBalance) {
      setData(prevData => prevData.map((item, i) => 
        i === index ? { ...item, balance: newValue } : item
      ));
    } else {
      // throw new Error("Total balance exceeded. Please adjust within the limit");
      alert("Total balance exceeded. Please adjust within the limit");
    }
  };

  return (
    <>
      <div className="claimableRewards m-5">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Desired Output</CardTitle>
            <CardDescription>
              Deploy your new project in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div>
                  <div className="flex justify-between p-2">
                    <div className="table-cell">Swapable Token</div>
                    <div className="table-cell">Balance</div>
                  </div>
                  {data.map((item, index) => (
                    <div key={index} className="flex justify-between p-2">
                      <div className="flex flex-col w-[80%] gap-2">
                        <div className="table-cell">{item.token}</div>
                        <Slider
                          defaultValue={[0]}
                          max={100}
                          step={1}
                          value={[item.balance]}
                          onValueChange={(newValue) => handleSliderChange(index, newValue[0])}

                        />
                      </div>
                      <div className="table-cell pt-4">{item.balance}</div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button>Total Value <span className="ml-5">{totalBalance}</span></Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default DesiredOutputCard;
