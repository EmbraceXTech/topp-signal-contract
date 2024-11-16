import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { TestRandomOracleCaller__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const randomOracleCallerAddress = await readDeployedAddress("RandomOracleCaller");
  const testRandomOracleCaller = TestRandomOracleCaller__factory.connect(
    randomOracleCallerAddress,
    signer
  );

  const lastTime = await testRandomOracleCaller.lastTime();
  // const lastValues = await testRandomOracleCaller.lastValues(0);

  console.log("Last time:", lastTime);
  // console.log("Last random values:", lastValues);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
