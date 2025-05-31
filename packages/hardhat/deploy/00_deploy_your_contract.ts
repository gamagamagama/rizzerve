import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ethers as utils } from "ethers";

const deployRizzTokenAndStakingVault: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const owner = await ethers.getSigner(deployer);

  const initialSupply = utils.parseEther("1000000");

  const RizzToken = await ethers.getContractFactory("RizzToken");
  const rizzToken = await deploy("RizzToken", {
    from: deployer,
    args: [initialSupply],
    log: true,
    autoMine: true,
  });

  const rizzTokenContract = await ethers.getContractAt("RizzToken", rizzToken.address);
  await rizzTokenContract.mint(deployer, utils.parseEther("1000"));
  console.log("RizzToken deployed to:", rizzToken.address);

  const StakingVault = await ethers.getContractFactory("StakingVault");
  const stakingVault = await deploy("StakingVault", {
    from: deployer,
    args: [rizzToken.address],
    log: true,
    autoMine: true,
  });

  const stakingVaultContract = await ethers.getContractAt("StakingVault", stakingVault.address);
  await rizzTokenContract.approve(stakingVault.address, utils.parseEther("1000000"));
  console.log("StakingVault deployed to:", stakingVault.address);
};

export default deployRizzTokenAndStakingVault;

deployRizzTokenAndStakingVault.tags = ["RizzToken", "StakingVault"];

async function deploy(
  contractName: string,
  options: { from: string; log: boolean; autoMine: boolean },
  hre: HardhatRuntimeEnvironment
): Promise<Contract> {
  const { deployments, ethers } = hre;
  const { deploy } = deployments;

  const deploymentResult = await deploy(contractName, {
    from: options.from,
    log: options.log,
    autoMine: options.autoMine,
  });

  if (options.log) {
    console.log(`📄 ${contractName} deployed at ${deploymentResult.address}`);
  }

  return ethers.getContractAt(contractName, deploymentResult.address);
}

async function deployFakeAsset(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const fakeAsset = await deploy("Rizz", { from: deployer, log: true, autoMine: true }, hre);
  return fakeAsset;
}

deployFakeAsset.tags = ["FakeAsset"];