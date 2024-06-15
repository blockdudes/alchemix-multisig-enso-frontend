// import * as React from "react";

// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Connect } from "@/hooks/Connect";

export default function LoginPage() {
  return (
    <Card className="w-[350px] h-[400px]">
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>connect to visit admin dashboard.</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="flex justify-center mt-28">
        <Connect />
      </CardFooter>
    </Card>
  );
}
