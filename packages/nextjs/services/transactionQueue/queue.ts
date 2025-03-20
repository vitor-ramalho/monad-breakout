import { ethers } from "ethers";
import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";
import { monadTestnet } from "~~/utils/CustomChains";

export interface Transaction {
  id: number;
  playerAddress: string;
  action: "breakBrick" | "startGame";
  status: "pending" | "completed" | "failed";
  txHash?: string;
  error?: string;
}

interface QueueItem {
  playerAddress: string;
  action: "breakBrick" | "startGame";
  resolve: (value: { success: boolean; txHash?: string }) => void;
  reject: (reason: { error: string }) => void;
  id: number;
}

const queue: QueueItem[] = [];
let isProcessing = false;

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL;
const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS;

const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);

const { BreakoutGame } = deployedContracts[20143];

// export const ABI = [
//   {
//     inputs: [],
//     name: "breakBrick",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "player",
//         type: "address",
//       },
//     ],
//     name: "startGame",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
// ];

let currentNonce: number | null = null;

const getNonce = async (provider: ethers.JsonRpcProvider, address: string): Promise<number> => {
  if (currentNonce === null) {
    currentNonce = await provider.getTransactionCount(address, "pending");
  } else {
    currentNonce++;
  }
  return currentNonce;
};

export const transactions: Transaction[] = [];

const updateTransaction = (id: number, updates: Partial<Transaction>) => {
  const index = transactions.findIndex(tx => tx.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
  }
};

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const { playerAddress, action, resolve, reject, id } = queue.shift()!;

  try {
    if (!RELAYER_PRIVATE_KEY || !RPC_URL || !GAME_CONTRACT_ADDRESS) {
      throw new Error("Relayer configuration missing");
    }

    const account = privateKeyToAccount(`0x${RELAYER_PRIVATE_KEY}`);
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport,
    });

    const contract = getContract({
      address: BreakoutGame.address,
      abi: BreakoutGame.abi,
      client: walletClient,
    });

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const sendTransaction = async () => {
      const nonce = await getNonce(provider, account.address);

      let txHash: string;

      if (action === "breakBrick") {
        txHash = await contract.write.breakBrick({ nonce });
        updateTransaction(id, { status: "completed", txHash });
      } else if (action === "startGame") {
        txHash = await contract.write.startGame([playerAddress], { nonce });
        updateTransaction(id, { status: "completed", txHash });
      } else {
        throw new Error("Invalid action");
      }

      return txHash;
    };

    try {
      const txHash = await sendTransaction();
      resolve({ success: true, txHash });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes("Nonce too low")) {
        // Reset nonce and retry
        currentNonce = null;
        const txHash = await sendTransaction();
        resolve({ success: true, txHash });
      } else {
        throw error;
      }
    }
  } catch (error) {
    const err = error as Error;
    updateTransaction(id, { status: "failed", error: err.message });
    reject({ error: err.message });
  } finally {
    isProcessing = false;
    // Process next item in queue
    void processQueue();
  }
};

export const addToQueue = (
  playerAddress: string,
  action: "breakBrick" | "startGame",
): Promise<{ success: boolean; txHash?: string }> => {
  const id = transactions.length + 1;
  transactions.push({ id, playerAddress, action, status: "pending" });

  return new Promise((resolve, reject) => {
    queue.push({ playerAddress, action, resolve, reject, id });
    void processQueue();
  });
};

export const getTransactions = (): Transaction[] => {
  return [...transactions]; // Return a copy to prevent external modifications
};
