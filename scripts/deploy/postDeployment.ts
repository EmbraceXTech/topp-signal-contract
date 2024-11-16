import hre from "hardhat";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Get deployed contract addresses
  const priceOracleAddress = await readDeployedAddress("PriceOracle");
  const randomOracleAddress = await readDeployedAddress("RandomOracle");
  const signalTicketAddress = await readDeployedAddress("SignalTicket");
  const kubToppSignalAddress = await readDeployedAddress("KUBToppSignal");

  // Get contract instances
  const priceOracle = await hre.ethers.getContractAt(
    "TestPriceOracle",
    priceOracleAddress
  );
  const randomOracle = await hre.ethers.getContractAt(
    "SimpleRandomOracle",
    randomOracleAddress
  );
  const signalTicket = await hre.ethers.getContractAt(
    "SignalTicketERC1155",
    signalTicketAddress
  );

  await priceOracle.setCaller(kubToppSignalAddress);
  await randomOracle.setCaller(kubToppSignalAddress);
  await signalTicket.transferOwnership(kubToppSignalAddress);

  console.log("Post-deployment setup completed successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
