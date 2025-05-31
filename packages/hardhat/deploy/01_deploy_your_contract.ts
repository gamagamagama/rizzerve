import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployRizzToken: DeployFunction = async ({ getNamedAccounts, deployments }) => {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying RizzToken with deployer:", deployer);

  // Get the previously deployed oracle
  const mockPriceOracle = await get("MockPriceOracle");

  const rizzToken = await deploy("RizzToken", {
    from: deployer,
    args: [deployer, mockPriceOracle.address], // Pass deployer and oracle address
    log: true,
    waitConfirmations: 1,
  });

  console.log("RizzToken deployed to:", rizzToken.address);
  console.log("Initial owner and minter:", deployer);
  console.log("Oracle address:", mockPriceOracle.address);

  // Verify deployment
  const RizzTokenContract = await ethers.getContractAt("RizzToken", rizzToken.address);
  const name = await RizzTokenContract.name();
  const symbol = await RizzTokenContract.symbol();
  const owner = await RizzTokenContract.owner();

  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Contract Owner: ${owner}`);
  console.log(`Is owner a minter: ${await RizzTokenContract.isMinter(owner)}`);
};

export default deployRizzToken;
deployRizzToken.tags = ["RizzToken"];
deployRizzToken.dependencies = ["MockPriceOracle"]; // Ensures oracle is deployed first