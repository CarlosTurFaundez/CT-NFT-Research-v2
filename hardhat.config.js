require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
const fs = require('fs');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 11155111
    },
    
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/oAKXPi8t0_v6sqFEwq6UXx4U-YLU5aDJ",
      accounts: ["1e46c90277a654b86f0eacfc437943869903f9ed3caa9ab1a05206a64fb916fd",]
    }
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};