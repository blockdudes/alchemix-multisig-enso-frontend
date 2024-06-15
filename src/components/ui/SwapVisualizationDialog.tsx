import {
    Dialog,
    DialogContent,
  
    DialogTrigger
  } from "@/components/ui/dialog"
import { Button } from "./button"

  
const SwapVisualizationDialog = ({src}: any) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Show Swap Path</Button>
        </DialogTrigger>
        <DialogContent>
        <img src={src} alt="Swap" />
        </DialogContent>
      </Dialog>
    )
  }

  export default SwapVisualizationDialog