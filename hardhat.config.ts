import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const accounts = [
  vars.get("PRIVATE_KEY")
]

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    bkc_testnet: {
      url: `https://rpc-testnet.bitkubchain.io`,
      accounts
    }
  }
};

export default config;