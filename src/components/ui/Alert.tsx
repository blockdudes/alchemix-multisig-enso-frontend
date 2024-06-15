import { useSwitchActiveWalletChain } from "thirdweb/react";
import { ethereum } from "thirdweb/chains";

const ChainAlert = () => {
  const switchChain = useSwitchActiveWalletChain();

  // Only show the alert if not on Ethereum Mainnet
  return (
    <div className=" w-full bg-red-600 text-white text-center p-2 z-50 ">
      Alert: You are not on Ethereum Mainnet.
      <button
        className="border border-white p-1 ml-2 hover:bg-white hover:text-black"
        onClick={() =>
          switchChain({
            id: ethereum.id,
            name: ethereum.name,
            rpc: ethereum.rpc,
            nativeCurrency: ethereum.nativeCurrency,
            blockExplorers: ethereum.blockExplorers,
            testnet: ethereum.testnet,
            experimental: ethereum.experimental,
          })
        }
      >
        Switch here
      </button>
    </div>
  );
};

export default ChainAlert;
