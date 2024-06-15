import { Interface, Result } from "ethers";
import { odosRouterV2 } from "./abi";
import axios from "axios";
import { AssetChanges, Assets, EnsoAction, OdosSwapData } from "@/Types";
import { ethAddress } from "@/lib/constants";


const darkPathVizConfig = {
  "nodeColor": "#FFFFFF",
  "nodeTextColor": "#000000",
  "legendTextColor": "#FFFFFF",
}
function convertBigIntToString(obj: any) {
  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      obj[key] = obj[key].toString();
    } else if (Array.isArray(obj[key])) {
      obj[key] = convertBigIntToString(obj[key]);
    }
  }
  return obj;
}
const decodeOdosRouterV2Data = (data: string) => {
  const iface = new Interface(odosRouterV2);
  const functionId = data.slice(0, 10);
  const decodedArgs: Result = iface.decodeFunctionData(functionId, data);
  const functionData = iface.getFunction(data.slice(0, 10));

  const decodedArgsObj = decodedArgs?.toArray(true);
  const decodedData = convertBigIntToString(decodedArgsObj);
  // console.log(functionData?.format("full"))
  const output = {
    name: functionData?.name,
    abi: functionData?.format("full"),
    args: decodedData,
  };
  console.log(output);
  return output;
  // return
};

interface InputToken {
  amount: string;
  tokenAddress: string;
}
interface OutputToken {
  proportion: number;
  tokenAddress: string;
}

const approveTokenData = (
  tokenAddress: string,
  receiverAddress: string,
  amount: string
) => {
  try {
    // const output = {
    //   protocol: "enso",
    //   action: "approve",
    //   args: {
    //     token: tokenAddress,
    //     spender: receiverAddress,
    //     amount: amount,
    //   },
    // };
    if (tokenAddress === ethAddress) {
      return;
    }
    const output = {
      protocol: "enso",
      action: "call",
      args: {
        address: tokenAddress,
        method: "approve",
        abi: "function approve(address,uint256) external",
        args: [receiverAddress, amount],
      },
    };
    return output;
  } catch (error) {
    throw new Error("Error creating approve token data");
  }
};


export const getSwapData = async (
  safeAddress: string,
  chainId: number,
  inputTokenData: AssetChanges,
  outputTokenData: Assets[],
  slippage: number
): Promise<OdosSwapData> => {
  console.log(inputTokenData)
  console.log(223)
  // const isDark = useTheme().theme === "dark";
  const isDark = true;
console.log(`isDark`,isDark)
  const inputTokens = Object.entries(inputTokenData).map<InputToken>(
    ([address, assetData]: [string, any]): InputToken => ({
      amount: assetData.rawAmount.toString(),

      tokenAddress:
        address == ethAddress
          ? "0x0000000000000000000000000000000000000000"
          : address,
      // tokenAddress: address,
    })
  );

  // todo : the percentage might be a little bit off fix that
  console.log(outputTokenData);
  const outputTokens = outputTokenData
    .map<OutputToken>(
      (asset: Assets): OutputToken => ({
        proportion: asset.percentage ?? 0,
        // tokenAddress: asset.id,
        tokenAddress:
          asset.id == ethAddress
            ? "0x0000000000000000000000000000000000000000"
            : asset.id,
      })
    )
    .filter((outputToken: OutputToken) => outputToken.proportion > 0);
  console.log(outputTokens);
  const postData = {
    chainId: chainId,
    compact: false,
    inputTokens: inputTokens,
    outputTokens: outputTokens,
    // inputTokens: [
    //   {
    //     amount: "42186474720632342111",
    //     tokenAddress: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
    //   },
    // ],
    // outputTokens: [
    //   {
    //     proportion: 1,
    //     tokenAddress: "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9",
    //   },
    // ],
    referralCode: 0,
    slippageLimitPercent: slippage,
    sourceBlacklist: [],
    sourceWhitelist: [],
    userAddr: safeAddress,
    pathVizImage: true,
    pathVizImageConfig: isDark? darkPathVizConfig : {},
  };

  try {
    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
    };
    console.log(postData);
    const response = await axios.post(
      "https://api.odos.xyz/sor/quote/v2",
      postData,
      {
        headers,
      }
    );
    console.log(response);
    const image = response.data.pathVizImage
    const pathId = response.data.pathId;

    const url = "https://api.odos.xyz/sor/assemble";

    const data = {
      pathId: pathId,
      simulate: false,
      userAddr: safeAddress,
    };
    try {
      const response = await axios.post(url, data, { headers });
      const responseData = response.data;
      const tx = responseData.transaction;
      const txData = tx.data;
      const decodedData: any = decodeOdosRouterV2Data(txData);
      const output: EnsoAction = {
        protocol: "enso",
        action: "call",
        args: {
          address: tx.to,
          method: decodedData.name,
          abi: decodedData.abi,
          // abi: "function swap((address,uint256,address,address,uint256,uint256,address),bytes,address,uint32) external",
          // abi: "function swap(tuple(address inputToken,uint256 inputAmount,address inputReceiver,address outputToken,uint256 outputQuote,uint256 outputMin,address outputReceiver),bytes,address,uint32) external",
          args: decodedData.args,
        },
      };

      console.log(decodedData.args);
      let approveData = [];
      for (const inputToken of inputTokens) {
        const aprv = approveTokenData(
          inputToken.tokenAddress,
          tx.to,
          inputToken.amount
        );
        if (aprv) {
          approveData.push(aprv);
        }
      }
      // const approveData: EnsoAction = {
      //   protocol: "enso",
      //   action: "call",
      //   args: {
      //     address: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
      //     method: "approve",
      //     abi: "function approve(address,uint256) external",
      //     args: [
      //       "0xCf5540fFFCdC3d510B18bFcA6d2b9987b0772559",
      //       "4218647472063234211100",
      //     ],
      //   },
      // };
      // console.log([...approveData, output]);
      return {
        data: [...approveData, output],
        image:image,
      };
    } catch (error) {
      console.error(error);
      return {data: [],image:""};
    }
  } catch (error) {
    console.error(error);
    // return [];
    return {data: [],image:""};
  }
};
