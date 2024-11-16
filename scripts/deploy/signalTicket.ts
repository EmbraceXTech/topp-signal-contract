import hre from "hardhat";
import { saveDeployedAddress } from "../../utils/saveDeployedAddress";

async function main() {
  const [signer] = await hre.ethers.getSigners();

  const SignalTicket = await hre.ethers.getContractFactory("SignalTicketERC1155");
  const signalTicket = await SignalTicket.deploy();
  
  const address = await signalTicket.getAddress();
  await saveDeployedAddress("SignalTicket", address);

  console.log(`Signal ticket is deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
