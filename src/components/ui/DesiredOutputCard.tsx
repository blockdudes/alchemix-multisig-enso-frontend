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
import { useEffect, useState } from "react";
import { Assets, TokenData } from "@/Types";
import { useEthereum } from "@/context/store";
import { ScrollArea } from "@radix-ui/react-scroll-area";

type DesiredOutputCardProps = {
    tokenData: Assets[];
    isEditable: boolean;
};

const DesiredOutputCard = ({ tokenData, isEditable }: any) => {

    
    const { desiredoutput, setDesiredOutput } = useEthereum();
    const [currentData, setCurrentData] = useState(
        isEditable ? desiredoutput : tokenData 
    );

    console.log("----->",currentData)

    const totalBalance: number = currentData.filter((item: Assets) => item.tick).reduce((acc: number, item: Assets) => acc + item.dollarValue, 0);

    const toggleSelected = (index: number) => {
        console.log(desiredoutput)
        const newData = [...desiredoutput];
        const isSelectedNow = !newData[index].tick;

        newData[index].tick = isSelectedNow;
        if (isSelectedNow) {
            // Calculate the new percentage if this token is now selected
            const selectedItemsCount = newData.filter(item => item.tick).length;
            const newPercentage = 100 / selectedItemsCount;
            newData.forEach((item, idx) => {
                if (item.tick) {
                    item.amount = (newPercentage / 100) * (totalBalance || 1);
                }
            });
        } else {
            // Set the balance of the deselected item to 0
            newData[index].amount = 0;

            // Redistribute the balance among the remaining selected items
            const selectedItems = newData.filter(item => item.tick);
            const newPercentage = selectedItems.length > 0 ? 100 / selectedItems.length : 0;
            selectedItems.forEach(item => {
                item.amount = (newPercentage / 100) * (totalBalance || 1);
            });
        }

        setDesiredOutput(newData);
    };

    const handleSliderChange = (index: number, newPercentage: number) => {
        const newData = [...desiredoutput];
        newData[index].amount = (newPercentage / 100) * (totalBalance || 1);

        const totalSelectedPercentage = newData.reduce((acc, item) => item.tick ? acc + (item.amount / (totalBalance || 1) * 100) : acc, 0);
        if (totalSelectedPercentage !== 100) {
            const scalingFactor = 100 / totalSelectedPercentage;
            newData.forEach(item => {
                if (item.selected) {
                    item.amount = (item.amount / (totalBalance || 1) * 100) * scalingFactor / 100 * (totalBalance || 1);
                }
            });
        }
        console.log(newData)
        setDesiredOutput(newData);
    };


    return (
        <>
            <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                <Card className="w-[400px] h-[480px] relative">
                    <CardHeader>
                        <CardTitle>Desired Output</CardTitle>
                        <CardDescription>
                            Swap reward tokens
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>

                            <div className="w-full items-center gap-4">
                                <div>
                                    <div className="flex justify-between p-2 pl-12 text-slate-400 text-sm  ">
                                        {isEditable && <div className="h-0 my-0 mx-0 border-0 opacity-0" />}
                                        <div className="table-cell">Token</div>
                                        {!isEditable && <div className="table-cell">Balance</div>}
                                        <div className="table-cell">Amount($)</div>
                                    </div>
                                    <hr />
                                    <ScrollArea className="h-60 w-full scroll-px-py">
                                        {currentData.map((item: Assets, index: number) => {
                                            return (
                                                <>
                                                    <hr />
                                                    <div key={index} className="flex justify-between items-center p-3 gap-4 text-sm text-start">
                                                        {
                                                            isEditable && <>
                                                                <div className="table-cell pt-4">
                                                                    {isEditable && <Checkbox
                                                                        id={`asset-${index}`}
                                                                        checked={item.tick}
                                                                        onCheckedChange={() => toggleSelected(index)}
                                                                        disabled={totalBalance == 0}
                                                                    />}
                                                                </div>
                                                            </>
                                                        }
                                                        <div className={`flex flex-col ${isEditable ? 'w-[60%] pl-4' : 'pl-8'} mt-1 gap-2 `}>
                                                            <div className="table-cell ">{item.tokenName}</div>
                                                            {isEditable && <Slider
                                                                defaultValue={[item.amount / (totalBalance ?? 1) * 100]}
                                                                max={100}
                                                                min={1}
                                                                step={1}
                                                                value={[desiredoutput[index].amount / (totalBalance ?? 1) * 100]}
                                                                onValueChange={(newValue) => handleSliderChange(index, newValue[0])}
                                                                disabled={!item.tick}
                                                            />}

                                                        </div>
                                                        {!isEditable && <div className="table-cell ">{item.amount.toFixed(2)}</div>}
                                                        {!isEditable && <div className="table-cell ">${item.dollarValue.toFixed(2)}</div>}
                                                        {isEditable &&
                                                            <div className="table-cell pt-4 w-24 text-right">{totalBalance ? (item.amount / (totalBalance ?? 1) * 100).toFixed(2) : 0} %</div>
                                                        }
                                                    </div>
                                                </>
                                            )
                                        })}
                                    </ScrollArea>
                                </div>
                            </div>

                        </form>
                    </CardContent>
                    <CardFooter className="absolute bottom-0 w-full flex flex-col justify-center gap-1">
                        <Button className="w-full text-center cursor-auto pointer-events-none">Total value : <span className="ml-5">${(totalBalance ?? 0).toFixed(2)}</span></Button>
                    </CardFooter>

                </Card>
            </div>
        </>
    );

    //   return (
    //     <>
    //       <div className="claimableRewards m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
    //         <Card className="w-[400px] h-[480px] relative">
    //           <CardHeader>
    //             <CardTitle>Desired Output</CardTitle>
    //             <CardDescription>
    //               Swap reward tokens
    //             </CardDescription>
    //           </CardHeader>
    //           <CardContent>
    //             <form>
    //                 {
    //                     isEditable ? (
    //                         <div className="w-full items-center gap-4">
    //                         <div>
    //                           <div className="flex justify-between p-2 pl-12 text-slate-400 text-sm  ">
    //                             <div className="h-0 my-0 mx-0 border-0 opacity-0" />
    //                             <div className="table-cell">Token</div>
    //                             {/* <div className="table-cell">Balance</div> */}
    //                             <div className="table-cell">Amount($)</div>
    //                           </div>
    //                           <hr />
    //                           <ScrollArea className="h-60 w-full scroll-px-py">
    //                           {desiredoutput.map((item:Assets , index: number) => {
    //                             return (
    //                               <div key={index} className="flex justify-between items-center p-2 gap-4">
    //                                 <div className="table-cell pt-4">
    //                                { isEditable && <Checkbox
    //                                     id={`asset-${index}`}
    //                                     onCheckedChange={() => toggleSelected(index)}
    //                                     disabled={totalBalance == 0}
    //                                     />}
    //                                 </div>
    //                                 <div className="flex flex-col w-[60%] gap-2 pl-4">
    //                                 <div className="table-cell ">{item.tokenName}</div>
    //                                   {isEditable && <Slider
    //                                     defaultValue={[0]}
    //                                     max={100}
    //                                     min={1}
    //                                     step={1}
    //                                     value={[desiredoutput[index].balance / (totalBalance ?? 1) * 100]}
    //                                     onValueChange={(newValue) => handleSliderChange(index, newValue[0])}
    //                                     disabled={!item.tick}
    //                                     /> }
    //                                     </div>
    //                                     <div className="table-cell pt-4 w-24 text-right">{totalBalance ? (item.amount / (totalBalance ?? 1) * 100).toFixed(2) : 0 } %</div>

    //                               </div>
    //                             )
    //                           })}
    //                           </ScrollArea>
    //                         </div>
    //                       </div>
    //                     ) :
    //                      (
    //                         <div className="w-full items-center gap-4">
    //                         <div className="flex flex-col gap-1">
    //                           <div className="flex justify-between p-2  pl-4 text-slate-400 text-sm  ">
    //                             <div className="table-cell ">Swap Token</div>
    //                             <div className="table-cell">Balance</div>
    //                             <div className="table-cell">Amount($)</div>
    //                           </div>
    //                           <ScrollArea className="h-60 w-full scroll-px-py">
    //                           {tokenData.map((item:Assets , index: number) => {
    //                             return (
    //                                 <>
    //                               <hr/>
    //                               <div key={index} className="flex justify-between items-center p-2 gap-4 ml-8 my-2 text-sm font-medium ">

    //                                 <div className="table-cell  ">{item.tokenName}</div>
    //                                 <div className="table-cell ">{item.amount.toFixed(2)}</div>
    //                                 <div className="table-cell ">${item.dollarValue.toFixed(2)}</div>

    //                                 {/* <div className="table-cell pt-4 w-24 text-right">{totalBalance ? (item.balance / (totalBalance ?? 1) * 100).toFixed(2) : 0 } %</div> */}

    //                               </div>
    //                               </>
    //                             )
    //                           })}
    //                           </ScrollArea>
    //                         </div>
    //                       </div>

    //                      )
    //                 }

    //             </form>
    //           </CardContent>
    //           <CardFooter className="absolute bottom-0 w-full flex flex-col justify-center gap-1">
    //               <Button className="w-full text-center cursor-auto pointer-events-none">Total value : <span className="ml-5">${(totalBalance ?? 0).toFixed(2)}</span></Button>
    //             {/* {
    //                 isEditable ? 
    //                 :
    //                 <Button className="w-full text-center cursor-auto pointer-events-none">Total value : <span className="ml-5">${(totalBalance ?? 0).toFixed(2)}</span></Button>
    //             }  */}

    //           </CardFooter>

    //         </Card>
    //       </div>
    //     </>
    //   );
};

export default DesiredOutputCard;
