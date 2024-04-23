import axios from "axios";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
// import { ethers, Interface, Result, Transaction } from "ethers";
import { OperationType } from "@safe-global/safe-core-sdk-types";
import { generatePreValidatedSignature } from "@safe-global/protocol-kit/dist/src/utils";
import React from "react";

// const tenderly: Tenderly = require("tenderly");
const ensoApi = "https://api.enso.finance/api/v1/";
const ensoApiKey = "1e02632d-6feb-4a75-a157-documentation";
const tenderlyApi = "https://api.tenderly.co/api/v1";
const tenderlyProjectName = "project";
const tenderlyUserName = "amritjain";

const tenderlyProjectApi = `${tenderlyApi}/account/${tenderlyUserName}/project/${tenderlyProjectName}`;
const tenderlyApiKey = "0zBCBQ1AK8PKm51GbN5k9bopBGPXRhmF";
const safeOwner: string = "0x5788F90196954A272347aEe78c3b3F86F548D0a9";
const multiSigAddress: string = "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9";
const chainId: number = 1;

const threePoolManagerAddress = "0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b";
const twoPoolManagerAddress = "0x06378717d86b8cd2dba58c87383da1eda92d3495";
const poolManagerAddress = "0x9fb54d1f6f506feb4c65b721be931e59bb538c63";
const ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
// const zeroAddress = "0x0000000000"
interface SafeTxData {
  to: string;
  value: string;
  input: string;
  from: string;
}

interface EnsoAction {
  protocol: string;
  action: string;
  args: any;
}

interface AssetChanges {
  [token: string]: {
    amount: number;
    rawAmount: bigint;
  };
}
interface EnsoRouteAction extends EnsoAction {
  protocol: string;
  action: string;
  args: {
    slippage: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    receiver: string;
  };
}

import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');

const privateKey = import.meta.env.VITE_SECRET_KEY;

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

export const setup = async (safeAddress: string) => {
    const safeSdk = await Safe.create({
    ethAdapter: new EthersAdapter({ ethers, signerOrProvider: provider }),
    safeAddress: safeAddress,
  });
  return safeSdk;
};