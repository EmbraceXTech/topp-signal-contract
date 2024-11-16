import hre from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const PriceOracle = await hre.ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await PriceOracle.deploy();
  
  const address = await priceOracle.getAddress();
  await saveDeployedAddress("PriceOracle", address);

  console.log(`Price oracle is deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
