import { JsonRpcProvider, Contract, MaxUint256, Signer } from "ethers";

const provider = new JsonRpcProvider("http://127.0.0.1:8545");
let snapshotId: string | undefined;
let signer: Signer | undefined;

export default {
    setup: async (chainId: number, impersonateAddress: string): Promise<Signer> => {
        const { chainId: forkedChainId } = await provider.getNetwork();
        if (parseInt(forkedChainId.toString()) !== parseInt(chainId.toString()))

            snapshotId = await provider.send("evm_snapshot", []);

        if (impersonateAddress) {
            await provider.send("anvil_impersonateAccount", [impersonateAddress]);

            await provider.send("anvil_setBalance", [
                impersonateAddress,
                MaxUint256.toString(),
            ]);
        }
        signer = await provider.getSigner(impersonateAddress);

        return signer;
    },

    changeSafeMultisigThreshold: async (safeWallet: string): Promise<void> => {
        await provider.send("anvil_setStorageAt", [safeWallet, "0x4", "0x0000000000000000000000000000000000000000000000000000000000000001"]);

    },
    teardown: async (): Promise<void> => {
        try {
            await provider.send("evm_revert", [snapshotId]);
        } finally {
            return;
        }
    },
    getTokenBalance: async (tokenAddress: string, addressToGetBalance: string): Promise<number> => {
        const erc20 = new Contract(
            tokenAddress,
            ["function balanceOf(address) view returns (uint256)"],
            provider
        );
        return erc20.balanceOf(addressToGetBalance);
    },
    transferToken: async (tokenAddress: string, receiverAddress: string, amount: number): Promise<any> => {
        const erc20 = new Contract(
            tokenAddress,
            ["function transfer(address,uint256)"],
            signer
        );
        return (await erc20.transfer(receiverAddress, amount)).wait();
    },
    approveToken: async (tokenAddress: string, receiverAddress: string, amount: number): Promise<any> => {
        const erc20 = new Contract(
            tokenAddress,
            ["function approve(address,uint256)"],
            signer
        );
        return (await erc20.approve(receiverAddress, amount)).wait();
    },


};