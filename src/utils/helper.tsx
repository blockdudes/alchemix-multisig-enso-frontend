import { ETH_FORK_RPC_URL } from '@/lib/constants';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(ETH_FORK_RPC_URL);

const privateKey = import.meta.env.VITE_ANVIL_SECRET_KEY;

const wallet = new ethers.Wallet(privateKey, provider);




export const signTransaction = async (transaction: any) => {
    let signature;
    try {
        signature = await provider.send("personal_sign", [transaction, wallet]);
    } catch (error) {
        console.log(error);
        signature = null;
        throw error;
    }
    return signature;
}


export const sendTransaction = async (transaction: any) => {
    try {
        const tx = await wallet.sendTransaction(transaction);
        const result = await tx.wait();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// export const setup = async (safeAddress: string) => {
//     const safeSdk = await Safe.create({
//     ethAdapter: new EthersAdapter({ ethers, signerOrProvider: provider }),
//     safeAddress: safeAddress,
//   });
//   return safeSdk;
// };