const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const nftMarketContract = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarketContractInstance = await nftMarketContract.deploy();
  await nftMarketContractInstance.deployed();
  console.log("NFTMarket deployed to:", nftMarketContractInstance.address);

  const nftContract = await hre.ethers.getContractFactory("NFT");
  const nftContractInstance = await nftContract.deploy(nftMarketContractInstance.address);
  await nftContractInstance.deployed();
  console.log("NFT deployed to:", nftContractInstance.address);

  const configContent = `
    export const nftMarketContractAddress = "${nftMarketContractInstance.address}"
    export const nftContractAddress = "${nftContractInstance.address}"
  `;
  const data = JSON.stringify(configContent);

  fs.writeFileSync('./src/config.js', JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
