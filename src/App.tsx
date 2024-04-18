
import Navbar from "./components/header/Navbar"
import DesiredOutputCard from "./components/body/DesiredOutputCard";
import ClaimableRewardsCard from "./components/body/ClaimableRewardsCard";
function App() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col">
        {/* <div className="flex flex-row gap-10 items-start justify-center px-4 border">
          <div className=" border-2 m-10 p-24"></div>
          <div className=" border-2 m-10 p-24"></div>
        </div> */}
        <div className="flex flex-row gap-10 items-start justify-center px-4 border">
          <ClaimableRewardsCard />
          <DesiredOutputCard />
        </div>
      </div>
    </>
  );
}

export default App;
