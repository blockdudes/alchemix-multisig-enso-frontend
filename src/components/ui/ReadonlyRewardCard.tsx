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
import { Checkbox } from "../ui/checkbox";


interface Assets {
    id: number;
    tokenName: string;
    amount: number;
    tick: boolean;
}


const ReadOnlyRewardsCard = ({ assets }: any) => { // Default totalValue for demonstration

    const totalValue = assets.reduce((total : number, item: Assets) => item.tick ? total + item.amount : total, 0);
    console.log("totalValue", totalValue);

    return (
        <>
            <div className="m-5 bg-white bg-opacity-15 backdrop-filter backdrop-blur-lg rounded-xl p-3">
                <Card className="w-[400px] h-[480px]">
                    <CardHeader>
                        <CardTitle>Claim Assets</CardTitle>
                        <CardDescription>
                            Assets available to claim from AMOS
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]"></TableHead>
                                    <TableHead>Claimable Tokens</TableHead>
                                    <TableHead className="text-right">Balance($)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((asset: Assets, index : number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            <Checkbox
                                                id={`asset-${index}`}
                                                checked={asset.tick}
                                                disabled
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{asset.tokenName}</TableCell>
                                        <TableCell className="text-right">{asset.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-center align-bottom">
                        <Button className="w-[150px]">
                            Total Value: <span className="ml-5">{totalValue}</span>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
};

export default ReadOnlyRewardsCard;
