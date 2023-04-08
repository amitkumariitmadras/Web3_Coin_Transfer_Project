//https://eth-sepolia.g.alchemy.com/v2/ZgfRPYT2X0bzV0oW5q5jhqd33TW0bdCE

require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.0",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/5QXrLMoprmO_-KgaYN5ksXtj_bzW7Jmy",
      accounts: [
        "401a30895ada027f21f371fb85e8b3ea44976ae4b5b2595b49eae9ffae2b3e54",
      ],
    },
  },
};
