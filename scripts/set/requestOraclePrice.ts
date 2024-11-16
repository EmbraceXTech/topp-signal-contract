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

  const time = 10;
  const tx = await testPriceOracleCaller.requestPrice(time);
  await tx.wait();

  const txHash = tx.hash;
  console.log("Transaction hash:", txHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
