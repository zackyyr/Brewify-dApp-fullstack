require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const {
  INFURA_SEPOLIA_URL,
  DEPLOYER_PRIVATE_KEY,
} = process.env;

module.exports = {
  networks: {
    // Ganache / node lokal
    development: {
      host: "127.0.0.1",      // localhost
      port: 7545,             // default Ganache GUI port
      network_id: "*",        // match any network id
    },

    // Optional: deploy ke Sepolia via Infura
    sepolia: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [DEPLOYER_PRIVATE_KEY],
          providerOrUrl: INFURA_SEPOLIA_URL,
        }),
      network_id: 11155111,   // chain id Sepolia
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.19",      // sesuai pragma contract
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "london",
      },
    },
  },
};
