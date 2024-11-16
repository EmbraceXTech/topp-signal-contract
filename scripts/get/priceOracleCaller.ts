import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimplePriceOracle__factory, TestPriceOracleCaller__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const priceOracleAddress = await readDeployedAddress("PriceOracle");
  const simplePriceOracle = SimplePriceOracle__factory.connect(
    priceOracleAddress,
    signer
  );

  const oracleCallerAddress = await readDeployedAddress("OracleCaller");

  const callerAddress = await simplePriceOracle.caller();
  console.log("Caller address:", callerAddress);
  console.log("Oracle caller address:", oracleCallerAddress);
  console.log("Signer address:", signer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
