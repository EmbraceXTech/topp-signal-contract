import hre, { ethers } from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";
import { readDeployedAddress } from "../../utils/readDeployedAddress";
import { SimpleRandomOracle__factory } from "../../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();

  const RandomOracle = await ethers.getContractFactory("SimpleRandomOracle");
  const randomOracle = await RandomOracle.deploy();
  const randomOracleAddress = await randomOracle.getAddress();
  await saveDeployedAddress("RandomOracle", randomOracleAddress);
  console.log(`Random oracle is deployed to: ${randomOracleAddress}`);
  await randomOracle.waitForDeployment();

  const OracleCaller = await ethers.getContractFactory("TestRandomOracleCaller");
  const oracleCaller = await OracleCaller.deploy(randomOracleAddress);
  const oracleCallerAddress = await oracleCaller.getAddress();
  await saveDeployedAddress("RandomOracleCaller", oracleCallerAddress);
  console.log("RandomOracleCaller deployed to:", oracleCallerAddress);
  await oracleCaller.waitForDeployment();

  // Get deployed contract addresses
  const tx0 = await randomOracle.setCaller(oracleCallerAddress);
  await tx0.wait();
  console.log(`Set caller ${oracleCallerAddress} for random oracle ${randomOracleAddress}`);

  const time = 10;
  const tx = await oracleCaller.requestRandomness(time);
  await tx.wait();
  console.log("Requested randomness hash:", tx.hash);

  const randomValue = Math.floor(Math.random() * 1000000); // Random number between 0 and 1M
  const tx2 = await randomOracle.fulfillRandomness(time, [randomValue, randomValue, randomValue]);
  await tx2.wait();
  console.log("Fulfilled randomness hash:", tx2.hash);

  const result = await oracleCaller.lastTime();
  console.log("Last time:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
