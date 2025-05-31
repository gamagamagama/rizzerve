import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployOracle: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying SimulateOracle with deployer:", deployer);

  const simulateOracle = await deploy("MockPriceOracle", {
    from: deployer,
    args: [], // Add constructor args if needed
    log: true,
    waitConfirmations: 1,
  });

  console.log("SimulateOracle deployed to:", simulateOracle.address);
};

export default deployOracle;
deployOracle.tags = ["SimulateOracle"];