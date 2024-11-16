import { ethers } from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const oracleAddress = await readDeployedAddress("PriceOracle");

  const OracleCaller = await ethers.getContractFactory("TestPriceOracleCaller");
  const oracleCaller = await OracleCaller.deploy(oracleAddress);

  const oracleCallerAddress = await oracleCaller.getAddress();

  await saveDeployedAddress("OracleCaller", oracleCallerAddress);
  console.log("OracleCaller deployed to:", oracleCallerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
