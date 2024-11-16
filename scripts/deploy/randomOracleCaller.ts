import { ethers } from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const oracleAddress = await readDeployedAddress("RandomOracle");

  const OracleCaller = await ethers.getContractFactory("TestRandomOracleCaller");
  const oracleCaller = await OracleCaller.deploy(oracleAddress);

  const oracleCallerAddress = await oracleCaller.getAddress();

  await saveDeployedAddress("RandomOracleCaller", oracleCallerAddress);
  console.log("RandomOracleCaller deployed to:", oracleCallerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
