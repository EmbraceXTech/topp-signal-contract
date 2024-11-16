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

  const time = 10;

  const tx = await testRandomOracleCaller.requestRandomness(time);
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
