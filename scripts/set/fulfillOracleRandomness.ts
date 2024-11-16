import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimpleRandomOracle__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const randomOracleAddress = await readDeployedAddress("RandomOracle");

  const simpleRandomOracle = SimpleRandomOracle__factory.connect(
    randomOracleAddress,
    signer
  );

  const time = 10;
  const randomValue = Math.floor(Math.random() * 1000000); // Random number between 0 and 1M
  
  const tx = await simpleRandomOracle.fulfillRandomness(time, [randomValue, randomValue, randomValue]);
  await tx.wait();

  console.log("Transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
