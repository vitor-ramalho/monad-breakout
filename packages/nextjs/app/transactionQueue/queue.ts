import { ethers } from "ethers";
import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import { monadDevnet } from "~~/utils/CustomChains";

const queue: any[] = [];
let isProcessing = false;

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL;
const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS;

const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);

const { BreakoutGame } = deployedContracts[20143];

export const ABI = [
  {
    inputs: [],
    name: "breakBrick",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "startGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

let currentNonce: number | null = null;

const getNonce = async (provider: ethers.JsonRpcProvider, address: string) => {
  if (currentNonce === null) {
    currentNonce = await provider.getTransactionCount(address, "pending");
  } else {
    currentNonce++;
  }
  return currentNonce;
};

let transactions: any[] = [];

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const { playerAddress, action, resolve, reject, id } = queue.shift();

  try {
    if (!RELAYER_PRIVATE_KEY || !RPC_URL || !GAME_CONTRACT_ADDRESS) {
      throw new Error("Relayer configuration missing");
    }

    const account = privateKeyToAccount(`0x${RELAYER_PRIVATE_KEY}`);
    const walletClient = createWalletClient({
      account,
      chain: monadDevnet,
      transport,
    });

    const contract = getContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: ABI,
      client: walletClient,
    });

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const sendTransaction = async () => {
      const nonce = await getNonce(provider, account.address);

      let txHash;

      if (action === "breakBrick") {
        txHash = await contract.write.breakBrick([], { nonce });
        transactions.push({ id, playerAddress, action, status: "completed", txHash });
      } else if (action === "startGame") {
        txHash = await contract.write.startGame([playerAddress], { nonce });
      } else {
        throw new Error("Invalid action");
      }

      return txHash;
    };

    try {
      const txHash = await sendTransaction();
      transactions.push({ id, status: "completed", txHash });
      resolve({ success: true, txHash });
    } catch (error) {
      if (error.message.includes("Nonce too low")) {
        // Retry with updated nonce
        const txHash = await sendTransaction();
        resolve({ success: true, txHash });
      } else {
        throw error;
      }
    }
  } catch (error) {
    transactions.push({ id, playerAddress, action, status: "failed", error: error.message });
    reject({ error: error.message });
  } finally {
    isProcessing = false;
    processQueue();
  }
};

export const addToQueue = (playerAddress: string, action: string) => {
  const id = transactions.length + 1;
  transactions.push({ id, playerAddress, action, status: "pending" });
  return new Promise((resolve, reject) => {
    queue.push({ playerAddress, action, resolve, reject, id });
    processQueue();
  });
};

export const getTransactions = () => {
  console.log("transactions get transactions", transactions);
  return transactions;
};
