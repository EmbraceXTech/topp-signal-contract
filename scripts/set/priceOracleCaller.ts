import hre from "hardhat";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Get deployed contract addresses
  const priceOracleAddress = await readDeployedAddress("PriceOracle");

  // Get contract instances
  const priceOracle = await hre.ethers.getContractAt(
    "TestPriceOracle",
    priceOracleAddress
  );

  const priceOracleCallerAddress = await readDeployedAddress("OracleCaller");

  await priceOracle.setCaller(priceOracleCallerAddress);

  console.log("Post-deployment setup completed successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
