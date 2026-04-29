import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const baseRpcUrl = process.env.BASE_RPC_URL || "https://mainnet.base.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    base: {
      url: baseRpcUrl,
      chainId: 8453,
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
