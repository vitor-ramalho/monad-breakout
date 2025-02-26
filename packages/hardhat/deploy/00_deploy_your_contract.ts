import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the BreakoutGame contract using the deployer account.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployBreakoutGame: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BreakoutGame", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const breakoutGame = await hre.ethers.getContract<Contract>("BreakoutGame", deployer);
  console.log("BreakoutGame contract:", breakoutGame);
  console.log("BreakoutGame contract deployed at:", breakoutGame.runner.address);
};

export default deployBreakoutGame;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags BreakoutGame
deployBreakoutGame.tags = ["BreakoutGame"];
