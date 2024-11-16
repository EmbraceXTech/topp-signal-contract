import hre from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const RandomOracle = await hre.ethers.getContractFactory("SimpleRandomOracle");
  const randomOracle = await RandomOracle.deploy();
  
  const address = await randomOracle.getAddress();
  await saveDeployedAddress("RandomOracle", address);

  console.log(`Random oracle is deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
