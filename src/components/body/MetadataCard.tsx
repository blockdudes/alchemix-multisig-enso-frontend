import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MetadataCard = (props) => {
  return (
    <div>
      <Card className="w-[400px] pt-4">
        <CardContent>{props.text}</CardContent>
      </Card>
    </div>
  );
};

export default MetadataCard;
