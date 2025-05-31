import { ethers } from "hardhat";
// Removed unused import for utils
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function main() {
    const initialSupply = ethers.utils.parseEther("1000000"); // Using ethers.utils directly

    const RizzToken = await ethers.getContractFactory("RizzToken");
    const rizzToken = await RizzToken.deploy(initialSupply);

    await rizzToken.deployed();

    console.log("RizzToken deployed to:", rizzToken.address);

    const StakingVault = await ethers.getContractFactory("StakingVault");
    const stakingVault = await StakingVault.deploy(rizzToken.address);

    await stakingVault.deployed();

    console.log("StakingVault deployed to:", stakingVault.address);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});