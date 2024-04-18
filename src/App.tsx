import Navbar from "./components/header/Navbar";
import DesiredOutputCard from "./components/body/DesiredOutputCard";
import ClaimableRewardsCard from "./components/body/ClaimableRewardsCard";
import MetadataCard from "./components/body/MetadataCard";
import { Button } from "./components/ui/button";

const metaData = [
  "ALCX bribed since last claim: 4000 ALCX",
  "ALCX buyback target: 2000 ALCX",
  "Treasury stablecoin + ETH Balance: 4000 ALCX",
  "Target Balance: 1.5M, Funding Target: 35k",
];

const App = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col">
        <div className="flex flex-row gap-10 items-start justify-center px-4">
          <div className="m-5">
          <MetadataCard text={metaData[0]} />
          <MetadataCard text={metaData[1]} />
          </div>
          <div className="m-5">
          <MetadataCard text={metaData[2]} />
          <MetadataCard text={metaData[3]} />
          </div>
        </div>
        <div className="flex flex-row gap-10 items-start justify-center px-4">
          <ClaimableRewardsCard />
          <DesiredOutputCard />
        </div>
        <Button className="w-[100px] place-self-center">SWAP</Button>
      </div>
    </>
  );
};

export default App;
