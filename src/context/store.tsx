import { createContext, useContext, useEffect, useState } from "react"
import { JsonRpcSigner, ethers } from 'ethers';
import anvil from "@/utils/anvil";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { CHAIN_ID, OWNER1_ADDRESS, RPC_URL, SAFE_API_URL, multiSigAddress } from "@/lib/constants";
import SafeApiKit from "@safe-global/api-kit";
import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";
import { TokenData } from "@/Types";

export const appState = createContext<any>(null);



const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {

    const [clientSigner, setClientSigner] = useState<JsonRpcSigner | null>(null);
    const [rpcSigner, setRpcSigner] = useState<ethers.Wallet | null>(null);
    const [ethAdapter, setEthAdapter] = useState<EthersAdapter | null>(null);
    const [safe, setSafe] = useState<Safe | null>(null);
    const [safeApiKit, setSafeApiKit] = useState<SafeApiKit | null>(null);
    const dummyData = [
        { token: 'USDC', balance: 0, selected: false, dollarValue: 0 },
        // { token: 'Btc in unisat', balance: 0, selected: false,dollarValue: 0 },
    ]
    const [desiredoutput, setDesiredOutput] = useState<TokenData[]>(dummyData)


    useEffect(() => {
        const initEthereum = async () => {
            if (!window.ethereum) {
                console.error("Ethereum provider (e.g., MetaMask) not found");
                return;
            }
            
            try {
                const injectedProvider = new ethers.BrowserProvider(window.ethereum);

                const rpcProvider = new ethers.JsonRpcProvider(RPC_URL)
                const injectedSigner = await injectedProvider.getSigner();
                const rpc_Signer = new ethers.Wallet(import.meta.env.VITE_SECRET_KEY, rpcProvider);
                const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: injectedSigner });
                const safeApiKit = new SafeApiKit({
                    chainId: 11155111n, // Converted CHAIN_ID to a bigint
                    
                });
                const _safe = await Safe.create({ ethAdapter, safeAddress: multiSigAddress })



                setClientSigner(injectedSigner);
                setRpcSigner(rpc_Signer);
                setEthAdapter(ethAdapter);
                setSafe(_safe);
                setSafeApiKit(safeApiKit);

                
            } catch (error) {
                throw error
            }

        };

        initEthereum();
    }, []);

    return (
        <appState.Provider value={{ safeApiKit, clientSigner, rpcSigner, ethAdapter, safe, desiredoutput, setDesiredOutput }}>
            {children}
        </appState.Provider>
    )
}

export default GlobalStateProvider;
export const useEthereum = () => useContext(appState);

