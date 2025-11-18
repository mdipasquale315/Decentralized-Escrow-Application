const { ethers } = require("hardhat");

async function main() {
  const Escrow = await ethers.getContractFactory("Escrow");

  const arbiter = process.env.ARBITER || "0x0000000000000000000000000000000000000000";
  const beneficiary = process.env.BENEFICIARY || "0x0000000000000000000000000000000000000000";

  const esc = await Escrow.deploy(arbiter, beneficiary, {
    value: ethers.utils.parseEther("1")
  });

  await esc.deployed();

  console.log("Escrow deployed to:", esc.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
