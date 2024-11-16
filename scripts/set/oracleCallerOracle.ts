import hre from "hardhat";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const oracleAddress = await readDeployedAddress("PriceOracle");
  const oracleCallerAddress = await readDeployedAddress("OracleCaller");

  const oracleCaller = await hre.ethers.getContractAt("TestPriceOracleCaller", oracleCallerAddress);
  await oracleCaller.setOracle(oracleAddress);

  console.log(`Set oracle ${oracleAddress} for oracle caller ${oracleCallerAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
