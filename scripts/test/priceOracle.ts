import hre, { ethers } from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";

async function main() {
  const [signer] = await ethers.getSigners();

  const PriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const priceOracle = await PriceOracle.deploy();
  const priceOracleAddress = await priceOracle.getAddress();
  await saveDeployedAddress("PriceOracle", priceOracleAddress);
  console.log(`Price oracle is deployed to: ${priceOracleAddress}`);
  await priceOracle.waitForDeployment();

  const OracleCaller = await ethers.getContractFactory("TestPriceOracleCaller");
  const oracleCaller = await OracleCaller.deploy(priceOracleAddress);
  const oracleCallerAddress = await oracleCaller.getAddress();
  await saveDeployedAddress("PriceOracleCaller", oracleCallerAddress);
  console.log("PriceOracleCaller deployed to:", oracleCallerAddress);
  await oracleCaller.waitForDeployment();

  // Get deployed contract addresses
  const tx0 = await priceOracle.setCaller(oracleCallerAddress);
  await tx0.wait();
  console.log(`Set caller ${oracleCallerAddress} for price oracle ${priceOracleAddress}`);

  const time = 10;
  const tx = await oracleCaller.requestPrice(time);
  await tx.wait();
  console.log("Requested price hash:", tx.hash);

  const price = Math.floor(Math.random() * 1000); // Random price between 0 and 1000
  const tx2 = await priceOracle.fulfillPrice(time, price);
  await tx2.wait();
  console.log("Fulfilled price hash:", tx2.hash);

  const result = await oracleCaller.lastTime();
  console.log("Last time:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
