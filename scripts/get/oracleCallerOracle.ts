import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimplePriceOracle__factory, TestPriceOracleCaller__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const oracleCallerAddress = await readDeployedAddress("OracleCaller");
  const oracleCaller = TestPriceOracleCaller__factory.connect(
    oracleCallerAddress,
    signer
  );

  const oracleAddress = await oracleCaller.oracle();
  console.log("Oracle address:", oracleAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
