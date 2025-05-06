import { ethers } from "ethers";
import { GEO_TESTNET_RPC_URL } from "./const";

export async function submitAndSendTransaction({
  to,
  data,
  cid,
}: {
  to: string;
  data: string;
  cid: string;
}) {
  console.log("Submitting transaction to blockchain...");
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error("Private key is not set in the environment variables.");
  }
  // Create a provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(GEO_TESTNET_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  try {
    // Get the current gas price
    const gasPrice = await provider.getGasPrice();

    // Get the nonce
    const nonce = await provider.getTransactionCount(wallet.address);

    // Estimate gas limit
    const estimatedGasLimit = await provider.estimateGas({
      to: to,
      data: data,
      from: wallet.address,
    });

    // Create the transaction
    const tx = {
      to: to,
      data: data,
      gasLimit: estimatedGasLimit,
      gasPrice: gasPrice,
      nonce: nonce,
    };

    // Sign and send the transaction
    console.log("Signing and sending transaction...");
    const signedTx = await wallet.sendTransaction(tx);

    console.log("Transaction sent! Hash:", signedTx.hash);
    console.log("Waiting for transaction confirmation...");

    // Wait for the transaction to be mined
    const receipt = await signedTx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log(
      "Transaction status:",
      receipt.status === 1 ? "Success" : "Failed"
    );

    return {
      cid,
      to,
      data,
      txHash: signedTx.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === 1 ? "Success" : "Failed",
    };
  } catch (txError) {
    console.error("Transaction error:", txError);
    throw txError;
  }
}
