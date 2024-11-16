import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimplePriceOracle__factory } from "../../typechain-types";
import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  const priceOracleAddress = await readDeployedAddress("PriceOracle");

  const simplePriceOracle = SimplePriceOracle__factory.connect(
    priceOracleAddress,
    signer
  );

  const callerAddress = await simplePriceOracle.caller();

  await simplePriceOracle.setCaller(callerAddress);

  const time = ethers.parseEther("10");
  const price = ethers.parseEther("1"); // 1 ETH as example price
  
  const tx = await simplePriceOracle.fulfillPrice(time, price);
  await tx.wait();

  console.log("Transaction hash:", tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
