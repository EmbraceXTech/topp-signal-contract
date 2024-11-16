import hre from "hardhat";
import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimpleRandomOracle__factory } from "../../typechain-types";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Get deployed contract addresses
  const randomOracleAddress = await readDeployedAddress("RandomOracle");

  // Get contract instances
  const randomOracle = await SimpleRandomOracle__factory.connect(
    randomOracleAddress,
    signer
  );

  const randomOracleCallerAddress = await readDeployedAddress("RandomOracleCaller");

  await randomOracle.setCaller(randomOracleCallerAddress);

  console.log(`Set caller ${randomOracleCallerAddress} for random oracle ${randomOracleAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
