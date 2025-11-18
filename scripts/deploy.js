// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying Escrow.sol with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Escrow = await hre.ethers.getContractFactory("Escrow");

  // Dummy default addresses — replace with real ones
  const arbiter = "0x0000000000000000000000000000000000000001";
  const beneficiary = "0x0000000000000000000000000000000000000002";
  const deposit = hre.ethers.utils.parseEther("1"); // 1 ETH

  const escrow = await Escrow.deploy(arbiter, beneficiary, { value: deposit });

  await escrow.deployed();

  console.log("Escrow deployed to:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
