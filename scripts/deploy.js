const hre = require("hardhat");

async function main() {
  const nftMarketContract = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarketContractInstance = await nftMarketContract.deploy();

  await nftMarketContractInstance.deployed();

  console.log("NFTMarket deployed to:", nftMarketContractInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
