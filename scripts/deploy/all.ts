import hre, { ethers } from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";
import { readDeployedAddress } from "../../utils/readDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  // Price oracle
  const PriceOracle = await ethers.getContractFactory("TestPriceOracle");
  const priceOracle = await PriceOracle.deploy();
  const priceOracleAddress = await priceOracle.getAddress();
  await saveDeployedAddress("PriceOracle", priceOracleAddress);
  console.log(`Price oracle is deployed to: ${priceOracleAddress}`);
  await priceOracle.waitForDeployment();

  // Random oracle
  const RandomOracle = await ethers.getContractFactory("SimpleRandomOracle");
  const randomOracle = await RandomOracle.deploy();
  const randomOracleAddress = await randomOracle.getAddress();
  await saveDeployedAddress("RandomOracle", randomOracleAddress);
  console.log(`Random oracle is deployed to: ${randomOracleAddress}`);
  await randomOracle.waitForDeployment();

  // Ticket
  const SignalTicket = await hre.ethers.getContractFactory("SignalTicketERC1155");
  const signalTicket = await SignalTicket.deploy();
  const signalTicketAddress = await signalTicket.getAddress();
  await saveDeployedAddress("SignalTicket", signalTicketAddress);
  console.log(`Signal ticket is deployed to: ${signalTicketAddress}`);
  await signalTicket.waitForDeployment();

  // Deploy KUBToppSignalPool contract
  const KUBToppSignalPool = await hre.ethers.getContractFactory("KUBTopSignalPool");
  
  // Contract parameters
  const feeCollector = signer.address; // TODO: Set fee collector address
  const reservePool = signer.address; // TODO: Set reserve pool address
  const maxTicketPerSlot = 1000;
  const ticketPrice = hre.ethers.parseEther("0.01"); // 0.1 KUB
  const kkubAddress = await readDeployedAddress("KKUB");
  const sdkTransferRouter = "0xAE7D33f10f09669A86e45BAA6342377aFf4cF728"; // TODO: Set SDK transfer router address
  const sdkCallHelperRouter = "0x96f4C25E4fEB02c8BCbAdb80d0088E0112F728Bc"; // TODO: Set SDK call helper router address

  const kubToppSignalPool = await KUBToppSignalPool.deploy(
    signalTicketAddress,
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

  const toppSignalPoolAddress = await kubToppSignalPool.getAddress();
  await saveDeployedAddress("KUBToppSignalPool", toppSignalPoolAddress);
  await kubToppSignalPool.waitForDeployment();
  console.log(`KUBToppSignalPool deployed to: ${toppSignalPoolAddress}`);

  // Setup
  const tx = await priceOracle.setCaller(toppSignalPoolAddress);
  console.log(`Set caller ${toppSignalPoolAddress} for PriceOracle ${priceOracleAddress}`);
  const tx2 = await randomOracle.setCaller(toppSignalPoolAddress);
  console.log(`Set caller ${toppSignalPoolAddress} for RandomOracle ${randomOracleAddress}`);
  const tx3 = await signalTicket.transferOwnership(toppSignalPoolAddress);
  console.log(`Transfer ownership of SignalTicket ${signalTicketAddress} to ${toppSignalPoolAddress}`);
  await tx.wait();
  await tx2.wait();
  await tx3.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
