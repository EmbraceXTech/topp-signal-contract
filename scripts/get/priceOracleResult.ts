import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { TestPriceOracleCaller__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const priceOracleCallerAddress = await readDeployedAddress("OracleCaller");
  const testPriceOracleCaller = TestPriceOracleCaller__factory.connect(
    priceOracleCallerAddress,
    signer
  );

  const lastTime = await testPriceOracleCaller.lastTime();
  const lastPrice = await testPriceOracleCaller.lastPrice();

  console.log("Last time:", lastTime);
  console.log("Last price:", lastPrice);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
