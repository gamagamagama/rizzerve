import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ethers as utils } from "ethers";


module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying RizzToken with deployer:", deployer);

  const rizzToken = await deploy("RizzToken", {
    from: deployer,
    args: [deployer], // Pass the deployer as the initial owner
    log: true,
    waitConfirmations: 1,
  });

  console.log("RizzToken deployed to:", rizzToken.address);
  console.log("Initial owner and minter:", deployer);

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

module.exports.tags = ["RizzToken"];