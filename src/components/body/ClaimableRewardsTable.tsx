import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "../ui/checkbox";


const ClaimableRewardsTable = (props: any) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]"></TableHead>
          <TableHead>Claimable Tokens</TableHead>
          <TableHead className="text-right">Balance($)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.toClaim.map((asset: any) => (
          <TableRow key={asset.tokenName}>
            <TableCell className="font-medium">
              <Checkbox id="asset" />
              <label
                htmlFor="asset"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
              </label>
            </TableCell>
            <TableCell className="font-medium">{asset.tokenName}</TableCell>
            <TableCell className="text-right">{asset.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ClaimableRewardsTable;
