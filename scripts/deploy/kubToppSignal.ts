import hre from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Deploy KUBToppSignalPool contract
  const KUBToppSignalPool = await hre.ethers.getContractFactory("KUBTopSignalPool");

  // Get deployed contract addresses
  const priceOracleAddress = await readDeployedAddress("PriceOracle");
  const randomOracleAddress = await readDeployedAddress("RandomOracle"); 
  const ticketAddress = await readDeployedAddress("Ticket");
  
  // Contract parameters
  const feeCollector = signer.address; // TODO: Set fee collector address
  const reservePool = signer.address; // TODO: Set reserve pool address
  const maxTicketPerSlot = 1000;
  const ticketPrice = hre.ethers.parseEther("0.01"); // 0.1 KUB
  const kkubAddress = await readDeployedAddress("KKUB");
  const sdkTransferRouter = "0xAE7D33f10f09669A86e45BAA6342377aFf4cF728"; // TODO: Set SDK transfer router address
  const sdkCallHelperRouter = "0x96f4C25E4fEB02c8BCbAdb80d0088E0112F728Bc"; // TODO: Set SDK call helper router address

  const kubToppSignalPool = await KUBToppSignalPool.deploy(
    ticketAddress,
    priceOracleAddress, 
    randomOracleAddress,
    feeCollector,
    reservePool,
    maxTicketPerSlot,
    ticketPrice,
    kkubAddress,
    sdkTransferRouter,
    sdkCallHelperRouter
  );

  const address = await kubToppSignalPool.getAddress();
  await saveDeployedAddress("KUBToppSignalPool", address);

  console.log(`KUBToppSignalPool deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
