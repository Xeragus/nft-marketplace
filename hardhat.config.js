require("@nomiclabs/hardhat-waffle");

require('dotenv').config();

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: process.env.INFURA_ENDPOINT
    }
  },
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts'
  }
};
