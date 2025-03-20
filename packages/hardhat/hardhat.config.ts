import * as dotenv from "dotenv";
dotenv.config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { task } from "hardhat/config";
import generateTsAbis from "./scripts/generateTsAbis";

import { vars } from "hardhat/config";

const chainId = Number(process.env.MONAD_CHAIN_ID);
const rpcUrl = process.env.MONAD_RPC_URL;
const privateKey = process.env.PRIVATE_KEY || "";

console.log("chainId", chainId);
console.log("rpcUrl", rpcUrl);
console.log("privateKey", privateKey);

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  defaultNetwork: "monad",
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    monad: {
      url: rpcUrl,
      accounts: [privateKey],
      chainId: Number(chainId),
    },
  },
  sourcify: {
    enabled: false,
  },
};

// Extend the deploy task
task("deploy").setAction(async (args, hre, runSuper) => {
  await runSuper(args);
  await generateTsAbis(hre);
});

export default config;
