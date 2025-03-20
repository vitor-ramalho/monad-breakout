import { defineChain } from "viem";


// TODO: Add Chain details here.
export const monadDevnet = defineChain({
  id: 20143,
  name: "Monad Devnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      // TODO: Add Monad RPC URL
      http: ["https://rpc-devnet.monadinfra.com/rpc/3fe540e310bbb6ef0b9f16cd23073b0a"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Devnet Blockscout",
      // TODO: Add Explorer URL
      url: "https://explorer.monad-devnet.devnet101.com/",
    },
  },
});

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      // TODO: Add Monad RPC URL
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet Blockscout",
      // TODO: Add Explorer URL
      url: "https://testnet.monadexplorer.com/",
    },
  },
});
